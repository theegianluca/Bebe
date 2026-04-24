export function Marquee() {
  const text = 'TBFP \u2605 ARCHIVE \u2605 THE BEYONC\u00C9 FAN PROJECT \u2605 ERAS '

  return (
    <div style={{
      padding: 'clamp(28px, 4vw, 52px) 0',
      width: '100%',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        animation: 'marquee 40s linear infinite',
      }}>
        <p style={{
          fontFamily: 'var(--font-text)',
          fontWeight: 700,
          fontSize: 'clamp(0.85rem, 0.6rem + 2.2vw, 4.2rem)',
          letterSpacing: '0.08em',
          color: 'var(--text)',
          textTransform: 'uppercase',
          lineHeight: 1,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          margin: 0,
          paddingLeft: 'clamp(16px, 2.5vw, 60px)',
          paddingRight: 'clamp(16px, 2.5vw, 60px)',
        }}>
          {text}
        </p>
        <p style={{
          fontFamily: 'var(--font-text)',
          fontWeight: 700,
          fontSize: 'clamp(0.85rem, 0.6rem + 2.2vw, 4.2rem)',
          letterSpacing: '0.08em',
          color: 'var(--text)',
          textTransform: 'uppercase',
          lineHeight: 1,
          userSelect: 'none',
          whiteSpace: 'nowrap',
          margin: 0,
          paddingLeft: 'clamp(16px, 2.5vw, 60px)',
          paddingRight: 'clamp(16px, 2.5vw, 60px)',
        }}>
          {text}
        </p>
      </div>
    </div>
  )
}
