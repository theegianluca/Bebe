'use client'

import { useState, useEffect } from 'react'

export function CopyrightGate() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const hasAccepted = sessionStorage.getItem('copyright-accepted')
    if (!hasAccepted) {
      setIsOpen(true)
    }
  }, [])

  const handleAccept = () => {
    sessionStorage.setItem('copyright-accepted', 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      backgroundColor: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)'
    }}>
      <div style={{
        maxWidth: '500px',
        textAlign: 'center',
        border: '1px solid var(--accent)',
        padding: 'var(--space-8)',
        backgroundColor: 'var(--surface)'
      }}>
        <h2 style={{
          color: 'var(--accent)',
          fontSize: 'var(--text-lg)',
          marginBottom: 'var(--space-4)',
          letterSpacing: '0.1em'
        }}>LEGAL NOTICE</h2>
        <p style={{
          fontSize: 'var(--text-sm)',
          lineHeight: '1.8',
          color: 'var(--text)',
          marginBottom: 'var(--space-8)'
        }}>
          This is an unofficial fan site not affiliated with Beyoncé, Parkwood Entertainment, or Columbia Records. 
          All images belong to their respective copyright holders. 
          For takedown requests contact: <a href="mailto:takedown@bebe-archive.com" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>takedown@bebe-archive.com</a>.
        </p>
        <button 
          onClick={handleAccept}
          style={{
            backgroundColor: 'transparent',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            padding: 'var(--space-3) var(--space-8)',
            fontSize: 'var(--text-sm)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            transition: 'all var(--transition)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)'
            e.currentTarget.style.color = '#000000'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--accent)'
          }}
        >
          I understand — Enter
        </button>
      </div>
    </div>
  )
}
