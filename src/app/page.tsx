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
        <section style={{ padding: 'clamp(80px, 10vw, 140px) clamp(24px, 5vw, 80px)' }}>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 'clamp(40px, 6vw, 80px)' }}>
            Select an era to explore
          </p>
          <div>
            {(categories ?? []).map((cat, i) => (
              <a
                key={cat.id}
                href={`/era/${cat.slug}`}
                className="era-row"
              >
                <span style={{ fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.3em', fontWeight: 700 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h2 className="era-row__name">
                  {cat.name}
                </h2>
                <span style={{ fontSize: '18px', color: 'var(--muted)', transition: 'color 0.2s ease' }}>→</span>
              </a>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
