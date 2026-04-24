'use client'

import { useRef, useCallback } from 'react'
import type { MouseEvent } from 'react'

interface Props {
  frontImage?: string
  backImage?: string
}

export function Hero({ frontImage, backImage }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const maskLayerRef = useRef<HTMLDivElement>(null)
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const rafRef = useRef<number | null>(null)

  const currentRadius = useRef(0)
  const targetRadius = useRef(0)
  const posRef = useRef({ x: 0, y: 0 })

  const applyMask = useCallback(() => {
    if (!maskLayerRef.current) return
    const { x, y } = posRef.current
    const r = currentRadius.current
    const mask = `radial-gradient(circle ${r}px at ${x}px ${y}px, black 0%, black 45%, transparent 100%)`
    maskLayerRef.current.style.setProperty('-webkit-mask-image', mask)
    maskLayerRef.current.style.setProperty('mask-image', mask)
  }, [])

  const animateRadius = useCallback(() => {
    const diff = targetRadius.current - currentRadius.current
    currentRadius.current += diff * 0.12

    applyMask()

    if (Math.abs(diff) > 0.5) {
      rafRef.current = requestAnimationFrame(animateRadius)
    } else {
      currentRadius.current = targetRadius.current
      applyMask()
    }
  }, [applyMask])

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)

    const rect = containerRef.current.getBoundingClientRect()
    posRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    targetRadius.current = 160

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animateRadius)

    // Nach kurzer Bewegungspause wieder schließen
    fadeTimerRef.current = setTimeout(() => {
      targetRadius.current = 0
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(animateRadius)
    }, 300)
  }

  const handleMouseLeave = () => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    fadeTimerRef.current = setTimeout(() => {
      targetRadius.current = 0
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(animateRadius)
    }, 120)
  }

  const hasBothImages = !!(frontImage && backImage)

  return (
    <section style={{
      minHeight: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>

      {/* ─── Image pair (fullscreen background) ─── */}
      <div
        ref={containerRef}
        onMouseMove={hasBothImages ? handleMouseMove : undefined}
        onMouseLeave={hasBothImages ? handleMouseLeave : undefined}
        style={{
          position: 'absolute',
          inset: 0,
          cursor: hasBothImages ? 'none' : 'default',
          overflow: 'hidden'
        }}
      >
        {backImage && (
          <img
            src={backImage} alt=""
            draggable={false}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}

        {frontImage && (
          <div
            ref={maskLayerRef}
            style={{
              position: 'absolute',
              inset: 0,
              WebkitMaskImage: 'radial-gradient(circle 0px at 50% 50%, black 0%, transparent 100%)',
              maskImage: 'radial-gradient(circle 0px at 50% 50%, black 0%, transparent 100%)',
            }}
          >
            <img
              src={frontImage} alt=""
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        {!frontImage && !backImage && (
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.2em' }}>ADD IMAGES IN ADMIN → SETTINGS</span>
          </div>
        )}

        {hasBothImages && (
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', fontSize: '8px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.18em', textTransform: 'uppercase', pointerEvents: 'none' }}>
            HOVER TO REVEAL
          </div>
        )}
      </div>

      {/* ─── Text column (overlay on images) ─── */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 'clamp(24px, 4vw, 56px)', padding: 'clamp(100px, 12vw, 160px) clamp(32px, 6vw, 100px) clamp(80px, 10vw, 130px)' }}>

        <div>
          <p style={{ fontSize: '8px', color: 'var(--muted)', letterSpacing: '0.45em', textTransform: 'uppercase', marginBottom: '20px' }}>
            ARCHIVE
          </p>
          <h1 style={{
            fontFamily: 'var(--font)',
            fontSize: 'var(--text-hero)',
            letterSpacing: '0.04em',
            lineHeight: 0.82,
            textTransform: 'uppercase',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed'
          }}>
            TBFP
          </h1>
        </div>

        {/* Vinyl */}
        <div style={{ width: 'clamp(52px, 7vw, 90px)', height: 'clamp(52px, 7vw, 90px)', opacity: 0.55 }}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', animation: 'spin 14s linear infinite' }}>
            <circle cx="50" cy="50" r="47" fill="none" stroke="var(--muted)" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="37" fill="none" stroke="var(--muted)" strokeWidth="0.2" />
            <circle cx="50" cy="50" r="27" fill="none" stroke="var(--muted)" strokeWidth="0.2" />
            <circle cx="50" cy="50" r="17" fill="none" stroke="var(--muted)" strokeWidth="0.2" />
            <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" strokeDasharray="1 9" />
            <circle cx="50" cy="50" r="5" fill="rgba(255,255,255,0.7)" />
            <circle cx="50" cy="50" r="1.5" fill="var(--bg)" />
          </svg>
        </div>
      </div>

      {/* Bottom label */}
      <div style={{ position: 'absolute', bottom: 'clamp(28px, 4vw, 52px)', left: 'clamp(32px, 6vw, 100px)', zIndex: 10 }}>
        <p style={{
          fontFamily: 'var(--font)',
          fontSize: 'clamp(0.8rem, 1.4vw, 1.4rem)',
          letterSpacing: '0.22em',
          color: 'var(--muted)',
          textTransform: 'uppercase'
        }}>
          THE BEYONCÉ FAN PROJECT
        </p>
      </div>

      {/* Scroll cue */}
      <div style={{ position: 'absolute', bottom: 'clamp(28px, 4vw, 52px)', right: 'clamp(32px, 6vw, 100px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.3, zIndex: 10 }}>
        <div style={{ width: '1px', height: 'clamp(40px, 6vw, 80px)', background: 'linear-gradient(to bottom, transparent, var(--text))', animation: 'slideUp 1.8s ease infinite' }} />
      </div>
    </section>
  )
}
