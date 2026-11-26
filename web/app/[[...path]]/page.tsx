import type {Metadata} from 'next'
import {notFound} from 'next/navigation'
import Sections, {RichText} from '@/components/Sections'
import {ProductView} from '@/components/shop/Product'
import {getSite, imageUrl, POSTS_BASE, type Doc, type Site} from '@/lib/sanity'

// One route for every URL: pages at any depth (/, /services/data-platforms, /insights/custom-page ...)
// insight posts (/insights/<slug>) and products (/products/<slug>). They can't clash because they share this route.
export const dynamicParams = false

type Params = {params: Promise<{path?: string[]}>}

const toParam = (path: string) => ({path: path === '/' ? [] : path.slice(1).split('/')})

export async function generateStaticParams() {
  const {pages, postByPath, productByPath} = await getSite()
  return [...pages.map((p) => toParam(p.path)), ...[...postByPath.keys(), ...productByPath.keys()].map(toParam)]
}

async function load(params: Params['params']) {
  const {path} = await params
  const site = await getSite()
  const url = '/' + (path ?? []).join('/')
  const page = site.pageByPath.get(url)
  const post = page ? undefined : site.postByPath.get(url)
  const product = page || post ? undefined : site.productByPath.get(url)
  if (!page && !post && !product) notFound()
  return {site, url, page: page?.doc, post, product}
}

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const {site, url, page, post, product} = await load(params)
  const name = site.settings.siteName
  const doc = (page ?? post ?? product)!
  const ogImage = product?.images?.[0] ? imageUrl(product.images[0], 1200)?.src : undefined
  const title = doc.seoTitle || (url === '/' ? name : `${doc.title} | ${name}`)
  const description = doc.seoDescription || doc.summary || doc.lede || doc.excerpt || site.settings.defaultDescription
  return {
    title,
    description,
    alternates: {canonical: url},
    openGraph: post
      ? {title, description, url, type: 'article', publishedTime: post.publishedAt}
      : {title, description, url, images: ogImage ? [ogImage] : undefined},
    robots: process.env.NOINDEX === '1' ? {index: false, follow: false} : doc.noindex ? {index: false, follow: true} : undefined,
  }
}

export default async function Page({params}: Params) {
  const {site, page, post, product} = await load(params)
  return (
    <main id="main">
      {page ? <PageView doc={page} site={site} /> : post ? <PostView post={post} site={site} /> : <ProductView p={product!} site={site} />}
    </main>
  )
}

function PageView({doc, site}: {doc: Doc; site: Site}) {
  if (doc.layout === 'landing') return <Sections page={doc} site={site} landing />
  const crumbs = site.crumbs(doc)
  return (
    <div className="wrap page">
      {crumbs.length > 0 ? (
        <p className="crumb">
          {crumbs.map((c) => (
            <span key={c.path}><a href={c.path}>{c.title}</a> / </span>
          ))}
          {doc.title}
        </p>
      ) : (
        doc.eyebrow && <p className="eyebrow">{doc.eyebrow}</p>
      )}
      <h1>{doc.heading || doc.title}</h1>
      {doc.lede && <p className="lede">{doc.lede}</p>}
      {doc.heroButton && <p className="actions"><a className="btn dark" href={site.href(doc.heroButton)}>{doc.heroButton.label}</a></p>}
      <Sections page={doc} site={site} landing={false} />
    </div>
  )
}

function PostView({post, site}: {post: Doc; site: Site}) {
  const index = site.pageByPath.get(POSTS_BASE)
  const indexTitle = index?.doc.title ?? 'Insights'
  return (
    <article className="wrap page">
      <p className="crumb">
        <a href={POSTS_BASE}>{indexTitle}</a> / {post.kicker ?? 'Article'}
      </p>
      <h1>{post.title}</h1>
      <div className="prose">
        <RichText value={post.body} site={site} />
        <p><a href={POSTS_BASE}>All {indexTitle.toLowerCase()}</a></p>
      </div>
    </article>
  )
}
