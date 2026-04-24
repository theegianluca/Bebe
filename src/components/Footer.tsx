export function Footer() {
  return (
    <footer style={{
      padding: 'clamp(80px, 12vw, 160px) clamp(32px, 6vw, 100px)',
      borderTop: '2px solid var(--border)',
      marginTop: 'clamp(80px, 14vw, 200px)',
      backgroundColor: '#000000'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
      }}>

        {/* Sigil row */}
        <p style={{
          fontFamily: 'var(--font-text)',
          fontSize: 'clamp(1.1rem, 2.2vw, 2.2rem)',
          color: 'var(--text)',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: 'clamp(48px, 7vw, 90px)',
          lineHeight: 1.6,
        }}>
          TBFP ★ ARCHIVE ★ THE BEYONCÉ FAN PROJECT
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: 'clamp(40px, 8vw, 120px)',
          alignItems: 'start'
        }}>

          <div>
            <h3 style={{
              fontFamily: 'var(--font)',
              fontWeight: 700,
              fontSize: 'clamp(4rem, 8vw, 10rem)',
              letterSpacing: '0.04em',
              lineHeight: 0.85,
              color: 'var(--text)',
              marginBottom: 'clamp(20px, 2.5vw, 36px)'
            }}>
              TBFP
            </h3>
            <p style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text)',
              lineHeight: 2,
              maxWidth: '320px'
            }}>
              THE BEYONCÉ FAN PROJECT — a curated, non-commercial digital archive celebrating the artistry and legacy of Beyoncé.
            </p>
          </div>

          <div style={{ paddingTop: 'clamp(12px, 2vw, 24px)' }}>
            <p style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              letterSpacing: '0.22em',
              marginBottom: 'clamp(16px, 2vw, 24px)',
              color: 'var(--text)',
              textTransform: 'uppercase'
            }}>
              Legal
            </p>
            <p style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text)',
              lineHeight: 2
            }}>
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
            <p style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text)',
              letterSpacing: '0.14em'
            }}>
              &copy; {new Date().getFullYear()} TBFP
            </p>
            <p style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text)',
              marginTop: 'var(--space-2)',
              letterSpacing: '0.12em'
            }}>
              UNOFFICIAL
            </p>
            <p style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text)',
              marginTop: 'clamp(24px, 4vw, 40px)',
              letterSpacing: '0.12em'
            }}>
              <a href="/admin" className="glow-link" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                ADMIN
              </a>
            </p>
            <p style={{
              marginTop: 'clamp(40px, 6vw, 80px)',
              fontSize: 'clamp(10rem, 18vw, 22rem)',
              color: 'var(--accent)',
              lineHeight: 0.8,
            }}>
              ★
            </p>
          </div>

        </div>
      </div>
    </footer>
  )
}
