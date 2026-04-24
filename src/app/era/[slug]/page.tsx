import type { CSSProperties } from 'react'
import { createClient, createStaticClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { MasonryGallery } from '@/components/MasonryGallery'
import { Footer } from '@/components/Footer'

export const revalidate = 60

interface Props { params: { slug: string } }

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data } = await supabase.from('categories').select('slug')
  return (data ?? []).map((c) => ({ slug: c.slug }))
}

export default async function EraPage({ params }: Props) {
  const supabase = createClient()

  const [{ data: categories }, { data: category }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('categories').select('*').eq('slug', params.slug).single(),
  ])

  if (!category) notFound()

  const { data: items } = await supabase
    .from('items')
    .select('*')
    .eq('category_id', category.id)
    .order('sort_order')

  return (
    <>
      <Navigation categories={categories ?? []} />
      <main style={{ minHeight: '100dvh' }}>

        <header style={{
          padding: 'clamp(140px, 18vw, 260px) clamp(32px, 6vw, 100px) clamp(80px, 10vw, 140px)',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Ghost era name in background */}
          <div aria-hidden="true" style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'flex-end',
            paddingLeft: 'clamp(16px, 4vw, 60px)',
            paddingBottom: 'clamp(20px, 4vw, 60px)',
            pointerEvents: 'none',
            overflow: 'hidden',
          }}>
            <span style={{
              fontFamily: 'var(--font)',
              fontWeight: 700,
              fontSize: 'clamp(18vw, 24vw, 36vw)',
              letterSpacing: '0.02em',
              lineHeight: 0.82,
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.04)',
              whiteSpace: 'nowrap',
              userSelect: 'none',
            }}>
              {category.name}
            </span>
          </div>

          <a href="/" className="back-link reveal" style={{ marginBottom: 'clamp(48px, 7vw, 90px)', display: 'inline-flex', color: 'var(--text)', position: 'relative', zIndex: 1 }}>
            ← HOME
          </a>

          <div className="reveal" style={{ '--reveal-delay': '0.1s', position: 'relative', zIndex: 1 } as CSSProperties}>
            <span style={{
              display: 'block',
              fontSize: 'clamp(8rem, 16vw, 20rem)',
              color: 'rgba(255,150,150,0.9)',
              lineHeight: 0.85,
              marginBottom: '0.25em',
            }}>★</span>
            <p style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'var(--text-xs)',
              color: 'rgba(255,255,255,1)',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              marginBottom: 'clamp(16px, 2.5vw, 32px)'
            }}>
              ERA
            </p>
            <h1 style={{
              fontFamily: 'var(--font)',
              fontWeight: 700,
              fontSize: 'var(--text-2xl)',
              letterSpacing: '0.02em',
              lineHeight: 0.88,
              textTransform: 'uppercase'
            }}>
              {category.name}
            </h1>
          </div>

          {items && (
            <p
              className="reveal"
              style={{
                '--reveal-delay': '0.22s',
                fontFamily: 'var(--font-text)',
                fontSize: 'var(--text-xs)',
                color: 'rgba(255,255,255,1)',
                letterSpacing: '0.28em',
                marginTop: 'clamp(28px, 4vw, 56px)',
                textTransform: 'uppercase',
                position: 'relative',
                zIndex: 1,
              } as CSSProperties}
            >
              {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
            </p>
          )}
        </header>

        <section style={{ padding: '0 clamp(32px, 6vw, 100px) clamp(80px, 10vw, 160px)' }}>
          {items && items.length > 0 ? (
            <MasonryGallery items={items} />
          ) : (
            <p style={{ fontFamily: 'var(--font-text)', fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>No items yet in this era.</p>
          )}
        </section>

      </main>
      <Footer />
    </>
  )
}
