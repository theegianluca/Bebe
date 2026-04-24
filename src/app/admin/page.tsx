import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div>
      <p style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>Dashboard</p>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-8)', letterSpacing: '-0.02em' }}>TBFP ADMIN</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
        {[
          { href: '/admin/categories', label: 'CATEGORIES', desc: 'Manage eras & order' },
          { href: '/admin/items',      label: 'GALLERY ITEMS', desc: 'Images & text blocks' },
          { href: '/admin/settings',   label: 'SETTINGS', desc: 'Hero & intro images' },
          { href: '/',                 label: 'VIEW SITE', desc: 'Open the public archive' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            style={{
              display: 'block', padding: 'var(--space-6)', border: '1px solid var(--border)',
              transition: 'border-color var(--transition)',
            }}
            className="admin-card"
          >
            <h2 style={{ fontSize: 'var(--text-base)', fontWeight: 700, letterSpacing: '0.05em' }}>{item.label}</h2>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', marginTop: 'var(--space-1)' }}>{item.desc}</p>
          </Link>
        ))}
      </div>
      <style>{`.admin-card:hover { border-color: var(--accent) !important; }`}</style>
    </div>
  )
}
