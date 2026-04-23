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
          padding: 'var(--space-20) var(--space-6) var(--space-12)',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <p style={{ color: 'var(--accent)', fontSize: 'var(--text-xs)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
              Era
            </p>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, letterSpacing: '0.04em' }}>
              {category.name}
            </h1>
          </div>
        </header>
        <section style={{ padding: 'var(--space-12) var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
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
