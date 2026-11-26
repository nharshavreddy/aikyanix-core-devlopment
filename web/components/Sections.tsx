import {PortableText, type PortableTextComponents} from '@portabletext/react'
import ContactForm from './ContactForm'
import Icon from './Icon'
import {ProductGrid} from './shop/Product'
import {imageUrl, type Doc, type Site} from '@/lib/sanity'

type Props = {section: any; page: Doc; site: Site}

const pad = (i: number) => String(i + 1).padStart(2, '0')

// Section heading: centered with a pill label on landing pages, left-aligned on standard pages (CSS decides).
function Heading({kicker, heading, lede}: {kicker?: string; heading?: string; lede?: string}) {
  if (!kicker && !heading && !lede) return null
  return (
    <div className="sec-head">
      {kicker && <p className="pill">{kicker}</p>}
      {heading && <h2>{heading}</h2>}
      {lede && <p className="lede">{lede}</p>}
    </div>
  )
}

// Wraps the part of the heading that matches `highlight` in a sand-coloured span.
function Highlighted({text, highlight}: {text: string; highlight?: string}) {
  const i = highlight ? text.indexOf(highlight) : -1
  if (!highlight || i < 0) return <>{text}</>
  return <>{text.slice(0, i)}<span className="hl">{highlight}</span>{text.slice(i + highlight.length)}</>
}

export function RichText({value, site}: {value: any; site: Site}) {
  const components: PortableTextComponents = {
    marks: {link: ({value: v, children}) => <a href={site.href(v)}>{children}</a>},
    types: {
      image: ({value: v}) => {
        const img = imageUrl(v)
        return img ? <img src={img.src} width={img.width} height={img.height} alt={v.alt ?? ''} loading="lazy" style={{height: 'auto'}} /> : null
      },
    },
  }
  return <PortableText value={value ?? []} components={components} />
}

