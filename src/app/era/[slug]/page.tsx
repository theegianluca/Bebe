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
        }}>
          <a href="/" className="back-link reveal" style={{ marginBottom: 'clamp(48px, 7vw, 90px)', display: 'inline-flex', color: 'var(--muted)' }}>
            ← HOME
          </a>

          <div className="reveal" style={{ '--reveal-delay': '0.1s' } as CSSProperties}>
            <p style={{
              fontSize: '8px',
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.5em',
              textTransform: 'uppercase',
              marginBottom: 'clamp(16px, 2.5vw, 32px)'
            }}>
              ERA
            </p>
            <h1 style={{
              fontFamily: 'var(--font)',
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
                color: 'rgba(255,255,255,0.22)',
                fontSize: '9px',
                letterSpacing: '0.3em',
                marginTop: 'clamp(28px, 4vw, 56px)',
                textTransform: 'uppercase'
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
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>No items yet in this era.</p>
          )}
        </section>

      </main>
      <Footer />
    </>
  )
}
