'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const links = [
    { href: '/admin', label: 'DASHBOARD' },
    { href: '/admin/categories', label: 'CATEGORIES' },
    { href: '/admin/items', label: 'GALLERY ITEMS' },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      width: '220px',
      borderRight: '1px solid var(--border)',
      padding: 'var(--space-8) var(--space-4)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-1)',
      flexShrink: 0
    }}>
      <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 'var(--space-8)', letterSpacing: '0.08em' }}>
        BEBE ADMIN
      </div>

      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            padding: 'var(--space-3) var(--space-3)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: pathname === link.href ? 'var(--accent)' : 'var(--muted)',
            backgroundColor: pathname === link.href ? 'rgba(255,0,0,0.05)' : 'transparent',
            transition: 'all var(--transition)',
            textShadow: pathname === link.href ? 'var(--glow-sm)' : 'none'
          }}
          onMouseEnter={(e) => { if (pathname !== link.href) e.currentTarget.style.color = 'var(--text)' }}
          onMouseLeave={(e) => { if (pathname !== link.href) e.currentTarget.style.color = 'var(--muted)' }}
        >
          {link.label}
        </Link>
      ))}

      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-8)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <a
          href="/"
          className="back-link"
          style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}
        >
          ← VIEW SITE
        </a>
        <button
          onClick={handleSignOut}
          className="back-link"
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--muted)',
            textAlign: 'left'
          }}
        >
          SIGN OUT →
        </button>
      </div>
    </nav>
  )
}
