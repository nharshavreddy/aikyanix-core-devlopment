// Sample shop content (placeholders to replace in Studio).
// `node seed/shop.mjs` writes seed/shop.ndjson; import with `npm run seed:shop` (adds only missing documents).
import {writeFileSync} from 'node:fs'

const ref = (id) => ({_type: 'reference', _ref: id})
const slug = (s) => ({_type: 'slug', current: s})
const text = (...paras) => paras.map((p) => ({_type: 'block', style: 'normal', markDefs: [], children: [{_type: 'span', text: p, marks: []}]}))

const tabs = [
  {_type: 'productTab', title: 'Description', body: text('Placeholder description. Write what the product is, what it is made of and why someone would want it.')},
  {_type: 'productTab', title: 'Dimensions & care', body: text('Placeholder. Size, weight and how to look after it.')},
  {_type: 'productTab', title: 'Delivery & returns', body: text('Placeholder. Where you deliver, how long it takes and the returns policy.')},
  {_type: 'productTab', title: 'Support', body: text('Questions about this product? Email us and we will help.')},
]

const product = (id, n, cat, price, extra = {}) => ({
  _id: id, _type: 'product', title: `Sample product ${n}`, slug: slug(`sample-product-${n.toLowerCase()}`),
  category: ref(cat), price, sku: `SAMPLE-${n}`, brand: 'Aikyanix', stock: 'in', dispatch: {min: 3, max: 6},
  summary: 'Placeholder product. Replace the name, photos, price and text in Sanity Studio → Shop: products.',
  tabs, ...extra,
})

export const shopDocs = [
  {_id: 'cat-a', _type: 'productCategory', title: 'Sample category A', slug: slug('sample-category-a')},
  {_id: 'cat-b', _type: 'productCategory', title: 'Sample category B', slug: slug('sample-category-b')},

  product('product-sample-a', 'A', 'cat-a', 20149, {
    badge: 'New', stock: 'low',
    options: [
      {_type: 'productOption', name: 'Colour', values: [
        {_type: 'optionValue', label: 'Off White', swatch: '#F2EEE6'},
        {_type: 'optionValue', label: 'Sand', swatch: '#C4A57A'},
        {_type: 'optionValue', label: 'Bronze', swatch: '#654C32', price: 21999},
      ]},
      {_type: 'productOption', name: 'Size', values: [{_type: 'optionValue', label: 'Medium'}, {_type: 'optionValue', label: 'Large', price: 24999}]},
    ],
    reviews: [
      {_type: 'review', name: 'Sample customer', rating: 5, text: 'Placeholder review. Add real reviews customers send you.', date: '2026-10-12'},
      {_type: 'review', name: 'Another customer', rating: 4, text: 'Placeholder review.', date: '2026-09-30'},
    ],
  }),
  product('product-sample-b', 'B', 'cat-a', 12998, {compareAtPrice: 14999, badge: 'Sale'}),
  product('product-sample-c', 'C', 'cat-b', 5499, {stock: 'order', dispatch: {min: 10, max: 15}}),
  product('product-sample-d', 'D', 'cat-b', 56999, {stock: 'out'}),

  {
    _id: 'page-shop', _type: 'page', title: 'Shop', slug: slug('shop'), order: 0,
    eyebrow: 'Shop', heading: 'Shop', lede: 'Placeholder intro for the shop. Every product can be requested; we confirm availability and delivery by email.',
    sections: [{_type: 'productGrid'}],
  },
  {
    _id: 'page-shop-cat-a', _type: 'page', title: 'Sample category A', slug: slug('sample-category-a'), parent: ref('page-shop'), order: 1,
    sections: [{_type: 'productGrid', category: ref('cat-a')}],
  },
  {
    _id: 'page-shop-cat-b', _type: 'page', title: 'Sample category B', slug: slug('sample-category-b'), parent: ref('page-shop'), order: 2,
    sections: [{_type: 'productGrid', category: ref('cat-b')}],
  },
]

let n = 0
export const withKeys = (v, inArray = false) => {
  if (Array.isArray(v)) return v.map((x) => withKeys(x, true))
  if (v && typeof v === 'object') {
    const out = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, withKeys(x)]))
    if (inArray) out._key ??= `s${(n++).toString(36)}` // Studio needs a _key on every object in an array
    return out
  }
  return v
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(new URL('./shop.ndjson', import.meta.url), shopDocs.map((d) => JSON.stringify(withKeys(d))).join('\n') + '\n')
  console.log(`Wrote ${shopDocs.length} shop documents to seed/shop.ndjson`)
}
