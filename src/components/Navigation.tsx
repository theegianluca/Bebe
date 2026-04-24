'use client'

import { useState } from 'react'

interface Category {
  id: string
  name: string
  slug: string
}

export function Navigation({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open navigation"
        style={{
          position: 'fixed',
          top: 'clamp(20px, 3vw, 36px)',
          right: 'clamp(20px, 3vw, 36px)',
          zIndex: 100,
          padding: 'var(--space-2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '5px'
        }}
      >
        <div style={{ width: '28px', height: '1.5px', backgroundColor: 'var(--text)' }} />
        <div style={{ width: '28px', height: '1.5px', backgroundColor: 'rgba(255,255,255,0.45)' }} />
        <div style={{ width: '16px', height: '1.5px', backgroundColor: 'var(--text)' }} />
      </button>

      {isOpen && (
        <nav style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(12,0,0,0.97)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: 'clamp(80px, 12vw, 160px) clamp(32px, 7vw, 120px)',
          animation: 'fadeIn 0.3s ease-out',
          overflowY: 'auto'
        }}>
          <button
            onClick={() => setIsOpen(false)}
            className="back-link"
            style={{ position: 'absolute', top: 'clamp(24px, 3.5vw, 40px)', right: 'clamp(24px, 3.5vw, 40px)', color: 'var(--muted)' }}
          >
            [CLOSE]
          </button>

          <a href="/" className="back-link" style={{ marginBottom: 'clamp(56px, 9vw, 120px)', width: 'fit-content', color: 'var(--muted)' }}>
            ← HOME
          </a>

          <p style={{ color: 'rgba(255,255,255,0.22)', fontSize: '9px', letterSpacing: '0.45em', marginBottom: 'clamp(20px, 3vw, 40px)', textTransform: 'uppercase' }}>
            ERAS
          </p>

          <ul style={{ listStyle: 'none' }}>
            {categories.map((cat, i) => (
              <li
                key={cat.id}
                style={{
                  animation: 'stagger 0.45s ease-out forwards',
                  animationDelay: `${i * 0.06}s`,
                  opacity: 0
                }}
              >
                <a
                  href={`/era/${cat.slug}`}
                  className="era-nav-link"
                  onClick={() => setIsOpen(false)}
                >
                  {cat.name}
                </a>
              </li>
            ))}
          </ul>

          <div style={{
            marginTop: 'clamp(60px, 10vw, 130px)',
            animation: 'stagger 0.45s ease-out forwards',
            animationDelay: `${categories.length * 0.06}s`,
            opacity: 0
          }}>
            <a href="/admin" className="glow-link" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
              ADMIN ACCESS
            </a>
          </div>
        </nav>
      )}
    </>
  )
}
