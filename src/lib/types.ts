export interface Category {
  id: string
  name: string
  slug: string
  sort_order: number
  created_at: string
}

export interface Item {
  id: string
  category_id: string
  type: 'image' | 'text'
  image_url: string | null
  content: string | null
  title: string | null
  source: string | null
  year: number | null
  sort_order: number
  created_at: string
}