const renderers: Record<string, (p: Props) => React.ReactNode> = {
  hero: ({section: s, site}) => (
    <div className="hero-wrap">
      <div className="wrap hero">
        <div className="hero-copy">
          {s.eyebrow && <p className="pill">{s.eyebrow}</p>}
          <h1><Highlighted text={s.heading ?? ''} highlight={s.highlight} /></h1>
          {s.lede && <p className="lede">{s.lede}</p>}
          {s.actions?.length > 0 && (
            <div className="actions">
              {s.actions.map((a: any, i: number) => (
                <a key={a._key ?? i} className={i ? 'btn ghost' : 'btn'} href={site.href(a)}>{a.label}</a>
              ))}
            </div>
          )}
          {s.checks?.length > 0 && (
            <ul className="checks">
              {s.checks.map((c: string) => <li key={c}><Icon name="check" size={16} /> {c}</li>)}
            </ul>
          )}
        </div>
        <div className="hero-art" aria-hidden="true">
          <img src="/logo.svg" alt="" width={405} height={386} />
        </div>
      </div>
      {s.pillars?.length > 0 && (
        <div className="wrap">
          <ol className="pillar-list">
            {s.pillars.map((p: string, i: number) => (
              <li key={p}><span>{pad(i)}</span> {p}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  ),

  productGrid: ({section: s, site}) => {
    const items = site.productsIn(s.category?._ref)
    return (
      <>
        <Heading kicker={s.kicker} heading={s.heading} />
        <ProductGrid items={s.limit ? items.slice(0, s.limit) : items} site={site} />
      </>
    )
  },

  techCards: ({section: s, site}) => (
    <>
      <Heading kicker={s.kicker} heading={s.heading} />
      <div className="tech-grid">
        {(s.items ?? []).map((c: any) => {
          const body = (
            <>
              <span className="tech-mark">{c.mark}</span>
              <span className="tech-label">{c.label}</span>
              {c.text && <span className="tech-text">{c.text}</span>}
              {c.link && <span className="tech-go"><Icon name="arrow" size={20} /></span>}
            </>
          )
          const cls = `tech tech-${c.tone || 'dark'}`
          return c.link ? (
            <a key={c._key} className={cls} href={site.href(c.link)}>{body}</a>
          ) : (
            <div key={c._key} className={cls}>{body}</div>
          )
        })}
      </div>
    </>
  ),

  process: ({section: s}) => (
    <>
      <Heading kicker={s.kicker} heading={s.heading} lede={s.intro} />
      <ol className="process" style={{'--steps': s.steps?.length || 4} as React.CSSProperties}>
        {(s.steps ?? []).map((step: any, i: number) => (
          <li key={step._key ?? i}>
            <span className="step-num">{pad(i)}</span>
            <h3>{step.title}</h3>
            {step.text && <p>{step.text}</p>}
          </li>
        ))}
      </ol>
      {s.note && <p className="process-note">{s.note}</p>}
    </>
  ),

  iconGrid: ({section: s}) => (
    <>
      <Heading kicker={s.kicker} heading={s.heading} lede={s.lede} />
      <ul className={s.style === 'columns' ? 'icon-cols' : 'icon-tiles'}>
        {(s.items ?? []).map((it: any) => (
          <li key={it._key}>
            <span className="icon-box"><Icon name={it.icon} /></span>
            <span>
              <strong>{it.title}</strong>
              {it.text && <span className="icon-text">{it.text}</span>}
            </span>
          </li>
        ))}
      </ul>
    </>
  ),

  logos: ({section: s}) => (
    <>
      {s.note && <p className="fine">{s.note}</p>}
      <ul className="logos" aria-label="Client logos">
        {(s.items ?? []).map((l: string) => <li key={l}>{l}</li>)}
      </ul>
    </>
  ),

  pageIndex: ({section: s, page, site}) => {
    const kids = site.children(s.source?._ref ?? page._id)
    return (
      <>
        <Heading kicker={s.kicker} heading={s.heading} />
        {s.style === 'cards' ? (
          <div className="post-grid">
            {kids.map(({doc, path}) => (
              <a key={doc._id} className="post" href={path}>
                {doc.eyebrow && <p className="kicker">{doc.eyebrow}</p>}
                <h3>{doc.title}</h3>
                {doc.summary && <p>{doc.summary}</p>}
                {doc.bestFor && <p className="best-for"><strong>Best for:</strong> {doc.bestFor}</p>}
                <span className="more">Learn more →</span>
              </a>
            ))}
          </div>
        ) : (
          <ol className="service-index">
            {kids.map(({doc, path}, i) => (
              <li key={doc._id}>
                <a href={path}>
                  <span className="num">{pad(i)}</span>
                  <span><strong>{doc.title}</strong>{doc.summary && <em>{doc.summary}</em>}</span>
                  <span className="go">View</span>
                </a>
              </li>
            ))}
          </ol>
        )}
      </>
    )
  },

  band: ({section: s, site}) => (
    <div className={s.tone === 'sand' ? 'band band-sand' : 'band'}>
      <div className="wrap band-grid">
        {s.eyebrow && <p className="eyebrow">{s.eyebrow}</p>}
        <div>
          {s.heading && <h2>{s.heading}</h2>}
          {s.body && <p>{s.body}</p>}
          {s.link && <p style={{marginTop: '1rem'}}><a href={site.href(s.link)}>{s.link.label}</a></p>}
          {s.button && <p className="actions"><a className="btn" href={site.href(s.button)}>{s.button.label}</a></p>}
          {s.smallPrint && <p className="band-small">{s.smallPrint}</p>}
        </div>
      </div>
    </div>
  ),

  caseStudyList: ({section: s, site}) => {
    const items = s.limit ? site.caseStudies.slice(0, s.limit) : site.caseStudies
    return (
      <>
        <Heading kicker={s.kicker} heading={s.heading} />
        {s.display === 'full' ? (
          <div className="stack">
            {items.map((c) => (
              <article key={c._id}>
                {c.kicker && <p className="kicker">{c.kicker}</p>}
                <h2>{c.title}</h2>
                <div className="trio">
                  <div><h3>Challenge</h3><p>{c.challenge}</p></div>
                  <div><h3>Approach</h3><p>{c.approach}</p></div>
                  <div><h3>Result</h3><p>{c.result}</p></div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="work-grid">
            {items.map((c) => (
              <a key={c._id} className="case" href={site.href(s.link)}>
                {c.kicker && <p className="kicker">{c.kicker}</p>}
                <h3>{c.title}</h3>
                {c.summary && <p>{c.summary}</p>}
              </a>
            ))}
          </div>
        )}
      </>
    )
  },

  postList: ({section: s, site}) => {
    const items = s.limit ? site.posts.slice(0, s.limit) : site.posts
    return (
      <>
        <Heading kicker={s.kicker} heading={s.heading} />
        <div className="post-grid">
          {items.map((p) => (
            <a key={p._id} className="post" href={site.postPath(p)}>
              {p.kicker && <p className="kicker">{p.kicker}</p>}
              <h3>{p.title}</h3>
              {s.showExcerpt && p.excerpt && <p>{p.excerpt}</p>}
            </a>
          ))}
        </div>
      </>
    )
  },

  split: ({section: s, site}) => (
    <div className="split">
      <div>
        {s.heading && <h2>{s.heading}</h2>}
        <ul className="plain">{(s.items ?? []).map((i: string) => <li key={i}>{i}</li>)}</ul>
      </div>
      <aside className="aside">
        {s.asideHeading && <h2>{s.asideHeading}</h2>}
        {s.asideText && <p>{s.asideText}</p>}
        {s.asideLink && <p><a className="btn dark" href={site.href(s.asideLink)}>{s.asideLink.label}</a></p>}
      </aside>
    </div>
  ),

  textBlock: ({section: s, site}) => (
    <div className={s.withLogo ? 'text-block with-logo' : 'text-block'}>
      <div>
        {s.heading && <h2>{s.heading}</h2>}
        <div className="prose"><RichText value={s.body} site={site} /></div>
      </div>
      {s.withLogo && <img src="/logo.svg" alt="" width={405} height={386} className="text-logo" />}
    </div>
  ),

  cards: ({section: s, site}) => (
    <>
      <Heading kicker={s.kicker} heading={s.heading} lede={s.intro} />
      {s.style === 'launch' ? (
        <div className="launch">
          {(s.items ?? []).map((c: any) => (
            <article key={c._key}>
              {c.kicker && <p className="kicker">{c.kicker}</p>}
              <h2>{c.link ? <a href={site.href(c.link)}>{c.title}</a> : c.title}</h2>
              {c.text && <p>{c.text}</p>}
            </article>
          ))}
        </div>
      ) : (
        <div className="post-grid">
          {(s.items ?? []).map((c: any) => {
            const body = (
              <>
                {c.kicker && <p className="kicker">{c.kicker}</p>}
                <h3>{c.title}</h3>
                {c.text && <p>{c.text}</p>}
                {c.link?.label && <span className="more">{c.link.label} →</span>}
              </>
            )
            return c.link ? (
              <a key={c._key} className="post" href={site.href(c.link)}>{body}</a>
            ) : (
              <div key={c._key} className="post">{body}</div>
            )
          })}
        </div>
      )}
      {s.link && <p className="under-link"><a href={site.href(s.link)}>{s.link.label} →</a></p>}
    </>
  ),

  people: ({section: s}) => (
    <>
      <Heading heading={s.heading} />
      {!(s.items ?? []).length && s.intro && <p className="lede">{s.intro}</p>}
      <div className="people-grid">
        {(s.items ?? []).map((p: any) => {
          const img = imageUrl(p.photo, 240)
          return (
            <article className="person" key={p._key}>
              {img ? (
                <img className="monogram" src={img.src} alt="" width={120} height={120} style={{objectFit: 'cover'}} />
              ) : (
                <div className="monogram" aria-hidden="true">{p.name?.[0]}</div>
              )}
              <div>
                <h3>{p.name}</h3>
                {p.role && <p>{p.role}</p>}
                {p.focus && <p className="fine">{p.focus}</p>}
                {p.bio && <p className="fine">{p.bio}</p>}
                {p.linkedin && <p><a href={p.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a></p>}
              </div>
            </article>
          )
        })}
      </div>
    </>
  ),

  jobList: ({section: s, site}) =>
    site.jobs.length === 0 ? (
      <p>{s.emptyText}</p>
    ) : (
      site.jobs.map((j) => (
        <article className="job" key={j._id}>
          {j.kicker && <p className="kicker">{j.kicker}</p>}
          <h2>{j.title}</h2>
          {j.summary && <p>{j.summary}</p>}
          {j.email && <p><a href={`mailto:${j.email}`}>{j.email}</a></p>}
        </article>
      ))
    ),

  contact: ({section: s, site}) => {
    const st = site.settings
    const email = (st.emails ?? [])[0]
    const isReal = (v?: string) => !!v && !v.startsWith('[') // placeholders like [email address] are not links
    const privacy = site.pages.find((p) => /privacy/.test(p.path))?.path ?? '#'
    return (
      <div className="contact-grid">
        <div>
          {s.intro && <p className="lede contact-intro">{s.intro}</p>}
          <ContactForm
            services={st.contactServices ?? []}
            privacyHref={privacy}
            consent={s.consent}
            success={s.success}
            error={s.error}
          />
        </div>
        <aside className="direct">
          <h2>{s.directHeading || 'Other ways to reach us'}</h2>
          {(st.emails ?? []).map((e: string) => (
            <p key={e}>Email: {isReal(e) ? <a href={`mailto:${e}`}>{e}</a> : e}</p>
          ))}
          {st.phone && <p>Phone: {isReal(st.phone) ? <a href={`tel:${st.phone.replace(/\s/g, '')}`}>{st.phone}</a> : st.phone}</p>}
          {st.office && <p>Address: {st.office}</p>}
          {st.linkedin && <p>LinkedIn: {isReal(st.linkedin) ? <a href={st.linkedin} target="_blank" rel="noopener noreferrer">{st.linkedin.replace(/^https?:\/\/(www\.)?/, '')}</a> : st.linkedin}</p>}
          {!email && !st.phone && <p className="fine">Details coming soon.</p>}
        </aside>
      </div>
    )
  },

  listBlock: ({section: s}) => (
    <div className="list-block">
      {s.heading && <h2>{s.heading}</h2>}
      {s.intro && <p className="lede">{s.intro}</p>}
      <ul className={s.columns ? 'plain two-col' : 'plain'}>
        {(s.items ?? []).map((i: string) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  ),

  faq: ({section: s}) => {
    const items = (s.items ?? []).filter((q: any) => q.question && q.answer)
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: items.map((q: any) => ({'@type': 'Question', name: q.question, acceptedAnswer: {'@type': 'Answer', text: q.answer}})),
    }
    return (
      <div className="faq">
        <Heading heading={s.heading || 'Common questions'} />
        {items.map((q: any) => (
          <details key={q._key}>
            <summary>{q.question}</summary>
            <p>{q.answer}</p>
          </details>
        ))}
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd).replace(/</g, '\\u003c')}} />
      </div>
    )
  },

  // The label is required and always rendered: these are made-up examples, never client case studies.
  illustrative: ({section: s}) => (
    <div className="illustrative">
      <Heading heading={s.heading} />
      <p className="illus-label">{s.label || 'Illustrative scenario, not a client project.'}</p>
      <div className="illus-grid">
        {(s.items ?? []).map((t: string, i: number) => (
          <figure key={i} className="illus">
            <span className="illus-tag">Illustrative</span>
            <p>{t}</p>
          </figure>
        ))}
      </div>
    </div>
  ),

  cta: ({section: s, site}) => (
    <div className="cta">
      {s.heading && <h2>{s.heading}</h2>}
      {s.body && <p>{s.body}</p>}
      {s.button && <a className="btn" href={site.href(s.button)}>{s.button.label}</a>}
    </div>
  ),

  badges: ({section: s}) => (
    <div className="badges">
      <Heading heading={s.heading} />
      <ul>{(s.items ?? []).map((b: string) => <li key={b}>{b}</li>)}</ul>
      {s.smallPrint && <p className="fine">{s.smallPrint}</p>}
    </div>
  ),

  smallPrint: ({section: s}) => <p className="small-print">{s.text}</p>,
}

// Landing layout: every section is full width with its own container. Hero and band bring their own.
const OWN_WRAPPER = new Set(['hero', 'band'])

export default function Sections({page, site, landing}: {page: Doc; site: Site; landing: boolean}) {
  return (page.sections ?? []).map((section: any, i: number) => {
    const render = renderers[section._type]
    if (!render) return null // unknown or removed section type: skip instead of failing the build
    const node = render({section, page, site})
    const key = section._key ?? i
    if (OWN_WRAPPER.has(section._type)) return <div key={key}>{node}</div>
    if (!landing) return <div key={key} className={section.dark ? 'tone-dark inset' : undefined}>{node}</div>
    // "Dark background" ticked in Studio: full-width dark band around the section.
    if (section.dark) return <div key={key} className="tone-dark"><div className="wrap section">{node}</div></div>
    return <div key={key} className="wrap section">{node}</div>
  })
}
