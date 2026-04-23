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
        <div style={{ width: '28px', height: '2px', backgroundColor: 'var(--text)' }} />
        <div style={{ width: '28px', height: '2px', backgroundColor: 'var(--accent)' }} />
        <div style={{ width: '18px', height: '2px', backgroundColor: 'var(--text)' }} />
      </button>

      {isOpen && (
        <nav style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000000',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: 'clamp(80px, 12vw, 160px) clamp(24px, 6vw, 100px)',
          animation: 'fadeIn 0.25s ease-out',
          overflowY: 'auto'
        }}>
          <button
            onClick={() => setIsOpen(false)}
            className="back-link"
            style={{
              position: 'absolute',
              top: 'clamp(20px, 3vw, 36px)',
              right: 'clamp(20px, 3vw, 36px)',
              color: 'var(--muted)'
            }}
          >
            [CLOSE]
          </button>

          <a href="/" className="back-link" style={{ marginBottom: 'clamp(48px, 8vw, 100px)', width: 'fit-content' }}>
            ← HOME
          </a>

          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', letterSpacing: '0.35em', marginBottom: 'clamp(24px, 4vw, 48px)', textTransform: 'uppercase' }}>
            ERAS
          </p>

          <ul style={{ listStyle: 'none' }}>
            {categories.map((cat, i) => (
              <li
                key={cat.id}
                style={{
                  animation: `stagger 0.4s ease-out forwards`,
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

          <div style={{
            marginTop: 'clamp(60px, 10vw, 120px)',
            animation: `stagger 0.4s ease-out forwards`,
            animationDelay: `${categories.length * 0.07}s`,
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
