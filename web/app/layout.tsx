import type {Metadata} from 'next'
import {Plus_Jakarta_Sans} from 'next/font/google'
import Nav, {FloatingCta} from '@/components/Nav'
import {WishlistLink} from '@/components/shop/Wishlist'
import {getSite, SITE_URL} from '@/lib/sanity'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({subsets: ['latin'], variable: '--font-jakarta', display: 'swap'})

export async function generateMetadata(): Promise<Metadata> {
  const {settings} = await getSite()
  return {
    metadataBase: new URL(SITE_URL),
    title: settings.siteName,
    description: settings.defaultDescription,
    openGraph: {siteName: settings.siteName, type: 'website'},
    // Preview builds (NOINDEX=1): every page asks search engines not to list it.
    robots: process.env.NOINDEX === '1' ? {index: false, follow: false} : undefined,
  }
}

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const {settings: s, href, children: childPages, products, pageByPath} = await getSite()
  const servicesPage = pageByPath.get('/services')
  const serviceLinks = servicesPage ? childPages(servicesPage.doc._id) : []
  const isReal = (v?: string) => !!v && !v.startsWith('[') // placeholders like [email address] are plain text
  const hasShop = products.length > 0
  // Menu items that point at a page get a dropdown of that page's published children.
  const nav = (s.nav ?? []).map((l: any) => ({
    label: l.label,
    href: href(l),
    children: l.page?._ref ? childPages(l.page._ref).map((c) => ({label: c.doc.title, href: c.path})) : [],
  }))
  const asItem = (l: any) => l && {label: l.label, href: href(l)}
  const cta = asItem(s.headerCta)
  const floating = asItem(s.floatingCta)

  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="site-header">
          <a className="logo" href="/" aria-label={`${s.siteName} home`}>
            <img src="/logo.svg" alt="" width={34} height={32} />
            <span>{s.logoSmall ? s.siteName?.replace(new RegExp(`\\s*${s.logoSmall}$`, 'i'), '') : s.siteName} {s.logoSmall && <small>{s.logoSmall}</small>}</span>
          </a>
          <input className="nav-toggle" id="nav-toggle" type="checkbox" aria-label="Menu" />
          <label className="nav-btn" htmlFor="nav-toggle">
            <span className="nav-btn-bars"></span>
            <span style={{position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)'}}>Menu</span>
          </label>
          {hasShop && <WishlistLink />}
          <Nav items={nav} cta={cta} />
        </header>

        {children}
        {floating && <FloatingCta item={floating} />}

        <footer className="site-footer">
          <div className="wrap">
            <div className="foot-grid">
              <div>
                <img className="foot-logo" src="/logo.svg" alt="" width={48} height={46} />
                <h2>{s.siteName}</h2>
                {s.tagline && <p>{s.tagline}</p>}
                <p className="foot-contact">
                  {[s.office, ...(s.emails ?? [])].filter(Boolean).map((v: string, i: number) => (
                    <span key={v}>{i > 0 && ' | '}{isReal(v) && v.includes('@') ? <a href={`mailto:${v}`}>{v}</a> : v}</span>
                  ))}
                </p>
                {s.linkedin && (
                  <p>{isReal(s.linkedin) ? <a href={s.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">LinkedIn</a> : <>LinkedIn: {s.linkedin}</>}</p>
                )}
              </div>
              {serviceLinks.length > 0 && (
                <div>
                  <h2>Services</h2>
                  {serviceLinks.map((c) => <p key={c.path}><a href={c.path}>{c.doc.title}</a></p>)}
                </div>
              )}
              {(s.companyLinks ?? []).length > 0 && (
                <div>
                  <h2>Company</h2>
                  {s.companyLinks.map((l: any) => <p key={l._key ?? l.label}><a href={href(l)}>{l.label}</a></p>)}
                </div>
              )}
            </div>
            <div className="legal">
              <span>© {new Date().getFullYear()} {s.legalName || s.siteName}. All rights reserved.</span>
              {(s.footerLinks ?? []).map((l: any) => (
                <a key={l._key ?? l.label} href={href(l)}>{l.label}</a>
              ))}
            </div>
            {s.footerSmallPrint && <p className="foot-small">{s.footerSmallPrint}</p>}
          </div>
          {/* Build time: check this to confirm a publish actually rebuilt the site. */}
          <span hidden data-built={new Date().toISOString()} />
        </footer>
      </body>
    </html>
  )
}
