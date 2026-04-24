'use client'

import { useRef, useCallback } from 'react'
import type { MouseEvent, TouchEvent } from 'react'

interface Props {
    frontImage?: string
    backImage?: string
}

export function Hero({ frontImage, backImage }: Props) {
    const containerRef = useRef<HTMLDivElement>(null)
    const maskLayerRef = useRef<HTMLDivElement>(null)
    const cursorRef = useRef<HTMLDivElement>(null)
    const fadeTimerRef = useRef<NodeJS.Timeout | null>(null)
    const rafRef = useRef<number | null>(null)
    const noiseTimerRef = useRef<NodeJS.Timeout | null>(null)

    const currentRadius = useRef(0)
    const targetRadius = useRef(0)
    const posRef = useRef({ x: 0, y: 0 })
    const targetPos = useRef({ x: 0, y: 0 })

    const noiseRef = useRef(0)
    const noiseTargetRef = useRef(0)

    const velRef = useRef({ x: 0, y: 0 })
    const lastMouseRef = useRef({ x: 0, y: 0 })

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t

    const applyMask = useCallback(() => {
        if (!maskLayerRef.current) return
        const { x, y } = posRef.current
        const base = Math.max(0, currentRadius.current)
        const n = noiseRef.current
        const vx = velRef.current.x
        const vy = velRef.current.y

        const stretchX = Math.abs(vx) * 0.5
        const stretchY = Math.abs(vy) * 0.5

        const rx = Math.max(1, base + stretchX + n * 0.5)
        const ry = Math.max(1, base + stretchY - n * 0.3)

        const offsetX = vx * 0.4
        const offsetY = vy * 0.4

        const mask = `radial-gradient(ellipse ${rx}px ${ry}px at ${x + offsetX}px ${y + offsetY}px, black 55%, transparent 100%)`
        maskLayerRef.current.style.setProperty('-webkit-mask-image', mask)
        maskLayerRef.current.style.setProperty('mask-image', mask)
    }, [])

    const tickNoise = useCallback(() => {
        noiseTargetRef.current = (Math.random() - 0.5) * 16
        noiseTimerRef.current = setTimeout(tickNoise, 350 + Math.random() * 300)
    }, [])

    const animateRadius = useCallback(() => {
        const dist = Math.abs(targetRadius.current - currentRadius.current)
        const t = Math.min(0.12 + dist * 0.0003, 0.22)

        currentRadius.current = lerp(currentRadius.current, targetRadius.current, t)
        posRef.current.x = lerp(posRef.current.x, targetPos.current.x, 0.15)
        posRef.current.y = lerp(posRef.current.y, targetPos.current.y, 0.15)
        noiseRef.current = lerp(noiseRef.current, noiseTargetRef.current, 0.04)

        velRef.current.x = lerp(velRef.current.x, 0, 0.05)
        velRef.current.y = lerp(velRef.current.y, 0, 0.05)

        applyMask()

        const stillMoving =
            Math.abs(targetRadius.current - currentRadius.current) > 0.5 ||
            Math.abs(targetPos.current.x - posRef.current.x) > 0.5 ||
            Math.abs(targetPos.current.y - posRef.current.y) > 0.5 ||
            Math.abs(noiseTargetRef.current - noiseRef.current) > 0.2 ||
            Math.abs(velRef.current.x) > 0.1 ||
            Math.abs(velRef.current.y) > 0.1

        if (stillMoving) {
            rafRef.current = requestAnimationFrame(animateRadius)
        } else {
            currentRadius.current = targetRadius.current
            posRef.current.x = targetPos.current.x
            posRef.current.y = targetPos.current.y
            noiseRef.current = noiseTargetRef.current
            velRef.current = { x: 0, y: 0 }
            applyMask()
        }
    }, [applyMask])

    const handleMouseEnter = () => {
        if (maskLayerRef.current) {
            maskLayerRef.current.style.transition = 'opacity 0.2s ease'
            maskLayerRef.current.style.opacity = '1'
        }
        tickNoise()
    }

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return
        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)

        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const rawVx = x - lastMouseRef.current.x
        const rawVy = y - lastMouseRef.current.y
        lastMouseRef.current = { x, y }

        velRef.current.x = lerp(velRef.current.x, rawVx, 0.25)
        velRef.current.y = lerp(velRef.current.y, rawVy, 0.25)

        const speed = Math.sqrt(
            velRef.current.x ** 2 + velRef.current.y ** 2
        )

        // Ruhend ~220px, schnelle Bewegung bis ~360px
        targetRadius.current = 220 + Math.min(speed * 6, 140)

        targetPos.current = { x, y }

        if (cursorRef.current) {
            cursorRef.current.style.transform = `translate(${x}px, ${y}px)`
            cursorRef.current.style.opacity = '1'
        }

        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(animateRadius)
    }

    const handleMouseLeave = () => {
        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
        if (noiseTimerRef.current) clearTimeout(noiseTimerRef.current)

        noiseTargetRef.current = 0
        velRef.current = { x: 0, y: 0 }

        if (cursorRef.current) cursorRef.current.style.opacity = '0'

        fadeTimerRef.current = setTimeout(() => {
            targetRadius.current = 0

            if (maskLayerRef.current) {
                maskLayerRef.current.style.transition = 'opacity 0.5s ease'
                maskLayerRef.current.style.opacity = '0'
            }

            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = requestAnimationFrame(animateRadius)
        }, 400)
    }

    const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
        if (!containerRef.current || !hasBothImages) return
        const touch = e.touches[0]
        const rect = containerRef.current.getBoundingClientRect()

        targetPos.current = {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        }

        if (maskLayerRef.current) {
            maskLayerRef.current.style.transition = 'opacity 0.2s ease'
            maskLayerRef.current.style.opacity = '1'
        }

        tickNoise()
        targetRadius.current = 220

        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        rafRef.current = requestAnimationFrame(animateRadius)

        setTimeout(() => {
            targetRadius.current = 0
            noiseTargetRef.current = 0
            velRef.current = { x: 0, y: 0 }
            if (noiseTimerRef.current) clearTimeout(noiseTimerRef.current)

            if (maskLayerRef.current) {
                maskLayerRef.current.style.transition = 'opacity 0.5s ease'
                maskLayerRef.current.style.opacity = '0'
            }

            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = requestAnimationFrame(animateRadius)
        }, 800)
    }

    const hasBothImages = !!(frontImage && backImage)
    const isTouch =
        typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

    return (
        <section
            onMouseEnter={hasBothImages && !isTouch ? handleMouseEnter : undefined}
            onMouseMove={hasBothImages && !isTouch ? handleMouseMove : undefined}
            onMouseLeave={hasBothImages && !isTouch ? handleMouseLeave : undefined}
            onTouchStart={hasBothImages ? handleTouchStart : undefined}
            style={{
                minHeight: '100vh',
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: hasBothImages && !isTouch ? 'none' : 'default',
                padding: 'clamp(40px, 6vw, 80px)',
            }}
        >

            {/* ─── Image pair ─── */}
            <div
                ref={containerRef}
                style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
            >
                {backImage && (
                    <img
                        src={backImage} alt="" draggable={false}
                        style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover', objectPosition: 'top', display: 'block',
                        }}
                    />
                )}

                {frontImage && (
                    <div
                        ref={maskLayerRef}
                        style={{
                            position: 'absolute', inset: 0, opacity: 0,
                            WebkitMaskImage: 'radial-gradient(ellipse 0px 0px at 50% 50%, black 55%, transparent 100%)',
                            maskImage: 'radial-gradient(ellipse 0px 0px at 50% 50%, black 55%, transparent 100%)',
                        }}
                    >
                        <img
                            src={frontImage} alt="" draggable={false}
                            style={{
                                width: '100%', height: '100%',
                                objectFit: 'cover', objectPosition: 'top', display: 'block',
                            }}
                        />
                    </div>
                )}

                {/* Custom cursor */}
                {hasBothImages && !isTouch && (
                    <div
                        ref={cursorRef}
                        style={{
                            position: 'absolute', top: 0, left: 0,
                            width: 10, height: 10, borderRadius: '50%',
                            background: 'var(--text)',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none', zIndex: 30, opacity: 0,
                            mixBlendMode: 'difference',
                            transition: 'opacity 0.2s ease',
                            willChange: 'transform',
                        }}
                    />
                )}

                {!frontImage && !backImage && (
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundColor: 'var(--surface)',
                        border: '2px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
            <span style={{
                fontFamily: 'var(--font-text)', fontSize: 'var(--text-xs)',
                color: 'var(--text)', letterSpacing: '0.18em', textTransform: 'uppercase',
            }}>
              ADD IMAGES IN ADMIN → SETTINGS
            </span>
                    </div>
                )}

                {hasBothImages && (
                    <div style={{
                        position: 'absolute',
                        bottom: 'clamp(28px, 4vw, 52px)', right: 'clamp(32px, 6vw, 100px)',
                        fontFamily: 'var(--font-text)', fontSize: 'var(--text-xs)',
                        color: 'var(--text)', letterSpacing: '0.16em',
                        textTransform: 'uppercase', pointerEvents: 'none',
                    }}>
                        {isTouch ? 'TAP TO REVEAL' : 'HOVER TO REVEAL'}
                    </div>
                )}
            </div>

            {/* ─── Text ─── */}
            <div style={{
                position: 'relative', zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                gap: 'clamp(24px, 4vw, 56px)',
                padding: 'clamp(100px, 12vw, 160px) clamp(32px, 6vw, 100px) clamp(80px, 10vw, 130px)',
                pointerEvents: 'none',
            }}>
                <h1 style={{
                    fontFamily: 'var(--font)', fontWeight: 900,
                    fontSize: 'clamp(8rem, 20vw, 20rem)',
                    letterSpacing: '0.04em', lineHeight: 0.82,
                    textTransform: 'uppercase',
                    writingMode: 'vertical-rl', textOrientation: 'mixed',
                    color: 'var(--bg)',
                }}>
                    TBFP
                </h1>
            </div>

            {/* ─── Bottom label ─── */}
            <div style={{
                position: 'absolute',
                bottom: 'clamp(28px, 4vw, 52px)', left: 'clamp(32px, 6vw, 100px)',
                zIndex: 10,
            }}>
                <p style={{
                    fontFamily: 'var(--font-text)', fontSize: 'var(--text-xs)',
                    letterSpacing: '0.22em', color: 'var(--text)',
                    textTransform: 'uppercase', margin: 0,
                }}>
                    THE BEYONCÉ FAN PROJECT
                </p>
            </div>

        </section>
    )
}