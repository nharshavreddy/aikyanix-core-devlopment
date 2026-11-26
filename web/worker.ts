// Worker entry for Cloudflare Workers deployments (see /wrangler.jsonc).
// Static files are served by Cloudflare before this runs; only requests with no matching file reach it.
// The contact form logic is shared with the Pages Function in functions/api/contact.ts.
import {onRequestPost} from './functions/api/contact'

type Env = {ASSETS: {fetch: (req: Request) => Promise<Response>}; RESEND_API_KEY: string; CONTACT_TO: string; CONTACT_FROM?: string}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const {pathname} = new URL(request.url)
    if (pathname === '/api/contact') {
      if (request.method !== 'POST') return new Response('Method not allowed', {status: 405, headers: {Allow: 'POST'}})
      return onRequestPost({request, env})
    }
    return env.ASSETS.fetch(request)
  },
}
