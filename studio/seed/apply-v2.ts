// Writes website content v2 (seed/v2.mjs) to the live dataset, in one transaction.
//   npm run content:apply
// - Replaces the v2 pages and the site-settings fields v2 owns.
// - Unpublishes (keeps as drafts, deletes nothing) every other page, all insights and all products.
// - Stops without changing anything if someone has unsaved drafts of pages it would replace.
import {getCliClient} from 'sanity/cli'
// @ts-expect-error plain JS seed modules
import {mainPages, settings, settingsUnset, keepPageIds} from './v2.mjs'
// @ts-expect-error plain JS seed modules
import {withKeys} from './build.mjs'

const client = getCliClient({apiVersion: '2025-01-01'})
if (client.config().projectId !== 'n6d3ezd0') throw new Error(`Refusing to run: expected the Aikyanix project, got ${client.config().projectId}`)

// A settings draft is updated with the same values (below) instead of blocking; page drafts still block.
const settingsDraft: boolean = await client.fetch(`defined(*[_id == "drafts.siteSettings"][0]._id)`)
const drafts: string[] = await client.fetch(`*[_id in $ids]._id`, {ids: keepPageIds.map((id: string) => `drafts.${id}`)})
if (drafts.length) {
  console.error('Stopped: these pages have unpublished drafts in Studio. Publish or discard them first, then run again:\n  ' + drafts.join('\n  '))
  process.exit(1)
}

const hide: {_id: string; _type: string; title?: string}[] = await client.fetch(
  `*[!(_id in path("drafts.**")) && ((_type == "page" && !(_id in $keep)) || _type in ["post", "product"])]{_id, _type, title}`,
  {keep: keepPageIds},
)
const hideIds = hide.map((d) => d._id)
const full: any[] = hideIds.length ? await client.fetch(`*[_id in $ids]`, {ids: hideIds}) : []
const existingDrafts: string[] = hideIds.length ? await client.fetch(`*[_id in $ids]._id`, {ids: hideIds.map((id) => `drafts.${id}`)}) : []

// Drafts may point at documents that are being unpublished in this same transaction.
// Studio stores draft references as weak and re-strengthens them on publish; do the same.
const typeOf: Record<string, string> = Object.fromEntries(
  (await client.fetch(`*[!(_id in path("drafts.**"))]{_id, _type}`)).map((d: any) => [d._id, d._type]),
)
const weaken = (v: any): any => {
  if (Array.isArray(v)) return v.map(weaken)
  if (v && typeof v === 'object') {
    const out = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, weaken(x)]))
    if (typeof out._ref === 'string') {
      out._weak = true
      if (typeOf[out._ref]) out._strengthenOnPublish = {type: typeOf[out._ref]}
    }
    return out
  }
  return v
}

const tx = client.transaction()
for (const page of mainPages) tx.createOrReplace(withKeys(page))
tx.patch('siteSettings', (p) => p.set(withKeys(settings)).unset(settingsUnset))
if (settingsDraft) tx.patch('drafts.siteSettings', (p) => p.set(withKeys(settings)).unset(settingsUnset))
for (const doc of full) {
  // Unpublish = keep a draft copy (unless one exists), remove the published version.
  if (!existingDrafts.includes(`drafts.${doc._id}`)) {
    const {_rev, _updatedAt, _createdAt, ...rest} = doc
    tx.create(weaken({...rest, _id: `drafts.${doc._id}`}))
  }
  tx.delete(doc._id)
}
await tx.commit()

console.log(`Replaced ${mainPages.length} pages and site settings.`)
console.log(`Unpublished ${hide.length} documents (kept as drafts, restore with Publish in Studio):`)
for (const d of hide) console.log(`  ${d._type}: ${d.title ?? d._id}`)
