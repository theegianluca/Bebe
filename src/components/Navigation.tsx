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
          gap: '5px',
          transition: 'opacity var(--transition)'
        }}
      >
        <div style={{ width: '28px', height: '1.5px', backgroundColor: 'var(--text)', transition: 'box-shadow var(--transition)' }} />
        <div style={{ width: '20px', height: '1.5px', backgroundColor: 'rgba(255,255,255,0.45)', transition: 'box-shadow var(--transition)' }} />
        <div style={{ width: '14px', height: '1.5px', backgroundColor: 'var(--text)', transition: 'box-shadow var(--transition)' }} />
      </button>

      {isOpen && (
        <nav style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(8,0,0,0.98)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: 'clamp(80px, 12vw, 160px) clamp(32px, 7vw, 120px)',
          animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          overflowY: 'auto'
        }}>
          {/* Close */}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation"
            className="back-link"
            style={{
              position: 'absolute',
              top: 'clamp(24px, 3.5vw, 40px)',
              right: 'clamp(24px, 3.5vw, 40px)',
              color: 'var(--muted)',
              fontSize: 'var(--text-sm)'
            }}
          >
            ✕
          </button>

          {/* Home */}
          <a
            href="/"
            className="back-link"
            style={{
              marginBottom: 'clamp(56px, 9vw, 120px)',
              width: 'fit-content',
              color: 'var(--muted)',
              fontSize: 'var(--text-sm)'
            }}
          >
            ← HOME
          </a>

          {/* Label */}
          <p style={{
            fontFamily: 'var(--font-text)',
            color: 'rgba(255,255,255,0.22)',
            fontSize: 'var(--text-xs)',
            letterSpacing: '0.3em',
            marginBottom: 'clamp(20px, 3vw, 40px)',
            textTransform: 'uppercase'
          }}>
            ERAS
          </p>

          {/* Era links */}
          <ul style={{ listStyle: 'none' }}>
            {categories.map((cat, i) => (
              <li
                key={cat.id}
                style={{
                  animation: 'stagger 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                  animationDelay: `${i * 0.07}s`,
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

          {/* Admin */}
          <div style={{
            marginTop: 'clamp(60px, 10vw, 130px)',
            animation: 'stagger 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            animationDelay: `${categories.length * 0.07}s`,
            opacity: 0
          }}>
            <a
              href="/admin"
              className="glow-link"
              style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}
            >
              ADMIN ACCESS
            </a>
          </div>
        </nav>
      )}
    </>
  )
}
