import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div style={{ minHeight: '100dvh', display: 'flex' }}>
      <AdminNav />
      <main style={{
        flex: 1, padding: 'var(--space-8)',
        overflowY: 'auto', maxHeight: '100dvh',
      }}>
        {children}
      </main>
    </div>
  )
}
