import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const SEED_CATEGORIES = [
  { name: 'ACT I — RENAISSANCE', slug: 'act-i',           sort_order: 1 },
  { name: 'ACT II — COWBOY CARTER', slug: 'act-ii',        sort_order: 2 },
  { name: 'LEMONADE',               slug: 'lemonade',       sort_order: 3 },
  { name: 'BEYONCÉ',                slug: 'beyonce',        sort_order: 4 },
  { name: '4',                       slug: '4',             sort_order: 5 },
  { name: 'DANGEROUSLY IN LOVE',    slug: 'dangerously-in-love', sort_order: 6 },
  { name: 'ARCHIVE',                slug: 'archive',        sort_order: 7 },
]

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data: existing } = await supabase.from('categories').select('id').limit(1)
  if (existing && existing.length > 0) {
    return NextResponse.json({ message: 'Already seeded' })
  }

  const { error } = await supabase.from('categories').insert(SEED_CATEGORIES)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: 'Seeded successfully' })
}
