import {readFileSync} from 'node:fs'
import {join} from 'node:path'
import {createClient} from '@sanity/client'

export type Doc = {_id: string; _type: string; [k: string]: any}
export type Link = {label?: string; page?: {_ref: string}; url?: string}
export type PageEntry = {doc: Doc; path: string}

const projectId = process.env.SANITY_PROJECT_ID
const dataset = process.env.SANITY_DATASET || 'production'
const offline = process.env.SANITY_OFFLINE === '1'

export const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '')
if (!SITE_URL) throw new Error('SITE_URL is not set (e.g. https://aikyanix.com). Needed for canonical URLs and sitemap.')

// ponytail: posts live under /insights. Make it a setting if the blog ever moves.
export const POSTS_BASE = '/insights'
export const PRODUCTS_BASE = '/products'

// ponytail: the whole site is one query. Fine for hundreds of documents;
// split per type if the dataset grows into the thousands.
async function fetchDocs(): Promise<Doc[]> {
  if (offline) {
    // Build from the seed file without a Sanity project (local preview only).
    return readFileSync(join(process.cwd(), '../studio/seed/content.ndjson'), 'utf8')
      .trim()
      .split('\n')
      .map((l) => JSON.parse(l))
      .filter((d: Doc) => !d._id.startsWith('drafts.'))
  }
  if (!projectId) throw new Error('SANITY_PROJECT_ID is not set (or use SANITY_OFFLINE=1 for a local preview).')
  const client = createClient({
    projectId,
    dataset,
    apiVersion: '2025-01-01',
    useCdn: false,
    perspective: 'published', // drafts never reach the site
    token: process.env.SANITY_READ_TOKEN, // only needed if the dataset is private
  })
  // Note: Next keeps fetch responses in .next/cache/fetch-cache between builds;
  // `npm run build` deletes it first so every build gets fresh content.
  return client.fetch(`*[_type in ["page", "post", "caseStudy", "job", "product", "productCategory", "siteSettings"]]`)
}

