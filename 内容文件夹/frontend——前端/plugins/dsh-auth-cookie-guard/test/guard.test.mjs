import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'
import { checkAndPrune } from '../index.js'

const CHROME_EPOCH_OFFSET_US = 11644473600000000n
const nowUs = () => BigInt(Date.now()) * 1000n + CHROME_EPOCH_OFFSET_US

const SCHEMA = `CREATE TABLE cookies(
  creation_utc INTEGER NOT NULL,
  host_key TEXT NOT NULL,
  top_frame_site_key TEXT NOT NULL,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  encrypted_value BLOB NOT NULL,
  path TEXT NOT NULL,
  expires_utc INTEGER NOT NULL,
  is_secure INTEGER NOT NULL,
  is_httponly INTEGER NOT NULL,
  last_access_utc INTEGER NOT NULL,
  has_expires INTEGER NOT NULL,
  is_persistent INTEGER NOT NULL,
  priority INTEGER NOT NULL,
  samesite INTEGER NOT NULL,
  source_scheme INTEGER NOT NULL,
  source_port INTEGER NOT NULL,
  last_update_utc INTEGER NOT NULL,
  source_type INTEGER NOT NULL,
  has_cross_site_ancestor INTEGER NOT NULL
)`

function makeDb(dir) {
  const path = join(dir, 'Cookies')
  const db = new DatabaseSync(path)
  db.exec(SCHEMA)
  db.exec('CREATE INDEX cookies_unique_index ON cookies(host_key, top_frame_site_key, name, path)')
  return { db, path }
}

function insert(db, { host = '127.0.0.1', name, value = 'v'.repeat(100), creation, expires = nowUs() + 86400000000n, hasExpires = 1 }) {
  db.prepare(`INSERT INTO cookies(
    creation_utc, host_key, top_frame_site_key, name, value, encrypted_value, path,
    expires_utc, is_secure, is_httponly, last_access_utc, has_expires, is_persistent,
    priority, samesite, source_scheme, source_port, last_update_utc, source_type, has_cross_site_ancestor
  ) VALUES (?, ?, '', ?, ?, ?, '/', ?, 0, 1, ?, ?, ?, 1, 0, 1, 62893, ?, 0, 0)`).run(
    creation, host, name, value, Buffer.alloc(0), expires, creation, hasExpires, hasExpires, creation
  )
}

function authRows(db) {
  const statement = db.prepare(`SELECT creation_utc, name FROM cookies
    WHERE host_key = '127.0.0.1' AND name LIKE 'dsh-auth-%' AND (has_expires = 0 OR expires_utc > ?)
    ORDER BY creation_utc DESC`)
  statement.setReadBigInts(true)
  return statement.all(nowUs())
}

function withTemp(fn) {
  mkdirSync(join(process.cwd(), '.auth-cookie-guard-test'), { recursive: true })
  const dir = mkdtempSync(join(process.cwd(), '.auth-cookie-guard-test', 'case-'))
  try {
    return fn(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

test('prunes excess live auth cookies and keeps the newest one', () => withTemp((dir) => {
  const { db, path } = makeDb(dir)
  try {
    const base = nowUs() - 1000000n
    for (let i = 0; i < 60; i += 1) insert(db, { name: `dsh-auth-${i}`, creation: base + BigInt(i) })
    insert(db, { host: 'localhost', name: 'dsh-auth-local', creation: base - 10n })
    insert(db, { name: 'theme', value: 'dark', creation: base })
    insert(db, { host: 'example.com', name: 'dsh-auth-foreign', creation: base })
    const expiredCreation = base - 5000000n
    insert(db, { name: 'dsh-auth-expired', creation: expiredCreation, expires: base - 1000000n })

    const result = checkAndPrune({ cookieDbPath: path, maxCookies: 50, maxHeaderBytes: 10 * 1024 * 1024 })
    assert.equal(result.state, 'pruned')
    assert.equal(result.before.cookies, 61)
    assert.equal(result.removed, 60)
    assert.equal(result.after.cookies, 1)

    const rows = authRows(db)
    assert.equal(rows.length, 1)
    assert.equal(rows[0].creation_utc, base + 59n)
    assert.equal(db.prepare("SELECT count(*) AS n FROM cookies WHERE host_key = 'example.com'").get().n, 1)
    assert.equal(db.prepare("SELECT count(*) AS n FROM cookies WHERE name = 'theme'").get().n, 1)
    assert.equal(db.prepare("SELECT count(*) AS n FROM cookies WHERE name = 'dsh-auth-expired'").get().n, 1)
  } finally {
    db.close()
  }

  const again = checkAndPrune({ cookieDbPath: path, maxCookies: 50 })
  assert.equal(again.state, 'clean')
  assert.equal(again.before.cookies, 1)
}))

test('prunes when the estimated Cookie header is over budget', () => withTemp((dir) => {
  const { db, path } = makeDb(dir)
  for (let i = 0; i < 10; i += 1) insert(db, { name: `dsh-auth-${i}`, value: 'x'.repeat(300), creation: nowUs() - BigInt(i) })
  const result = checkAndPrune({ cookieDbPath: path, maxCookies: 500, maxHeaderBytes: 1024 })
  assert.equal(result.state, 'pruned')
  assert.equal(result.after.cookies, 1)
  assert.ok(result.before.headerBytes > 1024)
  db.close()
}))

test('dry run reports the excess without changing the database', () => withTemp((dir) => {
  const { db, path } = makeDb(dir)
  try {
    for (let i = 0; i < 60; i += 1) insert(db, { name: `dsh-auth-${i}`, creation: nowUs() - BigInt(i) })
    const result = checkAndPrune({ cookieDbPath: path, maxCookies: 50, dryRun: true })
    assert.equal(result.state, 'over-limit')
    assert.equal(authRows(db).length, 60)
  } finally {
    db.close()
  }
}))

test('keepNewest 0 removes every live auth cookie', () => withTemp((dir) => {
  const { db, path } = makeDb(dir)
  for (let i = 0; i < 3; i += 1) insert(db, { name: `dsh-auth-${i}`, creation: nowUs() - BigInt(i) })
  const result = checkAndPrune({ cookieDbPath: path, maxCookies: 1, keepNewest: 0 })
  assert.equal(result.state, 'pruned')
  assert.equal(result.after.cookies, 0)
  assert.equal(authRows(db).length, 0)
  db.close()
}))

test('missing database is reported, not thrown', () => withTemp((dir) => {
  const result = checkAndPrune({ cookieDbPath: join(dir, 'nope', 'Cookies') })
  assert.equal(result.state, 'missing')
}))

test('non-database file is reported, not thrown', () => withTemp((dir) => {
  const path = join(dir, 'Cookies')
  writeFileSync(path, 'not a sqlite database')
  const result = checkAndPrune({ cookieDbPath: path })
  assert.ok(['unsupported', 'error'].includes(result.state))
  assert.ok(typeof result.error === 'string')
}))

test('a database held by an exclusive transaction is reported as locked', () => withTemp((dir) => {
  const { db, path } = makeDb(dir)
  insert(db, { name: 'dsh-auth-1', creation: nowUs() })
  insert(db, { name: 'dsh-auth-2', creation: nowUs() - 1n })
  db.exec('BEGIN EXCLUSIVE')
  try {
    const result = checkAndPrune({ cookieDbPath: path, maxCookies: 1 })
    assert.equal(result.state, 'locked')
    assert.ok(typeof result.error === 'string')
  } finally {
    db.exec('ROLLBACK')
    db.close()
  }
}))
