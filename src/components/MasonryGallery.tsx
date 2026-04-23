'use client'

import { useState } from 'react'

interface Item {
  id: string
  type: 'image' | 'text'
  image_url?: string
  content?: string
  title?: string
  source?: string
  year?: number
}

export function MasonryGallery({ items }: { items: Item[] }) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)

  return (
    <>
      <div className="masonry">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="masonry-item"
            onClick={() => setSelectedItem(item)}
            style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          >
            {item.type === 'image' ? (
              <div className="gallery-card">
                <img 
                  src={item.image_url} 
                  alt={item.title || ''} 
                  style={{ width: '100%', display: 'block', transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
                />
                <div className="gallery-overlay">
                  <div style={{ fontSize: '10px', letterSpacing: '0.1em' }}>
                    {item.source} {item.year && `— ${item.year}`}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                padding: 'var(--space-8)',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                minHeight: '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)', marginBottom: 'var(--space-4)', letterSpacing: '0.1em' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text)', lineHeight: 1.6 }}>
                  {item.content}
                </p>
                {item.source && (
                   <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: 'var(--space-4)', letterSpacing: '0.1em' }}>
                    SOURCE: {item.source}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedItem && (
        <div 
          onClick={() => setSelectedItem(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-8)',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <button 
            onClick={() => setSelectedItem(null)}
            style={{ 
              position: 'absolute', 
              top: 'var(--space-8)', 
              right: 'var(--space-8)', 
              color: 'var(--accent)', 
              fontSize: '32px',
              lineHeight: 1,
              padding: 'var(--space-2)'
            }}
          >
            &times;
          </button>
          
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '80vh', position: 'relative' }}
          >
            {selectedItem.type === 'image' ? (
              <img 
                src={selectedItem.image_url} 
                alt={selectedItem.title || ''} 
                style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ padding: 'var(--space-12)', backgroundColor: 'var(--surface)', border: '1px solid var(--accent)', maxWidth: '600px' }}>
                <h2 style={{ color: 'var(--accent)', marginBottom: 'var(--space-6)' }}>{selectedItem.title}</h2>
                <p style={{ lineHeight: 1.8 }}>{selectedItem.content}</p>
              </div>
            )}
            
            <div style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', letterSpacing: '0.1em' }}>
                {selectedItem.source} {selectedItem.year && `(${selectedItem.year})`}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-card {
          position: relative;
          overflow: hidden;
        }
        .gallery-card:hover img {
          transform: scale(1.05);
        }
        .gallery-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent 40%);
          display: flex;
          align-items: flex-end;
          padding: var(--space-4);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .gallery-card:hover .gallery-overlay {
          opacity: 1;
        }
      `}</style>
    </>
  )
}
