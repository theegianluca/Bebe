import type { Metadata } from 'next'
import './globals.css'
import { CopyrightGate } from '@/components/CopyrightGate'

export const metadata: Metadata = {
  title: 'BEBE — Beyoncé Archive',
  description: 'An unofficial, non-commercial fan archive organized by era.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <CopyrightGate />
        {children}
      </body>
    </html>
  )
}
