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
          top: 'var(--space-6)',
          right: 'var(--space-6)',
          zIndex: 100,
          padding: 'var(--space-2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '4px'
        }}
      >
        <div style={{ width: '24px', height: '2px', backgroundColor: 'var(--text)' }} />
        <div style={{ width: '24px', height: '2px', backgroundColor: 'var(--accent)' }} />
        <div style={{ width: '16px', height: '2px', backgroundColor: 'var(--text)' }} />
      </button>

      {isOpen && (
        <nav style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000000',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--space-16) var(--space-8)',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <button 
            onClick={() => setIsOpen(false)}
            style={{
              position: 'absolute',
              top: 'var(--space-6)',
              right: 'var(--space-6)',
              fontSize: 'var(--text-lg)',
              color: 'var(--accent)'
            }}
          >
            [CLOSE]
          </button>

          <div style={{ marginTop: 'var(--space-12)' }}>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', letterSpacing: '0.3em', marginBottom: 'var(--space-8)' }}>
              CATEGORIES
            </p>
            <ul style={{ listStyle: 'none' }}>
              {categories.map((cat, i) => (
                <li 
                  key={cat.id}
                  style={{ 
                    marginBottom: 'var(--space-4)',
                    animation: `stagger 0.4s ease-out forwards`,
                    animationDelay: `${i * 0.1}s`,
                    opacity: 0
                  }}
                >
                  <a 
                    href={`/era/${cat.slug}`}
                    style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      transition: 'color var(--transition)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text)'}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
              <li style={{ 
                marginTop: 'var(--space-12)',
                animation: `stagger 0.4s ease-out forwards`,
                animationDelay: `${categories.length * 0.1}s`,
                opacity: 0
              }}>
                 <a 
                    href="/admin"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.2em'
                    }}
                  >
                    Admin Access
                  </a>
              </li>
            </ul>
          </div>
        </nav>
      )}
    </>
  )
}
