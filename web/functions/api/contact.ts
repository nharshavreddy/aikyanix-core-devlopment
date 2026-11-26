// Cloudflare Pages Function: POST /api/contact
// Handles both the contact form and product requests (type=product).
// Env vars (Cloudflare Pages > Settings > Variables, mark the key as Secret):
//   RESEND_API_KEY  - from resend.com (free tier), domain verified there
//   CONTACT_TO      - comma separated, e.g. dee@aikyanix.com,hr@aikyanix.com
//   CONTACT_FROM    - e.g. "Website <website@aikyanix.com>" (must be on the verified domain)

type Env = {RESEND_API_KEY: string; CONTACT_TO: string; CONTACT_FROM?: string}

// Resend's shared test sender works without verifying a domain (it can only deliver to the Resend account's own email).
const DEFAULT_FROM = 'Aikyanix Website <onboarding@resend.dev>'

// field -> [max length, required]
const CONTACT = {audience: [20, 1], name: [200, 1], email: [200, 1], company: [200, 1], jobTitle: [200, 0], phone: [50, 0], timeline: [50, 0], engagement: [50, 0], clientRole: [60, 0], message: [5000, 1]} as const
const PRODUCT = {name: [200, 1], email: [200, 1], phone: [50, 1], city: [200, 0], message: [3000, 0], product: [300, 1], sku: [100, 0], options: [500, 0], quantity: [5, 1], page: [500, 0]} as const
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function onRequestPost({request, env}: {request: Request; env: Env}) {
  const wantsJson = (request.headers.get('accept') || '').includes('application/json')
  const reply = (ok: boolean, status: number) => {
    if (wantsJson) return Response.json({ok}, {status})
    // No-JS fallback: send the visitor back to the page they came from.
    const back = new URL(request.headers.get('referer') || '/', request.url)
    const target = back.origin === new URL(request.url).origin ? back : new URL('/', request.url)
    target.searchParams.set(ok ? 'sent' : 'error', '1')
    return Response.redirect(target.toString(), 303)
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return reply(false, 400)
  }

  // Honeypot filled in = bot. Pretend success so it does not retry.
  if (String(form.get('website') || '')) return reply(true, 200)

  const isProduct = form.get('type') === 'product'
  const rules: Record<string, readonly [number, number]> = isProduct ? PRODUCT : CONTACT
  const data: Record<string, string> = {}
  for (const [key, [max, required]] of Object.entries(rules)) {
    const value = String(form.get(key) || '').trim()
    if (value.length > max || (required && !value)) return reply(false, 400)
    if (value) data[key] = value
  }
  if (!EMAIL.test(data.email)) return reply(false, 400)
  if (!isProduct) {
    if (!['organization', 'partner'].includes(data.audience)) return reply(false, 400)
    // "What do you need help with?" is a multi-select: several values under one name.
    const needs = form.getAll('needs').map((v) => String(v).trim()).filter(Boolean)
    if (needs.length > 10 || needs.some((v) => v.length > 60)) return reply(false, 400)
    if (needs.length) data.needs = needs.join(', ')
  }
  if (isProduct && !/^\d{1,3}$/.test(data.quantity)) return reply(false, 400)
  if (!isProduct && !form.get('consent')) return reply(false, 400)

  const subject = isProduct
    ? `Product request: ${data.product} × ${data.quantity} (${data.name})`
    : `Website enquiry (${data.audience === 'partner' ? 'partner' : 'organization'}): ${data.company}`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      from: env.CONTACT_FROM || DEFAULT_FROM,
      to: env.CONTACT_TO.split(',').map((s) => s.trim()),
      reply_to: data.email,
      subject: subject.replace(/[\r\n]/g, ' '),
      text: Object.entries(data).map(([k, v]) => `${k}: ${v}`).join('\n'),
    }),
  })
  if (!res.ok) console.error('Resend failed', res.status, await res.text())
  return reply(res.ok, res.ok ? 200 : 502)
}
