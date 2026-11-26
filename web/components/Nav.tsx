'use client'
import {usePathname} from 'next/navigation'
import {useEffect} from 'react'

type Item = {label: string; href: string; children?: Item[]}

const sectionOf = (href: string) => href.split('/')[1]

// Menu with dropdowns (children come from the page tree), header button, floating button.
export default function Nav({items, cta}: {items: Item[]; cta?: Item}) {
  const pathname = usePathname() || '/'
  const current = (href: string) => (href !== '/' && sectionOf(href) === sectionOf(pathname) ? 'page' : undefined)

  useEffect(() => {
    const box = document.getElementById('nav-toggle') as HTMLInputElement | null
    if (box) box.checked = false
  }, [pathname])

  return (
    <>
      <nav>
        {items.map((i) =>
          i.children?.length ? (
            <div className="nav-item has-sub" key={i.href + i.label}>
              <a href={i.href} aria-current={current(i.href)} data-nav={sectionOf(i.href)}>{i.label}</a>
              <div className="sub">
                <a href={i.href} aria-current={pathname === i.href ? 'page' : undefined}>{i.label} overview</a>
                {i.children.map((c) => (
                  <a key={c.href} href={c.href} aria-current={pathname === c.href ? 'page' : undefined}>{c.label}</a>
                ))}
              </div>
            </div>
          ) : (
            <a key={i.href + i.label} href={i.href} aria-current={current(i.href)} data-nav={sectionOf(i.href)}>{i.label}</a>
          ),
        )}
      </nav>
      {cta && (
        <a className="header-cta" href={cta.href} aria-current={current(cta.href)}>{cta.label}</a>
      )}
    </>
  )
}

// Rendered outside the header: its backdrop-filter would trap position:fixed.
export function FloatingCta({item}: {item: Item}) {
  const pathname = usePathname() || '/'
  if (pathname === item.href) return null
  return <a className="float-cta" href={item.href}>{item.label}</a>
}
