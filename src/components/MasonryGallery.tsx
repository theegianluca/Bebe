'use client'

import { useState, useRef, useEffect } from 'react'

interface Item {
  id: string
  type: 'image' | 'text'
  image_url?: string
  content?: string
  title?: string
  source?: string
  year?: number
}

interface Scattered {
  id: string
  image_url: string
  title?: string
  x: number
  y: number
  width: number
  rotation: number
  zIndex: number
}

export function MasonryGallery({ items }: { items: Item[] }) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [scattered, setScattered] = useState<Scattered[]>([])

  // Drag state — all stored in refs to avoid stale closures in event listeners
  const pendingRef = useRef<{ item: Item; rect: DOMRect; startX: number; startY: number } | null>(null)
  const activeIdRef = useRef<string | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const didDragRef = useRef(false)
  const zRef = useRef(10)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // Start drag once threshold exceeded
      if (pendingRef.current) {
        const { item, rect, startX, startY } = pendingRef.current
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        if (Math.sqrt(dx * dx + dy * dy) > 6) {
          if (item.type !== 'image' || !item.image_url) { pendingRef.current = null; return }
          didDragRef.current = true
          const id = `${item.id}-${Date.now()}`
          const z = ++zRef.current
          const rotation = (Math.random() - 0.5) * 12
          offsetRef.current = { x: startX - rect.left, y: startY - rect.top }
          activeIdRef.current = id
          pendingRef.current = null
          setScattered(prev => [...prev, {
            id,
            image_url: item.image_url!,
            title: item.title,
            x: rect.left,
            y: rect.top,
            width: Math.min(rect.width * 1.1, 480),
            rotation,
            zIndex: z
          }])
        }
      }

      // Move active scatter
      if (activeIdRef.current) {
        const id = activeIdRef.current
        const { x: ox, y: oy } = offsetRef.current
        setScattered(prev => prev.map(s =>
          s.id === id ? { ...s, x: e.clientX - ox, y: e.clientY - oy } : s
        ))
      }
    }

    const onUp = () => {
      pendingRef.current = null
      activeIdRef.current = null
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  // ESC clears all scattered
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setScattered([])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleGalleryMouseDown = (e: React.MouseEvent, item: Item) => {
    if (item.type !== 'image' || e.button !== 0) return
    e.preventDefault()
    didDragRef.current = false
    pendingRef.current = {
      item,
      rect: (e.currentTarget as HTMLElement).getBoundingClientRect(),
      startX: e.clientX,
      startY: e.clientY
    }
  }

  const handleGalleryClick = (item: Item) => {
    if (didDragRef.current) { didDragRef.current = false; return }
    setSelectedItem(item)
  }

  const handleScatterMouseDown = (e: React.MouseEvent, s: Scattered) => {
    e.preventDefault()
    e.stopPropagation()
    const z = ++zRef.current
    offsetRef.current = { x: e.clientX - s.x, y: e.clientY - s.y }
    activeIdRef.current = s.id
    setScattered(prev => prev.map(sc => sc.id === s.id ? { ...sc, zIndex: z } : sc))
  }

  return (
    <>
      {/* Hint */}
      {items.some(i => i.type === 'image') && (
        <p style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'clamp(32px, 5vw, 60px)', opacity: 0.6 }}>
          DRAG IMAGES TO SCATTER · DOUBLE-CLICK TO REMOVE · ESC TO CLEAR
        </p>
      )}

      <div className="masonry">
        {items.map((item) => (
          <div
            key={item.id}
            className="masonry-item"
            onMouseDown={(e) => handleGalleryMouseDown(e, item)}
            onClick={() => handleGalleryClick(item)}
            style={{ cursor: item.type === 'image' ? 'grab' : 'pointer', userSelect: 'none' }}
          >
            {item.type === 'image' ? (
              <div className="gallery-card">
                <img
                  src={item.image_url}
                  alt={item.title || ''}
                  draggable={false}
                  style={{ width: '100%', display: 'block', transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)', pointerEvents: 'none' }}
                />
                <div className="gallery-overlay">
                  {item.title && (
                    <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '6px' }}>
                      {item.title}
                    </p>
                  )}
                  <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                    {item.source}{item.year ? ` — ${item.year}` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                padding: 'clamp(32px, 5vw, 60px)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                minHeight: '260px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: '20px'
              }}>
                {item.title && (
                  <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.6rem)', color: 'var(--accent)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700, lineHeight: 1.1 }}>
                    {item.title}
                  </h3>
                )}
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text)', lineHeight: 1.9 }}>
                  {item.content}
                </p>
                {item.source && (
                  <p style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    — {item.source}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scattered floating images */}
      {scattered.map(s => (
        <div
          key={s.id}
          onMouseDown={e => handleScatterMouseDown(e, s)}
          onDoubleClick={() => setScattered(prev => prev.filter(sc => sc.id !== s.id))}
          style={{
            position: 'fixed',
            left: s.x,
            top: s.y,
            width: s.width,
            transform: `rotate(${s.rotation}deg)`,
            transformOrigin: 'center top',
            zIndex: s.zIndex,
            cursor: activeIdRef.current === s.id ? 'grabbing' : 'grab',
            userSelect: 'none',
            filter: 'drop-shadow(0 12px 40px rgba(0,0,0,0.8)) drop-shadow(0 0 1px rgba(255,255,255,0.1))',
            transition: activeIdRef.current === s.id ? 'none' : 'filter 0.2s ease'
          }}
        >
          <img
            src={s.image_url}
            alt={s.title || ''}
            draggable={false}
            style={{ width: '100%', display: 'block', pointerEvents: 'none' }}
          />
        </div>
      ))}

      {/* Lightbox modal */}
      {selectedItem && (
        <div
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            backgroundColor: 'rgba(0,0,0,0.97)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(40px, 6vw, 100px)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <button
            onClick={() => setSelectedItem(null)}
            className="back-link"
            style={{ position: 'absolute', top: 'clamp(24px, 4vw, 48px)', right: 'clamp(24px, 4vw, 48px)', color: 'var(--muted)' }}
          >
            [CLOSE ×]
          </button>

          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '92vw', maxHeight: '84vh', position: 'relative' }}>
            {selectedItem.type === 'image' ? (
              <img src={selectedItem.image_url} alt={selectedItem.title || ''} style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} />
            ) : (
              <div style={{ padding: 'clamp(40px, 6vw, 80px)', backgroundColor: 'var(--surface)', border: '1px solid var(--accent)', maxWidth: '680px' }}>
                {selectedItem.title && <h2 style={{ color: 'var(--accent)', marginBottom: '24px', fontSize: 'clamp(1.2rem, 3vw, 2rem)', fontWeight: 700 }}>{selectedItem.title}</h2>}
                <p style={{ lineHeight: 1.9 }}>{selectedItem.content}</p>
              </div>
            )}
            <div style={{ marginTop: '20px', display: 'flex', gap: '16px', alignItems: 'baseline' }}>
              {selectedItem.title && <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{selectedItem.title}</p>}
              <p style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                {selectedItem.source}{selectedItem.year ? ` (${selectedItem.year})` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-card { position: relative; overflow: hidden; }
        .gallery-card:hover img { transform: scale(1.04); }
        .gallery-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: clamp(16px, 3vw, 32px);
          opacity: 0; transition: opacity 0.35s ease;
        }
        .gallery-card:hover .gallery-overlay { opacity: 1; }
      `}</style>
    </>
  )
}
