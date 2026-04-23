'use client'

import { useState } from 'react'

export function Hero() {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <section style={{
      height: '100vh',
      width: '100%',
      backgroundColor: '#000000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          width: 'clamp(300px, 60vw, 600px)',
          height: 'clamp(300px, 60vw, 600px)',
          position: 'relative',
          cursor: 'crosshair'
        }}
      >
        <svg 
          viewBox="0 0 100 100" 
          style={{
            width: '100%',
            height: '100%',
            animation: 'spin 10s linear infinite',
            animationPlayState: isPaused ? 'paused' : 'running'
          }}
        >
          <circle cx="50" cy="50" r="48" fill="none" stroke="var(--muted)" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="var(--muted)" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="var(--muted)" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="var(--muted)" strokeWidth="0.2" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="var(--accent)" strokeWidth="1" strokeDasharray="1 10" />
          
          <circle cx="50" cy="50" r="8" fill="var(--accent)" />
          <circle cx="50" cy="50" r="2" fill="#000000" />
        </svg>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 'var(--space-12)',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: 'var(--text-hero)',
          fontWeight: 700,
          letterSpacing: '-0.05em',
          lineHeight: 0.9,
          margin: 0,
          textTransform: 'uppercase'
        }}>
          BEBE
        </h1>
        <div style={{
          height: '2px',
          width: '40px',
          backgroundColor: 'var(--accent)',
          margin: 'var(--space-4) auto'
        }} />
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--muted)',
          letterSpacing: '0.4em',
          textTransform: 'uppercase'
        }}>
          ARCHIVE
        </p>
      </div>
    </section>
  )
}
