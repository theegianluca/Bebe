import { createClient } from '@/lib/supabase/server'
import { ItemsClient } from '@/components/admin/ItemsClient'

export const dynamic = 'force-dynamic'

export default async function ItemsPage() {
  const supabase = createClient()
  const [{ data: categories }, { data: items }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('items').select('*').order('category_id').order('sort_order'),
  ])
  return <ItemsClient initialItems={items ?? []} categories={categories ?? []} />
}
