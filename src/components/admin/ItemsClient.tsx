'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Category { id: string; name: string }

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

interface QueuedFile {
  id: string
  file: File
  preview: string
  status: 'pending' | 'uploading' | 'done' | 'error'
  uploadedUrl?: string
  error?: string
}

/* ─── Sortable card ─── */
function SortableCard({ item, categories, onDelete }: {
  item: Item; categories: Category[]; onDelete: (item: Item) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        border: '1px solid var(--border)',
        position: 'relative',
        opacity: isDragging ? 0.35 : 1,
        zIndex: isDragging ? 10 : 1,
        backgroundColor: isDragging ? 'var(--surface)' : 'transparent',
        overflow: 'hidden'
      }}
    >
      <div
        {...attributes}
        {...listeners}
        title="Drag to reorder"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: '28px', cursor: isDragging ? 'grabbing' : 'grab',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
          display: 'flex', alignItems: 'center', paddingLeft: '8px',
          zIndex: 2, userSelect: 'none',
          fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em'
        }}
      >
        ⠿
      </div>

      {item.type === 'image' ? (
        <img src={item.image_url} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block', pointerEvents: 'none' }} />
      ) : (
        <div style={{ height: '160px', overflow: 'hidden', fontSize: '10px', background: 'var(--surface)', padding: '12px', lineHeight: 1.6, color: 'var(--muted)' }}>
          {item.content}
        </div>
      )}

      <div style={{ padding: '8px 10px' }}>
        {item.title && <div style={{ fontSize: '10px', fontWeight: 700, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>}
        <div style={{ fontSize: '9px', color: 'var(--muted)' }}>
          {categories.find(c => c.id === item.category_id)?.name}
          {item.year ? ` · ${item.year}` : ''}
        </div>
      </div>

      <button
        onClick={() => onDelete(item)}
        style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.85)', color: 'var(--accent)', fontSize: '9px', padding: '2px 6px', letterSpacing: '0.05em', zIndex: 3 }}
      >
        DEL
      </button>
    </div>
  )
}

