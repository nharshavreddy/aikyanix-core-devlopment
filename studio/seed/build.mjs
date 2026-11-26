// Writes seed/content.ndjson: the site's current content (from seed/v2.mjs) for offline preview
// (`cd web && npm run build:offline`) or for importing into an empty dataset.
// To update a live dataset, use seed/apply-v2.ts instead (it also hides pages that are not part of v2).
import {writeFileSync} from 'node:fs'
import {mainPages, settings} from './v2.mjs'

const docs = [{_id: 'siteSettings', _type: 'siteSettings', ...settings}, ...mainPages]

// Studio needs a unique _key on every object inside an array.
let n = 0
export const withKeys = (v, inArray = false) => {
  if (Array.isArray(v)) return v.map((x) => withKeys(x, true))
  if (v && typeof v === 'object') {
    const out = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, withKeys(x)]))
    if (inArray && typeof out === 'object') out._key ??= `k${(n++).toString(36)}`
    return out
  }
  return v
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL('./content.ndjson', import.meta.url), docs.map((d) => JSON.stringify(withKeys(d))).join('\n') + '\n')
  console.log(`Wrote ${docs.length} documents to seed/content.ndjson`)
}
