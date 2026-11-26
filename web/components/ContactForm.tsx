'use client'
import {useEffect, useState} from 'react'

// Posts to the Cloudflare Pages Function at /api/contact (web/functions/api/contact.ts).
// Opens with "A consulting or delivery partner" selected when the URL has ?type=partner.

const TIMELINE = ['Just exploring', 'Within 3 months', 'Within 1 month', 'Already underway']
const ENGAGEMENT = ['Defined-scope delivery', 'Embedded specialists', 'Not sure yet']
const CLIENT_ROLE = ['Behind the scenes', 'Alongside your team with the client', 'To be discussed']

type Props = {services: string[]; privacyHref: string; consent?: string; success?: string; error?: string}

export default function ContactForm({services, privacyHref, consent, success, error}: Props) {
  const [type, setType] = useState<'organization' | 'partner'>('organization')
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('type') === 'partner') setType('partner')
  }, [])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('sending')
    try {
      const res = await fetch('/api/contact', {method: 'POST', body: new FormData(e.currentTarget), headers: {Accept: 'application/json'}})
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') return <p id="sent" role="status">{success || 'Thanks, your message is with us.'}</p>

  // "Privacy Policy" inside the consent text becomes a link.
  const consentText = consent || 'I agree to Aikyanix Core storing my details to respond to this enquiry, as described in the Privacy Policy.'
  const [before, after] = consentText.split('Privacy Policy')
  const partner = type === 'partner'

  return (
    <form action="/api/contact" method="post" onSubmit={onSubmit} className="contact-form">
      <fieldset className="who">
        <legend>I am</legend>
        <label className={!partner ? 'on' : undefined}>
          <input type="radio" name="audience" value="organization" checked={!partner} onChange={() => setType('organization')} />
          An organization
        </label>
        <label className={partner ? 'on' : undefined}>
          <input type="radio" name="audience" value="partner" checked={partner} onChange={() => setType('partner')} />
          A consulting or delivery partner
        </label>
      </fieldset>

      <div className="fields">
        <label>Full name<input name="name" required maxLength={200} autoComplete="name" /></label>
        <label>Work email<input name="email" type="email" required maxLength={200} autoComplete="email" /></label>
        <label>Company<input name="company" required maxLength={200} autoComplete="organization" /></label>
        <label><span>Job title <span className="opt-label">(optional)</span></span><input name="jobTitle" maxLength={200} autoComplete="organization-title" /></label>
        <label><span>Phone <span className="opt-label">(optional)</span></span><input name="phone" type="tel" maxLength={50} autoComplete="tel" /></label>
        <label><span>Timeline <span className="opt-label">(optional)</span></span>
          <select name="timeline" defaultValue="">
            <option value="">Select</option>
            {TIMELINE.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>

        {services.length > 0 && (
          <fieldset className="wide needs">
            <legend>What do you need help with? <span className="opt-label">(optional, choose any)</span></legend>
            <div className="needs-grid">
              {services.map((s) => (
                <label key={s} className="check-pill"><input type="checkbox" name="needs" value={s} /> {s}</label>
              ))}
            </div>
          </fieldset>
        )}

        {partner && (
          <>
            <label><span>Type of engagement <span className="opt-label">(optional)</span></span>
              <select name="engagement" defaultValue="">
                <option value="">Select</option>
                {ENGAGEMENT.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
            <label><span>Client-facing role <span className="opt-label">(optional)</span></span>
              <select name="clientRole" defaultValue="">
                <option value="">Select</option>
                {CLIENT_ROLE.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </>
        )}

        <label className="wide">Message
          <textarea name="message" required maxLength={5000} placeholder="Tell us briefly about your project or opportunity." />
        </label>
        {/* Honeypot: hidden from people, bots fill it in. */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position: 'absolute', left: '-9999px'}} />
        <label className="check wide">
          <input type="checkbox" name="consent" required />
          <span>{before}{after !== undefined ? <><a href={privacyHref}>Privacy Policy</a>{after}</> : null}</span>
        </label>
      </div>
      <p><button type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message'}</button></p>
      {state === 'error' && <p role="alert">{error || 'Something went wrong and your message wasn’t sent. Please try again.'}</p>}
    </form>
  )
}
