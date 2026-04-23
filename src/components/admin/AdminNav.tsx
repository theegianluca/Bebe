'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminNav() {
  const pathname = usePathname()

  const links = [
    { href: '/admin', label: 'DASHBOARD' },
    { href: '/admin/categories', label: 'CATEGORIES' },
    { href: '/admin/items', label: 'GALLERY ITEMS' },
    { href: '/', label: 'VIEW SITE' },
  ]

  return (
    <nav style={{
      width: '240px',
      borderRight: '1px solid var(--border)',
      padding: 'var(--space-8) var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }}>
      <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-8)', letterSpacing: '0.1em' }}>
        BEBE ADMIN
      </div>
      
      {links.map(link => (
        <Link 
          key={link.href} 
          href={link.href}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: pathname === link.href ? 'var(--accent)' : 'var(--muted)',
            backgroundColor: pathname === link.href ? 'rgba(255,0,0,0.05)' : 'transparent',
            transition: 'all var(--transition)'
          }}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
