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
          padding: 'clamp(120px, 16vw, 220px) clamp(24px, 5vw, 80px) clamp(60px, 8vw, 100px)',
          borderBottom: '1px solid var(--border)',
        }}>
          <a href="/" className="back-link" style={{ marginBottom: 'clamp(32px, 5vw, 56px)', display: 'inline-flex' }}>
            ← HOME
          </a>
          <p style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '16px' }}>
            ERA
          </p>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            textTransform: 'uppercase'
          }}>
            {category.name}
          </h1>
          {items && (
            <p style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', marginTop: '24px' }}>
              {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
            </p>
          )}
        </header>

        <section style={{ padding: 'clamp(80px, 10vw, 160px) clamp(24px, 5vw, 80px)' }}>
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
