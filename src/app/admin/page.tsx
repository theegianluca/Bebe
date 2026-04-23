import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div>
      <p style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>Dashboard</p>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-8)' }}>BEBE Admin</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-3)' }}>
        {[
          { href: '/admin/categories', label: 'Categories', desc: 'Manage eras & order' },
          { href: '/admin/items', label: 'Items', desc: 'Images & text blocks' },
          { href: '/', label: 'View Site', desc: 'Open the public archive' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            style={{
              display: 'block', padding: 'var(--space-6)', border: '1px solid var(--border)',
              transition: 'border-color var(--transition)',
            }}
            className="admin-card"
          >
            <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{item.label}</h2>
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>{item.desc}</p>
          </Link>
        ))}
      </div>
      <style>{`.admin-card:hover { border-color: var(--accent) !important; }`}</style>
    </div>
  )
}
