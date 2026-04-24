export function Footer() {
  return (
    <footer style={{
      padding: 'clamp(80px, 12vw, 160px) clamp(32px, 6vw, 100px)',
      borderTop: '1px solid var(--border)',
      marginTop: 'clamp(80px, 14vw, 200px)',
      backgroundColor: '#0a0000'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr auto',
        gap: 'clamp(40px, 8vw, 120px)',
        alignItems: 'start'
      }}>

        <div>
          <h3 style={{
            fontFamily: 'var(--font)',
            fontSize: 'clamp(4rem, 8vw, 10rem)',
            letterSpacing: '0.04em',
            lineHeight: 0.85,
            color: 'var(--text)',
            marginBottom: 'clamp(16px, 2vw, 28px)'
          }}>
            TBFP
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.9, maxWidth: '340px' }}>
            THE BEYONCÉ FAN PROJECT — a curated, non-commercial digital archive celebrating the artistry and legacy of Beyoncé.
          </p>
        </div>

        <div style={{ paddingTop: 'clamp(12px, 2vw, 24px)' }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.18em', marginBottom: 'clamp(12px, 2vw, 20px)', color: 'var(--muted)', textTransform: 'uppercase' }}>
            Legal
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.3)', lineHeight: 2 }}>
            Unofficial fan site. Not affiliated with Beyoncé,<br />
            Parkwood Entertainment, or Columbia Records.<br />
            All images belong to their respective copyright holders.
            <br /><br />
            <a href="mailto:takedown@tbfp-archive.com" style={{ color: 'var(--muted)', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
              takedown@tbfp-archive.com
            </a>
          </p>
        </div>

        <div style={{ textAlign: 'right', paddingTop: 'clamp(12px, 2vw, 24px)' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em' }}>
            &copy; {new Date().getFullYear()} TBFP
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'rgba(255,255,255,0.18)', marginTop: 'var(--space-2)', letterSpacing: '0.08em' }}>
            UNOFFICIAL
          </p>
        </div>

      </div>
    </footer>
  )
}
