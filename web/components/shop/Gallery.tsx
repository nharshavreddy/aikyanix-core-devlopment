'use client'
import {useState} from 'react'

export type GalleryImage = {src: string; thumb: string; alt: string; width: number; height: number}

// Big photo + thumbnails (vertical on desktop, a row on phones).
export default function Gallery({images, title}: {images: GalleryImage[]; title: string}) {
  const [i, setI] = useState(0)
  if (images.length === 0) {
    return (
      <div className="gallery">
        <div className="gallery-main ph"><img src="/logo.svg" alt="" /></div>
      </div>
    )
  }
  const img = images[i]
  return (
    <div className="gallery">
      {images.length > 1 && (
        <div className="gallery-thumbs" role="list">
          {images.map((t, n) => (
            <button key={t.src} type="button" role="listitem" aria-label={`Photo ${n + 1}`} aria-current={n === i} onClick={() => setI(n)}>
              <img src={t.thumb} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
      <div className="gallery-main">
        <img src={img.src} alt={img.alt || title} width={img.width} height={img.height} />
      </div>
    </div>
  )
}
