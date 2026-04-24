import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { PasswordGate } from '@/components/PasswordGate'
import { ScrollRevealInit } from '@/components/ScrollRevealInit'
import { createStaticClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'TBFP — The Beyoncé Fan Project',
  description: 'An unofficial, non-commercial fan archive organized by era.',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  let introImages: string[] = []
  try {
    const supabase = createStaticClient()
    const { data } = await supabase.from('settings').select('key, value')
    if (data) {
      const map = Object.fromEntries(data.map((s: { key: string; value: string }) => [s.key, s.value]))
      introImages = [1, 2, 3, 4].map(n => map[`intro_image_${n}`]).filter(Boolean)
    }
  } catch {}

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <PasswordGate introImages={introImages} />
        <ScrollRevealInit />
        {children}
      </body>
    </html>
  )
}
