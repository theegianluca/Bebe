'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Category {
  id: string
  name: string
}

interface Item {
  id: string
  category_id: string
  type: 'image' | 'text'
  image_url?: string
  content?: string
  title?: string
  source?: string
  year?: number
  sort_order: number
}

export function ItemsClient({ initialItems, categories }: { initialItems: Item[], categories: Category[] }) {
  const [items, setItems] = useState(initialItems)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState<Partial<Item>>({
    type: 'image',
    category_id: categories[0]?.id || '',
    title: '',
    content: '',
    source: '',
    year: new Date().getFullYear(),
  })

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      if (file.size < 1024 * 1024) { resolve(file); return }

      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        const MAX = 2000
        let { width, height } = img
        if (width > MAX || height > MAX) {
          const ratio = Math.min(MAX / width, MAX / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
          'image/jpeg', 0.85
        )
      }
      img.src = url
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0]
    if (!raw) return

    setIsUploading(true)

    const file = await compressImage(raw)
    const form = new FormData()
    form.append('file', file)

    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const json = await res.json()

    if (!res.ok) {
      alert('Error uploading image: ' + (json.error ?? res.statusText))
      setIsUploading(false)
      return
    }

    setFormData({ ...formData, image_url: json.url })
    setIsUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.category_id) return

    const { data, error } = await supabase
      .from('items')
      .insert([{
        ...formData,
        sort_order: items.filter(i => i.category_id === formData.category_id).length + 1
      }])
      .select()
      .single()

    if (data) {
      setItems([data, ...items])
      setFormData({
        ...formData,
        title: '',
        content: '',
        image_url: undefined
      })
      // Reset file input if needed (via ref or just re-render)
    }
  }

  const handleDelete = async (item: Item) => {
    if (!confirm('Are you sure?')) return
    
    if (item.image_url) {
      const parts = item.image_url.split('/')
      const path = parts[parts.length - 1]
      if (path) {
        await supabase.storage.from('items').remove([`uploads/${path}`])
      }
    }

    const { error } = await supabase.from('items').delete().eq('id', item.id)
    if (!error) {
      setItems(items.filter(i => i.id !== item.id))
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Gallery Items</h2>

      <form onSubmit={handleSubmit} style={{ 
        marginBottom: 'var(--space-12)', 
        padding: 'var(--space-6)', 
        border: '1px solid var(--accent)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--space-4)'
      }}>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 'var(--space-4)' }}>
          <button 
            type="button" 
            onClick={() => setFormData({...formData, type: 'image'})}
            style={{ 
              flex: 1, padding: '8px', border: '1px solid var(--border)',
              backgroundColor: formData.type === 'image' ? 'var(--accent)' : 'transparent',
              color: formData.type === 'image' ? '#000' : 'var(--text)'
            }}
          >IMAGE</button>
          <button 
            type="button" 
            onClick={() => setFormData({...formData, type: 'text'})}
            style={{ 
              flex: 1, padding: '8px', border: '1px solid var(--border)',
              backgroundColor: formData.type === 'text' ? 'var(--accent)' : 'transparent',
              color: formData.type === 'text' ? '#000' : 'var(--text)'
            }}
          >TEXT BLOCK</button>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>CATEGORY</label>
          <select 
            value={formData.category_id} 
            onChange={e => setFormData({...formData, category_id: e.target.value})}
            style={{ width: '100%', background: '#000', border: '1px solid var(--border)', padding: '8px', color: '#fff' }}
          >
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>TITLE / HEADER</label>
          <input 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})}
            style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', padding: '8px' }}
          />
        </div>

        {formData.type === 'image' ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>IMAGE UPLOAD</label>
            <input type="file" onChange={handleFileChange} style={{ fontSize: 'var(--text-xs)' }} />
            {isUploading && <span style={{ fontSize: '10px', color: 'var(--accent)', marginLeft: '10px' }}>UPLOADING...</span>}
            {formData.image_url && <img src={formData.image_url} style={{ height: '40px', marginTop: '10px', border: '1px solid var(--border)' }} />}
          </div>
        ) : (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>CONTENT</label>
            <textarea 
              value={formData.content} 
              onChange={e => setFormData({...formData, content: e.target.value})}
              style={{ width: '100%', height: '100px', background: 'transparent', border: '1px solid var(--border)', padding: '8px' }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>SOURCE / PHOTOGRAPHER</label>
          <input 
            value={formData.source} 
            onChange={e => setFormData({...formData, source: e.target.value})}
            style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', padding: '8px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>YEAR</label>
          <input 
            type="number"
            value={formData.year} 
            onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
            style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', padding: '8px' }}
          />
        </div>

        <button type="submit" style={{ 
          gridColumn: '1 / -1',
          backgroundColor: 'var(--accent)', 
          color: '#000', 
          padding: '12px', 
          fontWeight: 700,
          marginTop: 'var(--space-4)'
        }}>
          ADD TO GALLERY
        </button>
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
        {items.map(item => (
          <div key={item.id} style={{ border: '1px solid var(--border)', padding: 'var(--space-3)', position: 'relative' }}>
            {item.type === 'image' ? (
              <img src={item.image_url} style={{ width: '100%', height: '150px', objectFit: 'cover', marginBottom: '8px' }} />
            ) : (
              <div style={{ height: '150px', overflow: 'hidden', fontSize: '10px', background: 'var(--surface)', padding: '8px', marginBottom: '8px' }}>
                {item.content}
              </div>
            )}
            <div style={{ fontSize: '10px', fontWeight: 700 }}>{item.title}</div>
            <div style={{ fontSize: '9px', color: 'var(--muted)' }}>
              {categories.find(c => c.id === item.category_id)?.name}
            </div>
            <button 
              onClick={() => handleDelete(item)}
              style={{ position: 'absolute', top: '4px', right: '4px', background: '#000', color: 'var(--accent)', fontSize: '10px', padding: '2px 6px' }}
            >
              DEL
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
