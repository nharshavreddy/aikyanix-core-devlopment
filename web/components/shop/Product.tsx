import {RichText} from '../Sections'
import BuyBox from './BuyBox'
import Gallery from './Gallery'
import {WishlistButton} from './Wishlist'
import {fileUrl, imageUrl, SITE_URL, type Doc, type Site} from '@/lib/sanity'

const STOCK_SCHEMA = {in: 'InStock', low: 'LimitedAvailability', order: 'PreOrder', out: 'OutOfStock'} as const

export function ProductCard({p, site}: {p: Doc; site: Site}) {
  const [first, second] = (p.images ?? []).map((i: any) => imageUrl(i, 700))
  return (
    <a className="pcard" href={site.productPath(p)}>
      <span className="pcard-img">
        {first ? (
          <>
            <img src={first.src} alt={p.images[0].alt || p.title} loading="lazy" width={first.width} height={first.height} />
            {second && <img className="pcard-alt" src={second.src} alt="" loading="lazy" />}
          </>
        ) : (
          <img className="ph" src="/logo.svg" alt="" />
        )}
        {p.stock === 'out' ? <span className="pbadge pbadge-out">Out of stock</span> : p.badge && <span className="pbadge">{p.badge}</span>}
        <WishlistButton slug={p.slug.current} title={p.title} />
      </span>
      <span className="pcard-title">{p.title}</span>
      <span className="pcard-price">
        {site.formatPrice(p.price)}
        {p.compareAtPrice > p.price && <s>{site.formatPrice(p.compareAtPrice)}</s>}
      </span>
    </a>
  )
}

export function ProductGrid({items, site}: {items: Doc[]; site: Site}) {
  if (items.length === 0) return <p className="fine">No products here yet.</p>
  return <div className="pgrid">{items.map((p) => <ProductCard key={p._id} p={p} site={site} />)}</div>
}

const Stars = ({n}: {n: number}) => (
  <span className="stars" aria-label={`${n.toFixed(1)} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => <span key={i} className={i <= Math.round(n) ? 'on' : undefined}>★</span>)}
  </span>
)

export function ProductView({p, site}: {p: Doc; site: Site}) {
  const category = site.categoryOf(p)
  const shop = site.settings.shopPage?._ref ? site.pages.find((x) => x.doc._id === site.settings.shopPage._ref) : undefined
  const images = (p.images ?? [])
    .map((i: any) => {
      const big = imageUrl(i, 1400)
      const thumb = imageUrl(i, 200)
      return big && thumb ? {src: big.src, thumb: thumb.src, alt: i.alt ?? '', width: big.width, height: big.height} : null
    })
    .filter(Boolean)
  const reviews: any[] = p.reviews ?? []
  const avg = reviews.length ? reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length : 0
  const related = site.relatedTo(p)

  // Google "Product" rich result data.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    sku: p.sku,
    brand: p.brand ? {'@type': 'Brand', name: p.brand} : undefined,
    description: p.summary,
    image: images.map((i: any) => i.src),
    url: SITE_URL + site.productPath(p),
    offers: p.price != null ? {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: site.settings.currency || 'INR',
      availability: `https://schema.org/${STOCK_SCHEMA[p.stock as keyof typeof STOCK_SCHEMA] ?? 'InStock'}`,
    } : undefined,
    aggregateRating: reviews.length ? {'@type': 'AggregateRating', ratingValue: avg.toFixed(1), reviewCount: reviews.length} : undefined,
  }

  return (
    <>
      <div className="wrap product">
        <p className="crumb">
          {shop && <><a href={shop.path}>{shop.doc.title}</a> / </>}
          {category && <>{category.title} / </>}
          {p.title}
        </p>
        <div className="product-grid">
          <Gallery images={images as any} title={p.title} />
          <div className="product-info">
            {p.badge && <p className="pill">{p.badge}</p>}
            <h1>{p.title}</h1>
            <p className="product-meta">
              {p.sku && <span>SKU: {p.sku}</span>}
              {reviews.length > 0 && <a href="#reviews"><Stars n={avg} /> {reviews.length} review{reviews.length > 1 ? 's' : ''}</a>}
            </p>
            {p.summary && <p className="product-summary">{p.summary}</p>}
            <BuyBox
              slug={p.slug.current}
              title={p.title}
              sku={p.sku}
              price={p.price}
              compareAtPrice={p.compareAtPrice}
              currency={site.settings.currency || 'INR'}
              stock={p.stock || 'in'}
              options={p.options ?? []}
              dispatch={p.dispatch}
            />
            {(p.tabs ?? []).length > 0 && (
              <div className="ptabs">
                {p.tabs.map((t: any, n: number) => {
                  const file = fileUrl(t.file)
                  return (
                    <details key={t._key} open={n === 0}>
                      <summary>{t.title}</summary>
                      <div className="prose">
                        <RichText value={t.body} site={site} />
                        {file && <p><a className="download" href={file} target="_blank" rel="noopener">Download ↓</a></p>}
                      </div>
                    </details>
                  )
                })}
              </div>
            )}
            <dl className="product-facts">
              {category && <><dt>Category</dt><dd>{category.title}</dd></>}
              {p.brand && <><dt>Brand</dt><dd>{p.brand}</dd></>}
            </dl>
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <section id="reviews" className="wrap section reviews">
          <div className="sec-head">
            <p className="pill">Reviews</p>
            <h2>What customers say</h2>
            <p className="lede"><Stars n={avg} /> {avg.toFixed(1)} out of 5 · {reviews.length} review{reviews.length > 1 ? 's' : ''}</p>
          </div>
          <div className="review-grid">
            {reviews.map((r) => (
              <figure key={r._key} className="review">
                <Stars n={r.rating || 0} />
                {r.text && <blockquote>{r.text}</blockquote>}
                <figcaption>{r.name}{r.date && <> · {new Date(r.date).toLocaleDateString('en-IN', {month: 'short', year: 'numeric'})}</>}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="wrap section">
          <div className="sec-head"><h2 className="caps">You may also like</h2></div>
          <ProductGrid items={related} site={site} />
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')}} />
    </>
  )
}
