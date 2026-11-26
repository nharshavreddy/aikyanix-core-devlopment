'use client'
import {useEffect, useState} from 'react'

// Wishlist lives in each visitor's own browser (no accounts). Key holds a list of product slugs.
const KEY = 'aikyanix-wishlist'
const EVENT = 'wishlist-change'

export type WishItem = {slug: string; title: string; href: string; price: string; image?: string}

function read(): string[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

function write(slugs: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(slugs))
  } catch {
    /* storage blocked: wishlist just won't persist */
  }
  window.dispatchEvent(new Event(EVENT))
}

function useWishlist() {
  const [slugs, setSlugs] = useState<string[]>([])
  useEffect(() => {
    const sync = () => setSlugs(read())
    sync()
    window.addEventListener(EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])
  const toggle = (slug: string) => write(read().includes(slug) ? read().filter((s) => s !== slug) : [...read(), slug])
  return {slugs, toggle}
}

const Heart = ({filled}: {filled: boolean}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </svg>
)

export function WishlistButton({slug, title, withLabel = false}: {slug: string; title: string; withLabel?: boolean}) {
  const {slugs, toggle} = useWishlist()
  const on = slugs.includes(slug)
  return (
    <button
      type="button"
      className={withLabel ? 'wish-btn wish-btn-wide' : 'wish-btn'}
      aria-pressed={on}
      aria-label={on ? `Remove ${title} from wishlist` : `Add ${title} to wishlist`}
      onClick={(e) => {
        e.preventDefault()
        toggle(slug)
      }}
    >
      <Heart filled={on} />
      {withLabel && <span>{on ? 'In your wishlist' : 'Add to wishlist'}</span>}
    </button>
  )
}

// Header link with a count.
export function WishlistLink() {
  const {slugs} = useWishlist()
  return (
    <a className="wish-link" href="/wishlist" aria-label={`Wishlist (${slugs.length})`}>
      <Heart filled={slugs.length > 0} />
      {slugs.length > 0 && <span className="wish-count">{slugs.length}</span>}
    </a>
  )
}

// /wishlist page body. All products are passed in at build time; the browser picks the saved ones.
export function WishlistList({items}: {items: WishItem[]}) {
  const {slugs, toggle} = useWishlist()
  const saved = items.filter((i) => slugs.includes(i.slug))
  if (saved.length === 0) return <p className="lede">Your wishlist is empty. Tap the heart on any product to save it here.</p>
  return (
    <ul className="wish-list">
      {saved.map((i) => (
        <li key={i.slug}>
          <a href={i.href} className="wish-thumb">{i.image ? <img src={i.image} alt="" /> : <img src="/logo.svg" alt="" className="ph" />}</a>
          <a href={i.href} className="wish-title">{i.title}</a>
          <span className="wish-price">{i.price}</span>
          <button type="button" className="link-btn" onClick={() => toggle(i.slug)}>Remove</button>
        </li>
      ))}
    </ul>
  )
}
