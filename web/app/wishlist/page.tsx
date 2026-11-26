import type {Metadata} from 'next'
import {WishlistList} from '@/components/shop/Wishlist'
import {getSite, imageUrl} from '@/lib/sanity'

export const metadata: Metadata = {title: 'Wishlist', robots: {index: false, follow: true}}

// The list itself is read from the visitor's browser; every product is passed in so it can be shown.
export default async function Wishlist() {
  const site = await getSite()
  const items = site.products.map((p) => ({
    slug: p.slug.current,
    title: p.title,
    href: site.productPath(p),
    price: site.formatPrice(p.price),
    image: p.images?.[0] ? imageUrl(p.images[0], 300)?.src : undefined,
  }))
  return (
    <main id="main">
      <div className="wrap page">
        <p className="eyebrow">Saved</p>
        <h1>Your wishlist</h1>
        <WishlistList items={items} />
      </div>
    </main>
  )
}
