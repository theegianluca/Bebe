'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  initial: Record<string, string>
}

const SLOTS = [
  { key: 'hero_front_url',  label: 'HERO — FRONT IMAGE',    hint: 'Shown by default on top' },
  { key: 'hero_back_url',   label: 'HERO — BACK IMAGE',     hint: 'Revealed on hover' },
  { key: 'intro_image_1',   label: 'INTRO ANIMATION — 01',  hint: 'Top-left corner' },
  { key: 'intro_image_2',   label: 'INTRO ANIMATION — 02',  hint: 'Top-right corner' },
  { key: 'intro_image_3',   label: 'INTRO ANIMATION — 03',  hint: 'Bottom-left corner' },
  { key: 'intro_image_4',   label: 'INTRO ANIMATION — 04',  hint: 'Bottom-right corner' },
]

export function SettingsClient({ initial }: Props) {
  const [values, setValues] = useState<Record<string, string>>(initial)
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  const handleUpload = async (key: string, file: File) => {
    setUploading(u => ({ ...u, [key]: true }))

    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const json = await res.json()

    if (!res.ok) {
      alert('Upload failed: ' + (json.error ?? res.statusText))
      setUploading(u => ({ ...u, [key]: false }))
      return
    }

    const url = json.url as string
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value: url, updated_at: new Date().toISOString() })

    if (error) {
      alert('Save failed: ' + error.message)
    } else {
      setValues(v => ({ ...v, [key]: url }))
      setSaved(s => ({ ...s, [key]: true }))
      setTimeout(() => setSaved(s => ({ ...s, [key]: false })), 2000)
    }
    setUploading(u => ({ ...u, [key]: false }))
  }

  const handleRemove = async (key: string) => {
    if (!confirm('Remove this image?')) return
    await supabase.from('settings').delete().eq('key', key)
    setValues(v => ({ ...v, [key]: '' }))
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-6)' }}>
      {SLOTS.map(slot => {
        const url = values[slot.key]
        const isUploading = uploading[slot.key]
        const isSaved = saved[slot.key]

        return (
          <div key={slot.key} style={{ border: '1px solid var(--border)', overflow: 'hidden' }}>
            {/* Preview */}
            <div style={{ height: '200px', backgroundColor: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
              {url ? (
                <>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={() => handleRemove(slot.key)}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', color: 'var(--accent)', fontSize: '9px', padding: '3px 8px', letterSpacing: '0.1em' }}
                  >
                    REMOVE
                  </button>
                  {isSaved && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', letterSpacing: '0.15em', color: '#22c55e' }}>
                      SAVED ✓
                    </div>
                  )}
                </>
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.1em' }}>NO IMAGE</span>
                </div>
              )}
            </div>

            {/* Info + upload */}
            <div style={{ padding: 'var(--space-4)' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '4px' }}>{slot.label}</p>
              <p style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.05em', marginBottom: '12px' }}>{slot.hint}</p>

              <label style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border)', padding: '8px',
                fontSize: '9px', letterSpacing: '0.15em',
                color: isUploading ? 'var(--accent)' : 'var(--muted)',
                cursor: isUploading ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.15s ease, color 0.15s ease'
              }}
                onMouseEnter={e => { if (!isUploading) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--text)' } }}
                onMouseLeave={e => { if (!isUploading) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--muted)' } }}
              >
                {isUploading ? 'UPLOADING...' : url ? 'REPLACE IMAGE' : 'UPLOAD IMAGE'}
                <input
                  type="file" accept="image/*" disabled={isUploading}
                  style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) void handleUpload(slot.key, f); e.target.value = '' }}
                />
              </label>
            </div>
          </div>
        )
      })}
    </div>
  )
}
