'use client'

import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'

interface Props {
  introImages: string[]
}

type Phase = 'boot' | 'locked' | 'wrong' | 'animating' | 'p1' | 'p2' | 'p3' | 'out' | 'done'

interface ImgPos {
  top?: string; bottom?: string; left?: string; right?: string
  width: string; rotation: number
}
const IMG_POSITIONS: ImgPos[] = [
  { top: '-5%',    left: '-8%',  width: '38vw', rotation: -9 },
  { top: '-5%',    right: '-8%', width: '34vw', rotation: 7  },
  { bottom: '-5%', left: '-6%',  width: '32vw', rotation: 6  },
  { bottom: '-5%', right: '-6%', width: '36vw', rotation: -7 },
]

export function PasswordGate({ introImages }: Props) {
  const [phase, setPhase] = useState<Phase>('boot')
  const [password, setPassword] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const unlocked = sessionStorage.getItem('tbfp-unlocked')
    setPhase(unlocked ? 'done' : 'locked')
  }, [])

  useEffect(() => {
    if (phase === 'locked') setTimeout(() => inputRef.current?.focus(), 100)
  }, [phase])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (password.trim().toLowerCase() === 'echoville') {
      sessionStorage.setItem('tbfp-unlocked', '1')
      setPhase('animating')
      setTimeout(() => setPhase('p1'),   80)
      setTimeout(() => setPhase('p2'),   700)
      setTimeout(() => setPhase('p3'),   1400)
      setTimeout(() => setPhase('out'),  2900)
      setTimeout(() => setPhase('done'), 4000)
    } else {
      setPhase('wrong')
      setPassword('')
      setTimeout(() => setPhase('locked'), 1000)
    }
  }

  if (phase === 'boot' || phase === 'done') return null

  const isAnim = ['animating','p1','p2','p3','out'].includes(phase)
  const showImages = ['p1','p2','p3'].includes(phase)
  const showTitle = ['p2','p3'].includes(phase)
  const showSub = phase === 'p3'
  const isOut = phase === 'out'

  /* ─── Lock screen ─── */
  if (!isAnim) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px'
      }}>
        <h1 style={{
          fontSize: 'clamp(5rem, 18vw, 18rem)',
          fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.85,
          textAlign: 'center', marginBottom: '0.15em',
          animation: phase === 'wrong' ? 'shake 0.5s ease' : 'none',
          color: phase === 'wrong' ? 'var(--accent)' : 'var(--text)'
        }}>
          TBFP
        </h1>
        <p style={{
          fontSize: 'clamp(0.55rem, 1.2vw, 0.85rem)',
          letterSpacing: '0.35em', color: 'var(--muted)',
          textTransform: 'uppercase', marginBottom: 'clamp(48px, 8vh, 80px)',
          textAlign: 'center'
        }}>
          THE BEYONCÉ FAN PROJECT
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '320px' }}>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="ENTER PASSWORD"
            autoComplete="off"
            style={{
              width: '100%', background: 'transparent',
              border: 'none', borderBottom: `1px solid ${phase === 'wrong' ? 'var(--accent)' : 'var(--border)'}`,
              padding: '10px 0', textAlign: 'center',
              fontSize: '13px', letterSpacing: '0.3em',
              color: 'var(--text)', outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
          {phase === 'wrong' && (
            <p style={{ fontSize: '10px', color: 'var(--accent)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              ACCESS DENIED
            </p>
          )}
          <button type="submit" className="glow-link" style={{ fontSize: '11px', letterSpacing: '0.25em', color: 'var(--muted)', marginTop: '8px' }}>
            ENTER →
          </button>
        </form>

        <style>{`
          @keyframes shake {
            0%,100% { transform: translateX(0); }
            20% { transform: translateX(-12px); }
            40% { transform: translateX(12px); }
            60% { transform: translateX(-8px); }
            80% { transform: translateX(8px); }
          }
        `}</style>
      </div>
    )
  }

  /* ─── Entrance animation ─── */
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: '#000', overflow: 'hidden',
      opacity: isOut ? 0 : 1,
      transition: isOut ? 'opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
      pointerEvents: isOut ? 'none' : 'all'
    }}>
      {/* Corner images */}
      {introImages.slice(0, 4).map((url, i) => {
        const pos = IMG_POSITIONS[i]
        return (
          <div key={i} style={{
            position: 'absolute',
            top: pos.top, left: pos.left, right: pos.right, bottom: pos.bottom,
            width: pos.width,
            opacity: showImages ? 1 : 0,
            transform: showImages
              ? `rotate(${pos.rotation}deg)`
              : `rotate(${pos.rotation}deg) translateY(${i < 2 ? '-60px' : '60px'})`,
            transition: `opacity 0.8s ease ${i * 0.12}s, transform 0.9s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s`,
            filter: 'grayscale(20%) contrast(1.1)'
          }}>
            <img src={url} alt="" draggable={false} style={{ width: '100%', display: 'block', objectFit: 'cover' }} />
          </div>
        )
      })}

      {/* Center text */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '40px',
        pointerEvents: 'none'
      }}>
        <h1 style={{
          fontSize: 'clamp(6rem, 20vw, 22rem)',
          fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.85,
          opacity: showTitle ? 1 : 0,
          transform: showTitle ? 'scale(1) skewX(0deg)' : 'scale(0.75) skewX(-6deg)',
          transition: 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          textShadow: showTitle ? 'var(--glow-lg)' : 'none',
          color: 'var(--accent)',
          mixBlendMode: 'difference'
        }}>
          TBFP
        </h1>
        <p style={{
          fontSize: 'clamp(0.6rem, 1.5vw, 1.1rem)',
          letterSpacing: '0.4em', color: 'var(--text)',
          textTransform: 'uppercase', marginTop: '24px',
          opacity: showSub ? 1 : 0,
          transform: showSub ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s'
        }}>
          THE BEYONCÉ FAN PROJECT
        </p>
      </div>
    </div>
  )
}