function buildSite(docs: Doc[]) {
  const byId = new Map(docs.map((d) => [d._id, d]))
  const settings: Doc = docs.find((d) => d._type === 'siteSettings') ?? {_id: 'siteSettings', _type: 'siteSettings'}
  const homeId: string | undefined = settings.homePage?._ref

  // Page URL = its parents' slugs + its own. Null when a parent is unpublished (page is skipped).
  const pathCache = new Map<string, string | null>()
  function pathOf(page: Doc, seen: string[] = []): string | null {
    if (page._id === homeId) return '/'
    if (pathCache.has(page._id)) return pathCache.get(page._id)!
    if (seen.includes(page._id)) throw new Error(`Page parent loop: ${[...seen, page._id].join(' -> ')}`)
    const slug = page.slug?.current
    let result: string | null = null
    if (slug) {
      const parentRef = page.parent?._ref
      if (!parentRef || parentRef === homeId) result = `/${slug}`
      else {
        const parent = byId.get(parentRef)
        const base = parent && pathOf(parent, [...seen, page._id])
        if (base) result = `${base}/${slug}`
        else console.warn(`Skipping "${page.title}": its parent page is not published.`)
      }
    }
    pathCache.set(page._id, result)
    return result
  }

  const pages: PageEntry[] = docs
    .filter((d) => d._type === 'page')
    .map((doc) => ({doc, path: pathOf(doc)}))
    .filter((p): p is PageEntry => p.path !== null)
  const pageByPath = new Map(pages.map((p) => [p.path, p]))
  const pathById = new Map(pages.map((p) => [p.doc._id, p.path]))

  const byOrder = (a: Doc, b: Doc) => (a.order ?? 999) - (b.order ?? 999) || String(a.title).localeCompare(String(b.title))
  const posts = docs
    .filter((d) => d._type === 'post' && d.slug?.current)
    .sort((a, b) => String(b.publishedAt ?? '').localeCompare(String(a.publishedAt ?? '')))
  const caseStudies = docs.filter((d) => d._type === 'caseStudy').sort(byOrder)
  const jobs = docs.filter((d) => d._type === 'job').sort(byOrder)

  const postPath = (post: Doc) => `${POSTS_BASE}/${post.slug.current}`

  function href(link?: Link): string {
    if (!link) return '#'
    const ref = link.page?._ref
    if (ref) {
      if (pathById.has(ref)) return pathById.get(ref)!
      const target = byId.get(ref)
      if (target?._type === 'post' && target.slug?.current) return postPath(target)
      return '#' // linked page is unpublished
    }
    return link.url || '#'
  }

  const children = (pageId: string) =>
    pages.filter((p) => p.doc.parent?._ref === pageId).sort((a, b) => byOrder(a.doc, b.doc))

  // Ancestors, top first, for breadcrumbs. Home is never shown.
  function crumbs(page: Doc): {title: string; path: string}[] {
    const out = []
    let ref = page.parent?._ref
    while (ref && ref !== homeId && pathById.has(ref)) {
      const p = byId.get(ref)!
      out.unshift({title: p.title, path: pathById.get(ref)!})
      ref = p.parent?._ref
    }
    return out
  }

  // Posts share the URL space with pages; a page at the same path wins.
  const postByPath = new Map<string, Doc>()
  for (const post of posts) {
    const path = postPath(post)
    if (pageByPath.has(path)) console.warn(`Insight "${post.title}" hidden: a page already uses ${path}`)
    else postByPath.set(path, post)
  }

  // ---------- shop ----------
  const products = docs.filter((d) => d._type === 'product' && d.slug?.current).sort((a, b) => String(a.title).localeCompare(String(b.title)))
  const productPath = (p: Doc) => `${PRODUCTS_BASE}/${p.slug.current}`
  const productByPath = new Map<string, Doc>()
  for (const p of products) {
    const path = productPath(p)
    if (pageByPath.has(path)) console.warn(`Product "${p.title}" hidden: a page already uses ${path}`)
    else productByPath.set(path, p)
  }
  const categoryOf = (p: Doc): Doc | undefined => (p.category?._ref ? byId.get(p.category._ref) : undefined)
  const productsIn = (categoryId?: string) => (categoryId ? products.filter((p) => p.category?._ref === categoryId) : products)

  // "You may also like": hand-picked first, then same category, then anything else. Max 4.
  function relatedTo(p: Doc): Doc[] {
    const picked = (p.related ?? []).map((r: {_ref: string}) => byId.get(r._ref)).filter((d: Doc | undefined): d is Doc => !!d?.slug?.current)
    const pool = [...picked, ...productsIn(p.category?._ref), ...products]
    return [...new Map(pool.filter((d) => d._id !== p._id).map((d) => [d._id, d])).values()].slice(0, 4)
  }

  const money = new Intl.NumberFormat('en-IN', {style: 'currency', currency: settings.currency || 'INR'})
  const formatPrice = (n?: number | null) => (n == null ? '' : money.format(n))

  return {
    settings, pages, pageByPath, posts, postByPath, caseStudies, jobs, href, postPath, children, crumbs,
    products, productByPath, productPath, categoryOf, productsIn, relatedTo, formatPrice,
  }
}

export type Site = ReturnType<typeof buildSite>

// Build: fetch once and reuse for every page. Dev (`npm run dev`): fetch on every request,
// so a browser refresh shows what was just published in Studio.
let cache: Promise<Site> | undefined
export const getSite = () =>
  process.env.NODE_ENV === 'development' ? fetchDocs().then(buildSite) : (cache ??= fetchDocs().then(buildSite))

// Sanity image ref "image-<id>-<w>x<h>-<ext>" -> CDN URL. Avoids an extra dependency.
export function imageUrl(image: any, width = 1200) {
  const ref: string | undefined = image?.asset?._ref
  if (!ref || !projectId) return null
  const [, id, size, ext] = ref.split('-')
  const [w, h] = size.split('x').map(Number)
  return {src: `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${size}.${ext}?w=${width}&auto=format`, width: w, height: h}
}

// Sanity file ref "file-<id>-<ext>" -> download URL.
export function fileUrl(file: any) {
  const ref: string | undefined = file?.asset?._ref
  if (!ref || !projectId) return null
  const [, id, ext] = ref.split('-')
  return `https://cdn.sanity.io/files/${projectId}/${dataset}/${id}.${ext}`
}
