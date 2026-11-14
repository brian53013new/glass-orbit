import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'

const rawFile = new URL('../src/data/donki-cme-2024-05-10.snapshot.json', import.meta.url)
const manifestFile = new URL('../src/data/manifest.json', import.meta.url)
const [raw, manifestText] = await Promise.all([readFile(rawFile), readFile(manifestFile, 'utf8')])
const manifest = JSON.parse(manifestText)
const hash = createHash('sha256').update(raw).digest('hex')
const records = JSON.parse(raw.toString('utf8'))
const selected = records.find((record) => record.activityID === '2024-05-10T07:12:00-CME-001')

if (hash !== manifest.sha256) throw new Error(`SHA-256 mismatch: expected ${manifest.sha256}, got ${hash}`)
if (!selected) throw new Error('Expected CME record is missing from the saved DONKI snapshot.')
if (manifest.httpStatus !== 200 || !manifest.isOfflineSnapshot) throw new Error('Manifest must identify a successful offline snapshot.')

console.log(`Verified NASA DONKI snapshot: ${selected.activityID}`)
console.log(`SHA-256: ${hash}`)
