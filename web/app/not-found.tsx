import {getSite} from '@/lib/sanity'

// 404 page (static export writes it to out/404.html; Cloudflare Pages serves it for unknown URLs).
export default async function NotFound() {
  const {settings: s, pages} = await getSite()
  const contact = pages.find((p) => p.path === '/contact')?.path ?? '/'
  return (
    <main id="main">
      <div className="wrap page not-found">
        <h1>{s.notFoundHeading || 'We can’t find that page.'}</h1>
        <p className="lede">{s.notFoundBody || 'It may have moved, or the link may be out of date.'}</p>
        <p className="actions">
          <a className="btn dark" href="/">Go to the homepage</a>
          <a className="btn-outline" href={contact}>Contact us</a>
        </p>
      </div>
    </main>
  )
}
