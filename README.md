# BEBE — Beyoncé Archive

Unofficial, non-commercial fan site. Dark editorial archive organized by era.

## Stack
- **Next.js 14** (App Router)
- **Supabase** (Database + Auth + Storage)
- **Netlify** (Hosting)

## Setup

### 1. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xsbhqmhkqjwxvqvreiqo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Database Setup

Run `supabase/schema.sql` in the Supabase SQL editor.

Then seed categories via `supabase/seed.sql` or visit `/api/seed` once after deployment.

### 3. Supabase Storage

Create a **public** storage bucket named `items` in the Supabase dashboard.

### 4. Auth

In Supabase → Authentication → Users, create a user with email `gianlucaraddatz@icloud.com`.

### 5. Local Development

```bash
npm install
npm run dev
```

### 6. Netlify Deployment

Connect GitHub repo → add env vars → deploy.

## Routes

```
/                    Home — Hero + Era grid
/era/[slug]          Gallery per era (masonry)
/login               Admin login
/admin               Dashboard
/admin/categories    CRUD categories + reorder
/admin/items         Upload images + text blocks
/api/seed            One-time category seed
/api/upload          Image upload to Supabase Storage
```

## Legal

Fan site — not affiliated with Beyoncé, Parkwood Entertainment, or Columbia Records.
Takedown: takedown@bebe-archive.com
