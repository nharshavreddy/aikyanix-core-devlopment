'use client'
import {useEffect, useMemo, useRef, useState} from 'react'
import {WishlistButton} from './Wishlist'

export type OptionGroup = {name: string; values: {label: string; swatch?: string; price?: number}[]}
type Props = {
  slug: string
  title: string
  sku?: string
  price?: number
  compareAtPrice?: number
  currency: string
  stock: 'in' | 'low' | 'order' | 'out'
  options: OptionGroup[]
  dispatch?: {min?: number; max?: number}
}

const STOCK_TEXT = {in: 'In stock', low: 'Only a few units left', order: 'Made to order', out: 'Out of stock'}

// Adds N working days (Mon–Fri) to today.
function workingDaysFromNow(n: number) {
  const d = new Date()
  let left = n
  while (left > 0) {
    d.setDate(d.getDate() + 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) left--
  }
  return d.toLocaleDateString('en-IN', {month: 'short', day: 'numeric'})
}

export default function BuyBox(p: Props) {
  const money = useMemo(() => new Intl.NumberFormat('en-IN', {style: 'currency', currency: p.currency}), [p.currency])
  const [picked, setPicked] = useState<Record<string, string>>(() =>
    Object.fromEntries(p.options.filter((o) => o.values?.length).map((o) => [o.name, o.values[0].label])),
  )
  const [qty, setQty] = useState(1)
  const [dispatch, setDispatch] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [url, setUrl] = useState('')
  const dialog = useRef<HTMLDialogElement>(null)

  // Dates and the page URL depend on the visitor's clock/location: compute in the browser, not at build time.
  useEffect(() => {
    setUrl(window.location.href)
    if (p.dispatch?.min && p.dispatch?.max) setDispatch(`${workingDaysFromNow(p.dispatch.min)} – ${workingDaysFromNow(p.dispatch.max)}`)
  }, [p.dispatch?.min, p.dispatch?.max])

  // A chosen value with its own price replaces the main price.
  const price = p.options.reduce<number | undefined>((acc, o) => {
    const v = o.values?.find((x) => x.label === picked[o.name])
    return v?.price != null ? v.price : acc
  }, p.price)
  const choice = Object.entries(picked).map(([k, v]) => `${k}: ${v}`).join(', ')
  const canRequest = p.stock !== 'out'

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/contact', {method: 'POST', body: new FormData(e.currentTarget), headers: {Accept: 'application/json'}})
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  const share = encodeURIComponent(url)
  const text = encodeURIComponent(p.title)

  return (
    <div className="buybox">
      <p className="price-row">
        {price != null && <span className="price">{money.format(price)}</span>}
        {p.compareAtPrice != null && price != null && p.compareAtPrice > price && <s className="price-old">{money.format(p.compareAtPrice)}</s>}
      </p>
      <p className={`stock stock-${p.stock}`}>{STOCK_TEXT[p.stock]}</p>

      {p.options.filter((o) => o.values?.length).map((o) => (
        <fieldset key={o.name} className="opt">
          <legend>{o.name}: <strong>{picked[o.name]}</strong></legend>
          <div className="opt-values">
            {o.values.map((v) => (
              <button
                key={v.label}
                type="button"
                className={v.swatch ? 'swatch' : 'chip'}
                aria-pressed={picked[o.name] === v.label}
                aria-label={v.swatch ? v.label : undefined}
                title={v.label}
                style={v.swatch ? {background: v.swatch} : undefined}
                onClick={() => setPicked({...picked, [o.name]: v.label})}
              >
                {v.swatch ? null : v.label}
              </button>
            ))}
          </div>
        </fieldset>
      ))}

      <div className="qty" aria-label="Quantity">
        <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Less">−</button>
        <output aria-live="polite">{qty}</output>
        <button type="button" onClick={() => setQty(Math.min(99, qty + 1))} aria-label="More">+</button>
      </div>

      {dispatch && canRequest && <p className="dispatch">Estimated dispatch: <strong>{dispatch}</strong></p>}

      <button type="button" className="btn-solid" disabled={!canRequest} onClick={() => dialog.current?.showModal()}>
        {canRequest ? 'Request this product' : 'Out of stock'}
      </button>
      <WishlistButton slug={p.slug} title={p.title} withLabel />

      <div className="share" aria-label="Share">
        <span>Share</span>
        <a href={`https://wa.me/?text=${text}%20${share}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">WhatsApp</a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${share}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">Facebook</a>
        <a href={`https://twitter.com/intent/tweet?url=${share}&text=${text}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X">X</a>
        <button type="button" className="link-btn" onClick={() => navigator.clipboard?.writeText(url)}>Copy link</button>
      </div>

      <dialog ref={dialog} className="request" onClose={() => state === 'sent' && setState('idle')}>
        <button type="button" className="dialog-x" aria-label="Close" onClick={() => dialog.current?.close()}>×</button>
        {state === 'sent' ? (
          <div className="request-done">
            <h2>Request sent</h2>
            <p>Thanks. We will confirm availability, delivery and payment by email shortly.</p>
            <button type="button" className="btn-solid" onClick={() => dialog.current?.close()}>Close</button>
          </div>
        ) : (
          <form action="/api/contact" method="post" onSubmit={send}>
            <h2>Request this product</h2>
            <p className="request-sum">
              <strong>{p.title}</strong>
              {choice && <> · {choice}</>} · Qty {qty}
              {price != null && <> · {money.format(price * qty)}</>}
            </p>
            <input type="hidden" name="type" value="product" />
            <input type="hidden" name="product" value={p.title} />
            <input type="hidden" name="sku" value={p.sku ?? ''} />
            <input type="hidden" name="options" value={choice} />
            <input type="hidden" name="quantity" value={qty} />
            <input type="hidden" name="page" value={url} />
            <div className="fields">
              <label>Full name<input name="name" required maxLength={200} autoComplete="name" /></label>
              <label>Email<input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
              <label>Phone<input name="phone" type="tel" required maxLength={50} autoComplete="tel" /></label>
              <label>City / delivery area<input name="city" maxLength={200} autoComplete="address-level2" /></label>
              <label className="wide">Anything else?<textarea name="message" maxLength={3000} rows={3} /></label>
              <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position: 'absolute', left: '-9999px'}} />
            </div>
            <p><button type="submit" className="btn-solid" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send request'}</button></p>
            {state === 'error' && <p role="alert">Sorry, that did not send. Please email us directly.</p>}
            <p className="fine">No payment now. We reply with availability, delivery and a payment link.</p>
          </form>
        )}
      </dialog>
    </div>
  )
}
