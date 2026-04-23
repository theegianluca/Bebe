import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/Hero'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'

export const revalidate = 60

export default async function Home() {
  const supabase = createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  return (
    <>
      <Navigation categories={categories ?? []} />
      <main>
        <Hero />
        <section style={{ padding: 'var(--space-16) var(--space-6)', maxWidth: '1400px', margin: '0 auto' }}>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 'var(--space-8)' }}>
            Select an era to explore
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
            {(categories ?? []).map((cat, i) => (
              <a
                key={cat.id}
                href={`/era/${cat.slug}`}
                style={{
                  display: 'block',
                  padding: 'var(--space-6) var(--space-4)',
                  border: '1px solid var(--border)',
                  transition: 'border-color var(--transition), background var(--transition)',
                  animationDelay: `${i * 60}ms`,
                }}
                className="era-card"
              >
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', letterSpacing: '0.2em' }}>
                  0{i + 1}
                </span>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginTop: 'var(--space-2)', letterSpacing: '0.05em' }}>
                  {cat.name}
                </h2>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
      <style>{`
        .era-card:hover {
          border-color: var(--accent) !important;
          background: rgba(255,0,0,0.04) !important;
        }
      `}</style>
    </>
  )
}
