import type {MetadataRoute} from 'next'
import {SITE_URL} from '@/lib/sanity'
import {config} from '@/site.config'

export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  // NOINDEX=1 builds a shareable preview that search engines must not list.
  if (config.NOINDEX) return {rules: {userAgent: '*', disallow: '/'}}
  return {rules: {userAgent: '*', allow: '/'}, sitemap: `${SITE_URL}/sitemap.xml`}
}
