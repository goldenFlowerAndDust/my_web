/**
 * Desktop authentication-cookie guard.
 *
 * The Desktop Host listens on a random port on every launch, and
 * `@deepseek-ai/dsh-client-connection` names its browser-authentication cookie
 * `dsh-auth-<sha256(host:port)>`. Chromium scopes cookies by host, not by port,
 * so each launch adds one more cookie instead of replacing the previous one.
 * Once the accumulated `Cookie` request header exceeds Node's 16 KiB limit the
 * Host answers 431 and the Desktop reports
 * "desktop welcome: Web authentication failed" before the app can open.
 *
 * This plugin runs during Host startup, before the welcome page performs its
 * authenticated fetch, and removes the excess `dsh-auth-*` rows from the
 * Chromium cookie database. The `cookieMaxAgeDays` override in
 * cordis.patch.yml bounds growth when the database is already held open by the
 * running Electron session and cannot be cleaned here.
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

/** Defaults chosen to stay far below Node's 16 KiB request-header limit. */
const DEFAULT_MAX_COOKIES = 50
const DEFAULT_MAX_HEADER_BYTES = 10 * 1024
const DEFAULT_KEEP_NEWEST = 1
/** Microseconds between the Windows/Chromium epoch (1601) and the Unix epoch. */
const CHROME_EPOCH_OFFSET_US = 11644473600000000n
/** Cookies the browser would actually send: session cookies, or not yet expired. */
const LIVE_FILTER = '(has_expires = 0 OR expires_utc > ?)'
/** The only cookies that can overflow the welcome request header. */
const AUTH_MATCH = "host_key IN ('127.0.0.1', 'localhost') AND name LIKE 'dsh-auth-%'"

/** @returns {string} The platform's roaming application-data directory. */
function appDataDirectory() {
  if (process.platform === 'win32') return process.env.APPDATA || join(homedir(), 'AppData', 'Roaming')
  if (process.platform === 'darwin') return join(homedir(), 'Library', 'Application Support')
  return process.env.XDG_CONFIG_HOME || join(homedir(), '.config')
}

/** @returns {string} Chromium's cookie database for the Desktop default session. */
export function defaultCookieDbPath() {
  return join(appDataDirectory(), '@deepseek-ai', 'dsh-desktop', 'Network', 'Cookies')
}

/** @returns {string} Where the most recent check records its outcome. */
export function defaultStatusPath() {
  return join(appDataDirectory(), '@deepseek-ai', 'dsh-desktop', 'auth-cookie-guard', 'status.json')
}

/**
 * Convert one option to a bounded integer, falling back to a default.
 * @param {unknown} value - raw option.
 * @param {number} fallback - value used when the option is absent or invalid.
 * @param {number} minimum - smallest accepted value.
 * @returns {number} the bounded integer.
 */
function boundedInteger(value, fallback, minimum) {
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? Math.max(minimum, Math.floor(number)) : fallback
}

/**
 * Apply defaults to a row's raw config.
 * @param {unknown} config - raw plugin config.
 * @returns {object} normalized options.
 */
function normalizeConfig(config) {
  const raw = config !== null && typeof config === 'object' ? config : {}
  return {
    enabled: raw.enabled !== false,
    dryRun: raw.dryRun === true,
    maxCookies: boundedInteger(raw.maxCookies, DEFAULT_MAX_COOKIES, 1),
    maxHeaderBytes: boundedInteger(raw.maxHeaderBytes, DEFAULT_MAX_HEADER_BYTES, 1),
    keepNewest: boundedInteger(raw.keepNewest, DEFAULT_KEEP_NEWEST, 0),
    cookieDbPath: typeof raw.cookieDbPath === 'string' && raw.cookieDbPath.trim() !== '' ? raw.cookieDbPath.trim() : defaultCookieDbPath(),
    statusFile: typeof raw.statusFile === 'string' && raw.statusFile.trim() !== '' ? raw.statusFile.trim() : defaultStatusPath()
  }
}

/** @returns {bigint} Current time in Chromium's microseconds-since-1601 form. */
function chromiumNowMicroseconds() {
  return BigInt(Date.now()) * 1000n + CHROME_EPOCH_OFFSET_US
}

/**
 * Count the live authentication cookies and estimate the `Cookie` header size.
 * `max(length(value), length(encrypted_value))` covers both plaintext and
 * encrypted cookie stores without decrypting anything.
 * @param {DatabaseSync} db - open cookie database.
 * @param {bigint} nowUs - current Chromium time.
 * @returns {{ cookies: number, headerBytes: number }} live totals.
 */
function readLiveStats(db, nowUs) {
  const row = db.prepare(`
    SELECT count(*) AS cookies,
           coalesce(sum(length(name) + max(length(value), length(encrypted_value)) + 2), 0) AS headerBytes
    FROM cookies
    WHERE ${AUTH_MATCH} AND ${LIVE_FILTER}
  `).get(nowUs)
  return { cookies: Number(row.cookies), headerBytes: Number(row.headerBytes) }
}

/**
 * Inspect one cookie database and, when it is over the configured range,
 * delete the oldest authentication cookies, keeping `keepNewest`.
 * Never throws: failures become an outcome record.
 * @param {object} cfg - normalized options.
 * @returns {object} outcome record.
 */
