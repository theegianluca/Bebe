'use client'

import { useEffect } from 'react'

export function ScrollRevealInit() {
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    if (!targets.length) return

    const observer = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('revealed', e.isIntersecting)),
      { threshold: 0.07, rootMargin: '0px 0px -44px 0px' }
    )

    targets.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}