/* ─── Main component ─── */
export function ItemsClient({ initialItems, categories }: { initialItems: Item[]; categories: Category[] }) {
  const [items, setItems] = useState(initialItems)
  const [tab, setTab] = useState<'images' | 'text'>('images')
  const [filterCat, setFilterCat] = useState<string | 'all'>('all')
  const [isDragOver, setIsDragOver] = useState(false)
  const [queue, setQueue] = useState<QueuedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [batchMeta, setBatchMeta] = useState({ category_id: categories[0]?.id || '', source: '', year: new Date().getFullYear() })
  const [textForm, setTextForm] = useState({ category_id: categories[0]?.id || '', title: '', content: '', source: '', year: new Date().getFullYear() })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  /* ─── dnd-kit sort ─── */
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setItems(prev => {
      const oldIdx = prev.findIndex(i => i.id === active.id)
      const newIdx = prev.findIndex(i => i.id === over.id)
      const next = arrayMove(prev, oldIdx, newIdx)
      const updates = next.map((item, idx) => ({ id: item.id, category_id: item.category_id, type: item.type, sort_order: idx + 1 }))
      supabase.from('items').upsert(updates).then(({ error }) => { if (error) console.error(error) })
      return next
    })
  }

  /* ─── Image compression ─── */
  const compressImage = (file: File): Promise<File> => new Promise(resolve => {
    if (file.size < 1024 * 1024) { resolve(file); return }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const MAX = 2000
      let { width, height } = img
      if (width > MAX || height > MAX) {
        const r = Math.min(MAX / width, MAX / height)
        width = Math.round(width * r); height = Math.round(height * r)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width; canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file), 'image/jpeg', 0.85)
    }
    img.src = url
  })

  /* ─── Queue management ─── */
  const addFilesToQueue = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    const newEntries: QueuedFile[] = imageFiles.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending'
    }))
    setQueue(prev => [...prev, ...newEntries])
  }, [])

  const removeFromQueue = (id: string) => {
    setQueue(prev => {
      const item = prev.find(q => q.id === id)
      if (item) URL.revokeObjectURL(item.preview)
      return prev.filter(q => q.id !== id)
    })
  }

  const clearDoneFromQueue = () => {
    setQueue(prev => {
      prev.filter(q => q.status === 'done').forEach(q => URL.revokeObjectURL(q.preview))
      return prev.filter(q => q.status !== 'done')
    })
  }

  /* ─── Drop zone handlers ─── */
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    addFilesToQueue(e.dataTransfer.files)
  }

  /* ─── Upload all queued ─── */
  const uploadAll = async () => {
    const pending = queue.filter(q => q.status === 'pending')
    if (!pending.length || !batchMeta.category_id) return
    setIsUploading(true)

    const results: { queueId: string; url: string }[] = []

    await Promise.all(pending.map(async (queued) => {
      setQueue(prev => prev.map(q => q.id === queued.id ? { ...q, status: 'uploading' } : q))
      try {
        const compressed = await compressImage(queued.file)
        const form = new FormData()
        form.append('file', compressed)
        const res = await fetch('/api/upload', { method: 'POST', body: form })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? res.statusText)
        results.push({ queueId: queued.id, url: json.url })
        setQueue(prev => prev.map(q => q.id === queued.id ? { ...q, status: 'done', uploadedUrl: json.url } : q))
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        setQueue(prev => prev.map(q => q.id === queued.id ? { ...q, status: 'error', error: msg } : q))
      }
    }))

    if (results.length > 0) {
      const baseOrder = items.filter(i => i.category_id === batchMeta.category_id).length
      const inserts = results.map((r, idx) => ({
        category_id: batchMeta.category_id,
        type: 'image' as const,
        image_url: r.url,
        source: batchMeta.source || null,
        year: batchMeta.year || null,
        sort_order: baseOrder + idx + 1
      }))
      const { data } = await supabase.from('items').insert(inserts).select()
      if (data) setItems(prev => [...data, ...prev])
    }

    setIsUploading(false)
  }

  /* ─── Add text block ─── */
  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!textForm.category_id || !textForm.content) return
    const { data } = await supabase.from('items').insert([{
      category_id: textForm.category_id,
      type: 'text',
      title: textForm.title || null,
      content: textForm.content,
      source: textForm.source || null,
      year: textForm.year || null,
      sort_order: items.filter(i => i.category_id === textForm.category_id).length + 1
    }]).select().single()
    if (data) {
      setItems(prev => [data, ...prev])
      setTextForm(f => ({ ...f, title: '', content: '', source: '' }))
    }
  }

  /* ─── Delete item ─── */
  const handleDelete = async (item: Item) => {
    if (!confirm('Delete this item?')) return
    if (item.image_url) {
      const path = item.image_url.split('/').pop()
      if (path) await supabase.storage.from('items').remove([`uploads/${path}`])
    }
    const { error } = await supabase.from('items').delete().eq('id', item.id)
    if (!error) setItems(prev => prev.filter(i => i.id !== item.id))
  }

  const filteredItems = filterCat === 'all' ? items : items.filter(i => i.category_id === filterCat)
  const pendingCount = queue.filter(q => q.status === 'pending').length
  const doneCount = queue.filter(q => q.status === 'done').length

  const inputStyle = { width: '100%', background: 'transparent', border: '1px solid var(--border)', padding: '8px 10px', color: 'var(--text)' }
  const labelStyle = { display: 'block', fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.15em', marginBottom: '5px' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

      {/* ─── Tab bar ─── */}
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid var(--border)' }}>
        {(['images', 'text'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px', fontSize: '10px', letterSpacing: '0.15em', fontWeight: 700,
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t ? 'var(--text)' : 'var(--muted)',
              transition: 'all 0.15s ease', marginBottom: '-1px'
            }}
          >
            {t === 'images' ? 'IMAGES' : 'TEXT BLOCK'}
          </button>
        ))}
      </div>

      {/* ─── IMAGES TAB ─── */}
      {tab === 'images' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>

          {/* Drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={onDrop}
            style={{
              border: `2px dashed ${isDragOver ? 'var(--accent)' : 'var(--border)'}`,
              padding: 'clamp(32px, 5vw, 56px) 24px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'border-color 0.15s ease, background 0.15s ease',
              background: isDragOver ? 'rgba(255,0,0,0.03)' : 'transparent',
              boxShadow: isDragOver ? 'var(--glow-sm)' : 'none'
            }}
          >
            <div style={{ fontSize: 'var(--text-xl)', marginBottom: '10px', color: isDragOver ? 'var(--accent)' : 'var(--muted)' }}>↑</div>
            <p style={{ fontSize: '11px', letterSpacing: '0.15em', fontWeight: 700, marginBottom: '6px' }}>
              DROP IMAGES HERE
            </p>
            <p style={{ fontSize: '10px', color: 'var(--muted)' }}>or click to browse — multiple files supported</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={e => { if (e.target.files) addFilesToQueue(e.target.files); e.target.value = '' }}
            />
          </div>

          {/* Queue */}
          {queue.length > 0 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '10px', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                  QUEUE — {queue.length} FILE{queue.length !== 1 ? 'S' : ''}
                  {doneCount > 0 && ` · ${doneCount} UPLOADED`}
                </span>
                {doneCount > 0 && (
                  <button onClick={clearDoneFromQueue} style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                    CLEAR DONE
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                {queue.map(q => (
                  <div key={q.id} style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', border: `1px solid ${q.status === 'error' ? 'var(--accent)' : q.status === 'done' ? '#22c55e' : 'var(--border)'}` }}>
                    <img src={q.preview} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    {/* Status overlay */}
                    {q.status === 'uploading' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--accent)' }}>
                        UPLOADING
                      </div>
                    )}
                    {q.status === 'done' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                        ✓
                      </div>
                    )}
                    {q.status === 'error' && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: 'var(--accent)', textAlign: 'center', padding: '4px' }}>
                        ERROR
                      </div>
                    )}
                    {q.status === 'pending' && (
                      <button
                        onClick={() => removeFromQueue(q.id)}
                        style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(0,0,0,0.8)', color: 'var(--accent)', fontSize: '10px', padding: '1px 5px', lineHeight: 1.4 }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Batch settings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label style={labelStyle}>CATEGORY</label>
              <select value={batchMeta.category_id} onChange={e => setBatchMeta(m => ({ ...m, category_id: e.target.value }))} style={{ ...inputStyle, background: '#000' }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>SOURCE</label>
              <input value={batchMeta.source} onChange={e => setBatchMeta(m => ({ ...m, source: e.target.value }))} placeholder="Photographer / Source" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>YEAR</label>
              <input type="number" value={batchMeta.year} onChange={e => setBatchMeta(m => ({ ...m, year: parseInt(e.target.value) }))} style={inputStyle} />
            </div>
          </div>

          <button
            onClick={uploadAll}
            disabled={pendingCount === 0 || isUploading}
            style={{
              backgroundColor: pendingCount > 0 && !isUploading ? 'var(--accent)' : 'transparent',
              color: pendingCount > 0 && !isUploading ? '#000' : 'var(--muted)',
              border: `1px solid ${pendingCount > 0 && !isUploading ? 'var(--accent)' : 'var(--border)'}`,
              padding: '14px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              fontSize: '11px',
              transition: 'all 0.15s ease',
              cursor: pendingCount > 0 && !isUploading ? 'pointer' : 'not-allowed'
            }}
          >
            {isUploading ? 'UPLOADING...' : pendingCount > 0 ? `UPLOAD ${pendingCount} IMAGE${pendingCount !== 1 ? 'S' : ''}` : 'SELECT IMAGES TO UPLOAD'}
          </button>
        </div>
      )}

      {/* ─── TEXT BLOCK TAB ─── */}
      {tab === 'text' && (
        <form onSubmit={handleTextSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div>
            <label style={labelStyle}>CATEGORY</label>
            <select value={textForm.category_id} onChange={e => setTextForm(f => ({ ...f, category_id: e.target.value }))} style={{ ...inputStyle, background: '#000' }}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>TITLE</label>
            <input value={textForm.title} onChange={e => setTextForm(f => ({ ...f, title: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>CONTENT *</label>
            <textarea value={textForm.content} onChange={e => setTextForm(f => ({ ...f, content: e.target.value }))} required style={{ ...inputStyle, height: '120px', resize: 'vertical' }} />
          </div>
          <div>
            <label style={labelStyle}>SOURCE</label>
            <input value={textForm.source} onChange={e => setTextForm(f => ({ ...f, source: e.target.value }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>YEAR</label>
            <input type="number" value={textForm.year} onChange={e => setTextForm(f => ({ ...f, year: parseInt(e.target.value) }))} style={inputStyle} />
          </div>
          <button type="submit" style={{ gridColumn: '1 / -1', backgroundColor: 'var(--accent)', color: '#000', padding: '12px', fontWeight: 700, letterSpacing: '0.1em', fontSize: '11px' }}>
            ADD TEXT BLOCK
          </button>
        </form>
      )}

      {/* ─── Gallery grid ─── */}
      <div>
        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '9px', color: 'var(--muted)', letterSpacing: '0.15em', marginRight: '4px' }}>FILTER:</span>
          {[{ id: 'all', name: `ALL (${items.length})` }, ...categories.map(c => ({ id: c.id, name: `${c.name} (${items.filter(i => i.category_id === c.id).length})` }))].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilterCat(opt.id)}
              style={{
                fontSize: '9px', padding: '4px 10px', letterSpacing: '0.1em', fontWeight: 700,
                border: '1px solid ' + (filterCat === opt.id ? 'var(--accent)' : 'var(--border)'),
                color: filterCat === opt.id ? 'var(--accent)' : 'var(--muted)',
                background: filterCat === opt.id ? 'rgba(255,0,0,0.06)' : 'transparent',
                transition: 'all 0.1s ease'
              }}
            >
              {opt.name}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <p style={{ fontSize: '10px', color: 'var(--muted)', padding: 'var(--space-8) 0' }}>No items yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredItems.map(i => i.id)} strategy={rectSortingStrategy}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-3)' }}>
                {filteredItems.map(item => (
                  <SortableCard key={item.id} item={item} categories={categories} onDelete={handleDelete} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
