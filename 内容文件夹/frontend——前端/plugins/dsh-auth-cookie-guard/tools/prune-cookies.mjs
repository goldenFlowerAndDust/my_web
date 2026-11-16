#!/usr/bin/env node
/**
 * One-time cleanup for a Desktop that already accumulated too many auth
 * cookies. Close DeepSeek Harness completely before running this; while the
 * app is open, Electron keeps the cookie database locked.
 */
import { checkAndPrune, defaultCookieDbPath } from '../index.js'

console.log(`cookie database: ${defaultCookieDbPath()}`)
const result = checkAndPrune({ maxCookies: 1, maxHeaderBytes: 1 })
console.log(JSON.stringify(result, null, 2))

if (result.state === 'locked' || result.state === 'unavailable') {
  console.error('\nThe cookie database is in use. Quit DeepSeek Harness completely, then run this again.')
  process.exitCode = 2
} else if (result.state === 'error' || result.state === 'unsupported') {
  console.error('\nThe cookie database could not be read or cleaned.')
  process.exitCode = 1
}
