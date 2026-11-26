// Self-check for functions/api/contact.ts. Run: node scripts/contact-check.ts  (Node 22+)
// Kept outside functions/ because Cloudflare turns every file there into a route.
import assert from 'node:assert/strict'
import {onRequestPost} from '../functions/api/contact.ts'

const sent: any[] = []
globalThis.fetch = (async (_url: string, init: any) => {
  sent.push(JSON.parse(init.body))
  return new Response('{}', {status: 200})
}) as any

const env = {RESEND_API_KEY: 'test', CONTACT_TO: 'a@example.com, b@example.com', CONTACT_FROM: 'Site <site@example.com>'}
const post = (fields: Record<string, string>) => {
  const body = new FormData()
  for (const [k, v] of Object.entries(fields)) body.set(k, v)
  return onRequestPost({request: new Request('https://site.test/api/contact', {method: 'POST', body, headers: {Accept: 'application/json'}}), env})
}

const product = {type: 'product', name: 'Asha', email: 'asha@example.com', phone: '999', product: 'Sample product A', quantity: '2', options: 'Colour: Bronze'}

// valid product request -> emailed with product in subject, both recipients
assert.equal((await post(product)).status, 200)
assert.match(sent[0].subject, /Product request: Sample product A × 2/)
assert.deepEqual(sent[0].to, ['a@example.com', 'b@example.com'])
assert.equal(sent[0].reply_to, 'asha@example.com')

// missing phone, bad email, bad quantity -> rejected, nothing sent
for (const bad of [{phone: ''}, {email: 'nope'}, {quantity: 'lots'}]) {
  assert.equal((await post({...product, ...bad})).status, 400)
}
assert.equal(sent.length, 1)

// honeypot -> pretend success, nothing sent
assert.equal((await post({...product, website: 'spam'})).status, 200)
assert.equal(sent.length, 1)

// contact form: audience + name/email/company/message + consent required; phone optional
const contact = {audience: 'partner', name: 'A', email: 'a@x.co', company: 'C', message: 'Hi', consent: 'on'}
assert.equal((await post({...contact, consent: ''})).status, 400)
assert.equal((await post({...contact, audience: 'robot'})).status, 400)
assert.equal((await post({...contact, company: ''})).status, 400)
const body = new FormData()
for (const [k, v] of Object.entries(contact)) body.set(k, v)
body.append('needs', 'SAP data & analytics')
body.append('needs', 'Not sure yet')
const res = await onRequestPost({request: new Request('https://site.test/api/contact', {method: 'POST', body, headers: {Accept: 'application/json'}}), env})
assert.equal(res.status, 200)
const last = sent.at(-1)
assert.match(last.subject, /Website enquiry \(partner\): C/)
assert.match(last.text, /needs: SAP data & analytics, Not sure yet/)

console.log('contact function: all checks passed')