function runCheck(cfg) {
  const result = {
    version: 1,
    checkedAt: new Date().toISOString(),
    platform: process.platform,
    dbPath: cfg.cookieDbPath,
    state: 'clean',
    thresholds: {
      maxCookies: cfg.maxCookies,
      maxHeaderBytes: cfg.maxHeaderBytes,
      keepNewest: cfg.keepNewest
    },
    before: null,
    after: null,
    removed: 0
  }

  if (!cfg.enabled) {
    result.state = 'disabled'
    return result
  }
  if (!existsSync(cfg.cookieDbPath)) {
    result.state = 'missing'
    return result
  }

  let db
  try {
    db = new DatabaseSync(cfg.cookieDbPath)
  } catch (error) {
    result.state = 'unavailable'
    result.error = String(error?.message ?? error)
    return result
  }

  try {
    db.exec('PRAGMA busy_timeout = 2000')

    let before
    try {
      before = readLiveStats(db, chromiumNowMicroseconds())
    } catch (error) {
      const message = String(error?.message ?? error)
      result.state = /locked|busy/i.test(message) ? 'locked' : 'unsupported'
      result.error = message
      return result
    }
    result.before = before
    result.after = { ...before }

    const overLimit = before.cookies > cfg.maxCookies || before.headerBytes > cfg.maxHeaderBytes
    if (!overLimit) {
      result.state = 'clean'
      return result
    }
    if (cfg.dryRun) {
      result.state = 'over-limit'
      return result
    }

    const nowUs = chromiumNowMicroseconds()
    let changes = 0
    db.exec('BEGIN IMMEDIATE')
    try {
      const deleted = db.prepare(`
        DELETE FROM cookies
        WHERE rowid IN (
          SELECT rowid FROM cookies
          WHERE ${AUTH_MATCH} AND ${LIVE_FILTER}
          ORDER BY creation_utc DESC
          LIMIT -1 OFFSET ?
        )
      `).run(nowUs, cfg.keepNewest)
      changes = Number(deleted.changes ?? 0)
      db.exec('COMMIT')
    } catch (error) {
      try {
        db.exec('ROLLBACK')
      } catch {
        // The transaction may already be gone; the original error is the useful one.
      }
      throw error
    }

    result.state = 'pruned'
    result.removed = changes
    result.after = readLiveStats(db, chromiumNowMicroseconds())
    return result
  } catch (error) {
    const message = String(error?.message ?? error)
    result.state = /locked|busy/i.test(message) ? 'locked' : 'error'
    result.error = message
    return result
  } finally {
    try {
      db.close()
    } catch {
      // A close failure cannot change the reported outcome.
    }
  }
}

/**
 * One-line outcome for the Host log; never includes cookie names or values.
 * @param {object} result - outcome record.
 * @returns {string} log line.
 */
function formatResult(result) {
  const head = `[auth-cookie-guard] ${result.state}`
  if (result.state === 'pruned') {
    const before = result.before?.cookies ?? 0
    const after = result.after?.cookies ?? 0
    return `${head}: removed ${result.removed} of ${before} dsh-auth cookies (${after} left, ~${result.after?.headerBytes ?? 0} B) at ${result.dbPath}`
  }
  if (result.state === 'clean') return `${head}: ${result.before?.cookies ?? 0} dsh-auth cookies, ~${result.before?.headerBytes ?? 0} B at ${result.dbPath}`
  if (result.state === 'over-limit') {
    return `${head}: ${result.before?.cookies ?? 0} dsh-auth cookies would be pruned (dry run)`
  }
  if (result.state === 'disabled') return `${head}: disabled`
  if (result.state === 'missing') return `${head}: no cookie database at ${result.dbPath}`
  if (result.state === 'unavailable' || result.state === 'locked') return `${head}: cookie database is held open at ${result.dbPath}; relying on cookieMaxAgeDays (${result.error})`
  return `${head}: ${result.error ?? 'no database'}`
}

/**
 * Persist the outcome for later inspection. Failure is non-fatal.
 * @param {string} path - status file.
 * @param {object} result - outcome record.
 */
function writeStatus(path, result) {
  try {
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
  } catch (error) {
    console.warn(`[auth-cookie-guard] could not write status to ${path}: ${String(error?.message ?? error)}`)
  }
}

/** Entry point: inspect and prune once, during Host startup. */
export function apply(_ctx, config) {
  const options = normalizeConfig(config)
  let result
  try {
    result = runCheck(options)
  } catch (error) {
    result = {
      version: 1,
      checkedAt: new Date().toISOString(),
      platform: process.platform,
      dbPath: '',
      state: 'error',
      error: String(error?.message ?? error)
    }
  }

  const line = formatResult(result)
  if (result.state === 'pruned') console.info(line)
  else if (result.state === 'unavailable' || result.state === 'locked' || result.state === 'error' || result.state === 'unsupported') console.warn(line)
  else console.debug(line)

  writeStatus(options.statusFile, result)
}

/**
 * Testable form of the startup check.
 * @param {object} [config] - raw plugin config.
 * @returns {object} outcome record.
 */
export function checkAndPrune(config = {}) {
  const cfg = normalizeConfig(config)
  try {
    return runCheck(cfg)
  } catch (error) {
    return {
      version: 1,
      checkedAt: new Date().toISOString(),
      platform: process.platform,
      dbPath: cfg.cookieDbPath,
      state: 'error',
      error: String(error?.message ?? error)
    }
  }
}
