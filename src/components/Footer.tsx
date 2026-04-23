export function Footer() {
  return (
    <footer style={{
      padding: 'var(--space-16) var(--space-6)',
      borderTop: '1px solid var(--border)',
      marginTop: 'var(--space-20)',
      backgroundColor: '#000000'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--space-12)'
      }}>
        <div>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', color: 'var(--accent)' }}>BEBE ARCHIVE</h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.8, maxWidth: '400px' }}>
            A curated, non-commercial digital archive celebrating the artistry and legacy of Beyoncé.
          </p>
        </div>

        <div>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 'var(--space-4)' }}>LEGAL</p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', lineHeight: 1.8 }}>
            This is an unofficial fan site not affiliated with Beyoncé, Parkwood Entertainment, or Columbia Records. 
            All images belong to their respective copyright holders.
            <br /><br />
            Takedown requests: <a href="mailto:takedown@bebe-archive.com" style={{ color: 'var(--text)', textDecoration: 'underline' }}>takedown@bebe-archive.com</a>
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
            &copy; {new Date().getFullYear()} BEBE. UNOFFICIAL.
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: 'var(--space-2)' }}>
            Built with Next.js & Supabase
          </p>
        </div>
      </div>
    </footer>
  )
}
