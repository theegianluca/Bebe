'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
}

function SortableItem({ category, onDelete, onEdit }: { 
  category: Category, 
  onDelete: (id: string) => void,
  onEdit: (cat: Category) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 'var(--space-4)',
    border: '1px solid var(--border)',
    marginBottom: 'var(--space-2)',
    backgroundColor: isDragging ? 'var(--surface)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: isDragging ? 10 : 1
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
        <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--muted)' }}>
          ⠿
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>{category.name}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>/{category.slug}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button onClick={() => onEdit(category)} style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>EDIT</button>
        <button onClick={() => onDelete(category.id)} style={{ fontSize: 'var(--text-xs)', color: 'var(--accent)' }}>DELETE</button>
      </div>
    </div>
  )
}

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories)
  const [isEditing, setIsEditing] = useState<Category | null>(null)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)
        const newArray = arrayMove(items, oldIndex, newIndex)
        
        // Update sort_order in background
        const updates = newArray.map((cat, index) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          sort_order: index + 1
        }))
        
        supabase.from('categories').upsert(updates).then(({ error }) => {
          if (error) console.error('Error updating order:', error)
        })

        return newArray
      })
    }
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    if (!newName || !newSlug) return

    if (isEditing) {
      const { data } = await supabase
        .from('categories')
        .update({ name: newName, slug: newSlug })
        .eq('id', isEditing.id)
        .select()
        .single()
      
      if (data) {
        setCategories(categories.map(c => c.id === data.id ? data : c))
        setIsEditing(null)
        setNewName('')
        setNewSlug('')
      }
    } else {
      const { data } = await supabase
        .from('categories')
        .insert([{ name: newName, slug: newSlug, sort_order: categories.length + 1 }])
        .select()
        .single()
      
      if (data) {
        setCategories([...categories, data])
        setNewName('')
        setNewSlug('')
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This will delete all items in this category.')) return
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setCategories(categories.filter(c => c.id !== id))
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>Categories</h2>
      
      <form onSubmit={handleSave} style={{ 
        marginBottom: 'var(--space-8)', 
        padding: 'var(--space-4)', 
        border: '1px solid var(--border)',
        display: 'flex',
        gap: 'var(--space-4)',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>NAME</label>
          <input 
            value={newName} 
            onChange={e => setNewName(e.target.value)}
            placeholder="e.g. ACT I — RENAISSANCE"
            style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', padding: '8px' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>SLUG</label>
          <input 
            value={newSlug} 
            onChange={e => setNewSlug(e.target.value)}
            placeholder="e.g. act-i"
            style={{ width: '100%', background: 'transparent', border: '1px solid var(--border)', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ 
          backgroundColor: 'var(--accent)', 
          color: '#000', 
          padding: '8px 24px', 
          fontWeight: 700,
          height: '40px'
        }}>
          {isEditing ? 'UPDATE' : 'ADD'}
        </button>
        {isEditing && (
           <button type="button" onClick={() => { setIsEditing(null); setNewName(''); setNewSlug(''); }} style={{ height: '40px', padding: '0 16px' }}>CANCEL</button>
        )}
      </form>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={categories.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((cat) => (
            <SortableItem 
              key={cat.id} 
              category={cat} 
              onDelete={handleDelete}
              onEdit={(c) => {
                setIsEditing(c)
                setNewName(c.name)
                setNewSlug(c.slug)
              }}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}
