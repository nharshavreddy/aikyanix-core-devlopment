import type {MetadataRoute} from 'next'
import {getSite, SITE_URL} from '@/lib/sanity'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite()
  const pages = site.pages
    .filter((p) => !p.doc.noindex)
    .map((p) => ({url: SITE_URL + (p.path === '/' ? '' : p.path), lastModified: p.doc._updatedAt}))
  const posts = site.posts.map((p) => ({url: SITE_URL + site.postPath(p), lastModified: p._updatedAt}))
  const products = [...site.productByPath.entries()].map(([path, p]) => ({url: SITE_URL + path, lastModified: p._updatedAt}))
  return [...pages, ...posts, ...products]
}
