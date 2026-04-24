'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import type { CSSProperties, MouseEvent } from 'react'

interface Item {
  id: string
  type: 'image' | 'text'
  image_url?: string
  content?: string
  title?: string
  source?: string
  year?: number
}

interface ScatteredItem {
  id: string
  image_url: string
  title?: string
  x: number
  y: number
  width: number
  rotation: number
  zIndex: number
}

type DisplayEntry = Item | null

export function MasonryGallery({ items }: { items: Item[] }) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [scattered, setScattered] = useState<ScatteredItem[]>([])
  const [liftedIds, setLiftedIds] = useState<Set<string>>(new Set())

  const pendingRef = useRef<{ item: Item; rect: DOMRect; startX: number; startY: number } | null>(null)
  const activeFromMasonryRef = useRef<{ id: string; el: HTMLDivElement } | null>(null)
  const activeScatteredIdRef = useRef<string | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const didDragRef = useRef(false)
  const zRef = useRef(10)
  const containerRef = useRef<HTMLDivElement>(null)

  // Build display list with null gap entries at irregular intervals
  const displayList = useMemo<DisplayEntry[]>(() => {
    const result: DisplayEntry[] = []
    items.forEach((item, i) => {
      result.push(item)
      if (i % 4 === 1 || i % 7 === 5 || i % 9 === 3) result.push(null)
    })
    return result
  }, [items])

  // Per-item scroll reveal (bidirectional)
  useEffect(() => {
    if (!containerRef.current) return
    const els = containerRef.current.querySelectorAll('.masonry-reveal')
    if (!els.length) return

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('revealed', e.isIntersecting)),
      { threshold: 0.06, rootMargin: '0px 0px -36px 0px' }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [items])

  // Masonry drag — lift original, float DOM element
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (pendingRef.current) {
        const { item, rect, startX, startY } = pendingRef.current
        const dx = e.clientX - startX
        const dy = e.clientY - startY
        if (Math.sqrt(dx * dx + dy * dy) > 6) {
          if (item.type !== 'image' || !item.image_url) { pendingRef.current = null; return }
          didDragRef.current = true
          pendingRef.current = null

          const rotation = (Math.random() - 0.5) * 12
          const width = Math.min(rect.width * 1.1, 480)
          const ox = startX - rect.left
          const oy = startY - rect.top
          offsetRef.current = { x: ox, y: oy }
          const z = ++zRef.current

          setLiftedIds(prev => new Set([...prev, item.id]))

          const el = document.createElement('div')
          el.style.cssText = `position:fixed;left:${rect.left}px;top:${rect.top}px;width:${width}px;transform:rotate(${rotation}deg);transform-origin:center top;z-index:${z};pointer-events:none;user-select:none;filter:drop-shadow(0 16px 48px rgba(0,0,0,0.9)) drop-shadow(0 0 1px rgba(255,255,255,0.08));`
          const img = document.createElement('img')
          img.src = item.image_url
          img.draggable = false
          img.style.cssText = 'width:100%;display:block;pointer-events:none;'
          el.appendChild(img)
          document.body.appendChild(el)
          activeFromMasonryRef.current = { id: item.id, el }

          setScattered(prev => {
            const without = prev.filter(s => s.id !== item.id)
            return [...without, { id: item.id, image_url: item.image_url!, title: item.title, x: rect.left, y: rect.top, width, rotation, zIndex: z }]
          })
        }
      }

      if (activeFromMasonryRef.current) {
        const { x: ox, y: oy } = offsetRef.current
        activeFromMasonryRef.current.el.style.left = `${e.clientX - ox}px`
        activeFromMasonryRef.current.el.style.top = `${e.clientY - oy}px`
      }

      if (activeScatteredIdRef.current) {
        const id = activeScatteredIdRef.current
        const { x: ox, y: oy } = offsetRef.current
        setScattered(prev => prev.map(s => s.id === id ? { ...s, x: e.clientX - ox, y: e.clientY - oy } : s))
      }
    }

    const onUp = (e: MouseEvent) => {
      pendingRef.current = null
      if (activeFromMasonryRef.current) {
        const { id, el } = activeFromMasonryRef.current
        const { x: ox, y: oy } = offsetRef.current
        setScattered(prev => prev.map(s => s.id === id ? { ...s, x: e.clientX - ox, y: e.clientY - oy } : s))
        el.remove()
        activeFromMasonryRef.current = null
      }
      activeScatteredIdRef.current = null
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setScattered([]); setLiftedIds(new Set()) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleGalleryMouseDown = (e: MouseEvent, item: Item) => {
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

  const handleScatterMouseDown = (e: MouseEvent, s: ScatteredItem) => {
    e.preventDefault()
    e.stopPropagation()
    const z = ++zRef.current
    offsetRef.current = { x: e.clientX - s.x, y: e.clientY - s.y }
    activeScatteredIdRef.current = s.id
    setScattered(prev => prev.map(sc => sc.id === s.id ? { ...sc, zIndex: z } : sc))
  }

  const removeScattered = (id: string) => {
    setScattered(prev => prev.filter(s => s.id !== id))
    setLiftedIds(prev => { const next = new Set(prev); next.delete(id); return next })
  }

  return (
    <>
      {items.some(i => i.type === 'image') && (
        <p style={{ fontSize: '8px', color: 'rgba(255,255,255,0.22)', letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: 'clamp(40px, 6vw, 80px)' }}>
          DRAG IMAGES TO SCATTER · DOUBLE-CLICK TO REMOVE · ESC TO CLEAR
        </p>
      )}

      <div className="masonry" ref={containerRef}>
        {displayList.map((entry, idx) => {
          if (entry === null) {
            return (
              <div
                key={`gap-${idx}`}
                className="masonry-item masonry-gap"
                aria-hidden="true"
                style={{ height: 'clamp(100px, 18vw, 240px)' }}
              />
            )
          }
          const item = entry
          const isLifted = liftedIds.has(item.id)
          const delay = `${(idx % 6) * 0.07}s`

          return (
            <div
              key={item.id}
              className="masonry-item masonry-reveal"
              onMouseDown={(e) => handleGalleryMouseDown(e, item)}
              onClick={() => handleGalleryClick(item)}
              style={{
                '--reveal-delay': delay,
                cursor: item.type === 'image' ? (isLifted ? 'default' : 'grab') : 'pointer',
                userSelect: 'none',
                visibility: isLifted ? 'hidden' : 'visible'
              } as CSSProperties}
            >
              {item.type === 'image' ? (
                <div className="gallery-card">
                  <img
                    src={item.image_url}
                    alt={item.title || ''}
                    draggable={false}
                    style={{ width: '100%', display: 'block', transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)', pointerEvents: 'none' }}
                  />
                  <div className="gallery-overlay">
                    {item.title && (
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 1.8vw, 1.6rem)', letterSpacing: '0.06em', marginBottom: '6px' }}>
                        {item.title}
                      </p>
                    )}
                    <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--muted)' }}>
                      {item.source}{item.year ? ` — ${item.year}` : ''}
                    </p>
                  </div>
                </div>
              ) : (
                <div style={{ padding: 'clamp(16px, 3vw, 32px) 0' }}>
                  {item.title && (
                    <h3 style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1.4rem, 3vw, 3rem)',
                      letterSpacing: '0.04em',
                      color: 'var(--text)',
                      lineHeight: 0.92,
                      marginBottom: '20px'
                    }}>
                      {item.title}
                    </h3>
                  )}
                  <p style={{ fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.7)', lineHeight: 2.1 }}>
                    {item.content}
                  </p>
                  {item.source && (
                    <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '20px' }}>
                      — {item.source}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Scattered floating images */}
      {scattered.map(s => (
        <div
          key={s.id}
          onMouseDown={e => handleScatterMouseDown(e, s)}
          onDoubleClick={() => removeScattered(s.id)}
          style={{
            position: 'fixed',
            left: s.x,
            top: s.y,
            width: s.width,
            transform: `rotate(${s.rotation}deg)`,
            transformOrigin: 'center top',
            zIndex: s.zIndex,
            cursor: 'grab',
            userSelect: 'none',
            filter: 'drop-shadow(0 16px 48px rgba(0,0,0,0.9)) drop-shadow(0 0 1px rgba(255,255,255,0.08))'
          }}
        >
          <img src={s.image_url} alt={s.title || ''} draggable={false} style={{ width: '100%', display: 'block', pointerEvents: 'none' }} />
        </div>
      ))}

      {/* Lightbox */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title ? `Viewing: ${selectedItem.title}` : 'Image viewer'}
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            backgroundColor: 'rgba(0,0,0,0.97)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 'clamp(40px, 6vw, 100px)',
            animation: 'fadeIn 0.25s ease-out'
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
              <div style={{ padding: 'clamp(40px, 6vw, 80px)', backgroundColor: 'var(--surface)', border: '1px solid var(--border)', maxWidth: '680px' }}>
                {selectedItem.title && (
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 4vw, 3.5rem)', letterSpacing: '0.04em', marginBottom: '28px' }}>
                    {selectedItem.title}
                  </h2>
                )}
                <p style={{ lineHeight: 2, color: 'rgba(255,255,255,0.8)' }}>{selectedItem.content}</p>
              </div>
            )}
            <div style={{ marginTop: '20px', display: 'flex', gap: '16px', alignItems: 'baseline' }}>
              {selectedItem.title && (
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.9rem, 1.5vw, 1.4rem)', letterSpacing: '0.06em' }}>{selectedItem.title}</p>
              )}
              <p style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.12em' }}>
                {selectedItem.source}{selectedItem.year ? ` (${selectedItem.year})` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-card { position: relative; overflow: hidden; }
        .gallery-card:hover img { transform: scale(1.05); }
        .gallery-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 52%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: clamp(16px, 3vw, 32px);
          opacity: 0; transition: opacity 0.4s ease;
        }
        .gallery-card:hover .gallery-overlay { opacity: 1; }
      `}</style>
    </>
  )
}
