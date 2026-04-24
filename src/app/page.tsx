import type { CSSProperties } from 'react'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/server'
import { Hero } from '@/components/Hero'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Marquee } from '@/components/Marquee'

export const revalidate = 60

export default async function Home() {
  const supabase = createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order')

  let heroFront: string | undefined
  let heroBack: string | undefined
  try {
    const sc = createStaticClient()
    const { data } = await sc.from('settings').select('key, value')
    if (data) {
      const map = Object.fromEntries(data.map((s: { key: string; value: string }) => [s.key, s.value]))
      heroFront = map['hero_front_url'] || undefined
      heroBack  = map['hero_back_url']  || undefined
    }
  } catch {}

  return (
    <>
      <Navigation categories={categories ?? []} />
      <main>
        <Hero frontImage={heroFront} backImage={heroBack} />

        <Marquee />

        <section style={{ padding: 'clamp(100px, 14vw, 200px) clamp(32px, 6vw, 100px)' }}>
          <div className="reveal" style={{ marginBottom: 'clamp(60px, 8vw, 120px)' }}>
            <span style={{
              display: 'block',
              fontSize: 'clamp(6rem, 12vw, 16rem)',
              color: 'var(--text)',
              lineHeight: 0.85,
              marginBottom: '0.3em',
            }}>★</span>
            <p style={{
              fontFamily: 'var(--font-text)',
              fontSize: 'clamp(1.2rem, 3vw, 2rem)',
              color: 'rgba(255,150,150,0.9)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}>
              Select an era to explore
            </p>
          </div>

          <div>
            {(categories ?? []).map((cat, i) => {
              const total = categories?.length ?? 0
              const reverseNum = total - i
              return (
              <a
                key={cat.id}
                href={`/era/${cat.slug}`}
                className="era-row reveal"
                style={{ '--reveal-delay': `${i * 0.07}s` } as CSSProperties}
              >
                <span style={{
                  fontFamily: 'var(--font)',
                  fontWeight: 700,
                  fontSize: 'clamp(2.8rem, 6vw, 9rem)',
                  color: '#000000',
                  letterSpacing: '0.01em',
                }}>
                  ({String(reverseNum).padStart(2, '0')})
                </span>
                <h2 className="era-row__name">
                  {cat.name}
                </h2>
                <span className="era-row__arrow" style={{ fontSize: 'clamp(14px, 2vw, 22px)', color: 'var(--muted)' }}>→</span>
              </a>
            )
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
