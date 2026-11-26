/** @type {import('next').NextConfig} */
export default {
  // ponytail: static export = plain HTML on Cloudflare Pages, rebuilt on publish.
  // Need logins / request-time pages later? Drop this line and deploy with @opennextjs/cloudflare.
  output: 'export',
  images: {unoptimized: true},
  turbopack: {root: import.meta.dirname},
}
