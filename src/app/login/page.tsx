'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/admin')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 'var(--space-6)',
    }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <span style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Admin</span>
          <h1 style={{ fontFamily: 'var(--font)', fontSize: 'clamp(3rem, 6vw, 5rem)', letterSpacing: '0.04em', marginTop: 'var(--space-2)', lineHeight: 1 }}>TBFP</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-1)' }}>Sign in to manage the archive</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
              Email
            </label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: '1px solid var(--border)',
                padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)',
                color: 'var(--text)', outline: 'none', transition: 'border-color var(--transition)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 'var(--space-2)' }}>
              Password
            </label>
            <input
              type="password" required value={password} onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%', background: 'transparent', border: '1px solid var(--border)',
                padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--text-sm)',
                color: 'var(--text)', outline: 'none', transition: 'border-color var(--transition)',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>
          {error && (
            <p style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)' }}>{error}</p>
          )}
          <button
            type="submit" disabled={loading}
            style={{
              background: 'var(--accent)', color: 'var(--bg)', padding: 'var(--space-3) var(--space-6)',
              fontSize: 'var(--text-sm)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              border: 'none', cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1, transition: 'opacity var(--transition)',
            }}
          >
            {loading ? 'Signing in…' : 'Enter Archive'}
          </button>
        </form>
      </div>
    </div>
  )
}
