import {LaunchIcon} from '@sanity/icons/Launch'
import {useClient, type DocumentActionComponent} from 'sanity'

// Website the "View on website" button opens. Change to the live domain once it is online.
const SITE = (process.env.SANITY_STUDIO_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')

type Node = {_id: string; slug?: string; parent?: string}

// Adds a "View on website" button to pages and insights. Only published content is on the site.
export const ViewOnSite: DocumentActionComponent = (props) => {
  const client = useClient({apiVersion: '2025-01-01'})
  if (!['page', 'post', 'product'].includes(props.type)) return null

  return {
    label: 'View on website',
    icon: LaunchIcon,
    disabled: !props.published,
    title: props.published ? undefined : 'Publish first — only published pages are on the website',
    onHandle: async () => {
      const doc = props.published as {slug?: {current?: string}} | null
      let path = ''
      if (props.type === 'post') {
        path = `/insights/${doc?.slug?.current ?? ''}`
      } else if (props.type === 'product') {
        path = `/products/${doc?.slug?.current ?? ''}`
      } else {
        // Same rule as the website: home page = "/", otherwise parent addresses + own address.
        const homeId = await client.fetch<string | null>(`*[_id == "siteSettings"][0].homePage._ref`)
        let id: string | undefined = props.id
        const parts: string[] = []
        for (let depth = 0; id && depth < 20; depth++) {
          if (id === homeId) break
          const node: Node | null = await client.fetch(`*[_id == $id][0]{_id, "slug": slug.current, "parent": parent._ref}`, {id})
          if (!node?.slug) break
          parts.unshift(node.slug)
          id = node.parent
        }
        path = '/' + parts.join('/')
      }
      window.open(SITE + path, '_blank', 'noopener')
      props.onComplete()
    },
  }
}
