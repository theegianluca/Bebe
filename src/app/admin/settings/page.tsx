import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from '@/components/admin/SettingsClient'

export default async function SettingsPage() {
  let settings: Record<string, string> = {}
  try {
    const supabase = createClient()
    const { data } = await supabase.from('settings').select('key, value')
    if (data) settings = Object.fromEntries(data.map(s => [s.key, s.value ?? '']))
  } catch {}

  return (
    <div>
      <p style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
        Settings
      </p>
      <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-4)', letterSpacing: '-0.02em' }}>
        SITE IMAGES
      </h1>
      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 'var(--space-8)', lineHeight: 1.8 }}>
        Hero images appear on the home page. Hover over the front image to reveal the back.
        Intro images appear during the entrance animation after password entry.
      </p>
      <SettingsClient initial={settings} />
    </div>
  )
}
