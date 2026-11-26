import {getSite} from '@/lib/sanity'

// Cloudflare Pages redirects file, built from Site settings > Redirects.
// `npm run build` renames out/redirects.txt to out/_redirects.
export const dynamic = 'force-static'

export async function GET() {
  const {settings} = await getSite()
  const lines = (settings.redirects ?? [])
    .filter((r: any) => r.from?.startsWith('/') && r.to)
    .map((r: any) => `${r.from} ${r.to} 301`)
  return new Response(lines.join('\n') + '\n', {headers: {'Content-Type': 'text/plain'}})
}
