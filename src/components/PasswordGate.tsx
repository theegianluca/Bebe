'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import type { FormEvent } from 'react'

interface Props {
    introImages?: string[]
}

type IntroPhase = 'intro' | 'final' | 'fadeOut' | 'done'
type GatePhase = 'boot' | 'locked' | 'wrong' | 'done'

interface SequenceItem {
    text: string
    dur: number
    small?: boolean
    accent?: boolean
}

const sequence: SequenceItem[] = [
    { text: 'THIS IS',                         dur: 120 },
    { text: 'TBFP',                            dur: 380 },
    { text: 'THIS IS',                         dur: 90  },
    { text: 'THE',                             dur: 110 },
    { text: 'BEYONCÉ',                         dur: 260 },
    { text: 'THIS IS',                         dur: 80  },
    { text: 'FAN',                             dur: 90  },
    { text: 'PROJECT',                         dur: 160 },
    { text: 'THE\nBEYONCÉ\nFAN PROJECT',       dur: 480, small: true },
    { text: 'TBFP',                            dur: 180 },
    { text: '★',                               dur: 140, accent: true },
    { text: 'THIS IS\nTBFP',                   dur: 480, small: true },
    { text: 'TBFP',                            dur: 160 },
    { text: '★',                               dur: 100, accent: true },
    { text: 'THE\nBEYONCÉ\nFAN\nPROJECT',     dur: 560, small: true },
]

const redBgBeats = new Set([1, 4, 10, 13])

const INTRO_COOLDOWN_MS = 10 * 60 * 1000 // 10 Minuten

function shouldShowIntro(): boolean {
    const raw = localStorage.getItem('tbfp-intro-ts')
    if (!raw) return true
    return Date.now() - parseInt(raw, 10) > INTRO_COOLDOWN_MS
}

function markIntroSeen() {
    localStorage.setItem('tbfp-intro-ts', String(Date.now()))
}

export function PasswordGate({ introImages }: Props) {
    const pathname = usePathname()
    const [showIntro, setShowIntro] = useState(false)
    const [introPhase, setIntroPhase] = useState<IntroPhase>('intro')
    const [gatePhase, setGatePhase] = useState<GatePhase>('boot')

    const [currentText, setCurrentText] = useState('')
    const [textSmall, setTextSmall] = useState(false)
    const [textAccent, setTextAccent] = useState(false)
    const [wordOpacity, setWordOpacity] = useState(1)
    const [bgRed, setBgRed] = useState(false)
    const [flashOpacity, setFlashOpacity] = useState(0)
    const [flashDur, setFlashDur] = useState(80)

    const [password, setPassword] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const cancelledRef = useRef(false)

    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    const doFlash = (strength: number, dur: number) => {
        setFlashDur(0)
        setFlashOpacity(strength)
        setTimeout(() => {
            setFlashDur(dur)
            setFlashOpacity(0)
        }, 20)
    }

    const glitch = async (text: string, times: number) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%&*'
        for (let i = 0; i < times; i++) {
            if (cancelledRef.current) return
            setCurrentText(
                Array.from(text)
                    .map(c => (c === '\n' ? '\n' : chars[Math.floor(Math.random() * chars.length)]))
                    .join('')
            )
            await wait(28)
        }
        setCurrentText(text)
    }

    const showFinal = () => {
        cancelledRef.current = true
        setIntroPhase('final')
    }

    // ─── Route guard ──────────────────────────────────────────
    useEffect(() => {
        if (pathname !== '/') { setShowIntro(false); return }
        const show = shouldShowIntro()
        setShowIntro(show)
        if (!show) {
            const unlocked = sessionStorage.getItem('tbfp-unlocked')
            setGatePhase(unlocked ? 'done' : 'locked')
            setIntroPhase('done')
        }
    }, [pathname])

    // ─── Flash-Sequenz ────────────────────────────────────────
    useEffect(() => {
        if (!showIntro || introPhase !== 'intro') return
        cancelledRef.current = false

        const run = async () => {
            await wait(300)

            for (let i = 0; i < sequence.length; i++) {
                if (cancelledRef.current) return
                const item = sequence[i]
                const isRed = redBgBeats.has(i)

                setBgRed(isRed)
                setTextSmall(!!item.small)
                setTextAccent(!!item.accent && !isRed)

                if (!item.accent && Math.random() > 0.55) await glitch(item.text, 2)
                if (cancelledRef.current) return

                setCurrentText(item.text)
                setTextSmall(!!item.small)
                setTextAccent(!!item.accent && !isRed)

                if (item.dur < 150) doFlash(0.5, 50)
                else if (item.dur < 300) doFlash(0.25, 80)

                await wait(item.dur)
                if (isRed) setBgRed(false)
            }

            const storm = ['TBFP', 'THE BEYONCÉ FAN PROJECT', 'TBFP', '████', 'TBFP']
            for (let i = 0; i < storm.length; i++) {
                if (cancelledRef.current) return
                setBgRed(i % 2 === 0)
                setCurrentText(storm[i])
                setTextSmall(false)
                setTextAccent(false)
                doFlash(0.4, 40)
                await wait(80)
            }
            setBgRed(false)

            doFlash(1, 200)
            await wait(60)
            setWordOpacity(0)
            await wait(200)

            if (!cancelledRef.current) setIntroPhase('final')
        }

        run()
    }, [showIntro, introPhase])

    // ─── Final → fadeOut → done ───────────────────────────────
    useEffect(() => {
        if (introPhase !== 'final') return
        const unlocked = sessionStorage.getItem('tbfp-unlocked')
        setGatePhase(unlocked ? 'done' : 'locked')

        const t = setTimeout(() => {
            setIntroPhase('fadeOut')
            setTimeout(() => {
                markIntroSeen()
                setIntroPhase('done')
            }, 500)
        }, 3000)
        return () => clearTimeout(t)
    }, [introPhase])

    // ─── Gate focus ───────────────────────────────────────────
    useEffect(() => {
        if (gatePhase === 'locked') setTimeout(() => inputRef.current?.focus(), 100)
    }, [gatePhase])

    // ─── Password ─────────────────────────────────────────────
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (password.trim().toLowerCase() === 'echoville') {
            sessionStorage.setItem('tbfp-unlocked', '1')
            setGatePhase('done')
        } else {
            setGatePhase('wrong')
            setPassword('')
            setTimeout(() => setGatePhase('locked'), 1000)
        }
    }

    // ─── Nichts rendern ───────────────────────────────────────
    if (!showIntro && (gatePhase === 'boot' || gatePhase === 'done')) return null
    if (introPhase === 'done' && (gatePhase === 'boot' || gatePhase === 'done')) return null

    return (
        <>
            {/* ── Flash-Sequenz ── */}
            {showIntro && introPhase === 'intro' && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    backgroundColor: bgRed ? '#D40B0B' : '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                    fontFamily: "'Roboto Mono', monospace", fontWeight: 700,
                }}>
                    <div style={{
                        fontSize: textSmall ? 'clamp(2rem, 7vw, 7rem)' : 'clamp(3rem, 14vw, 13rem)',
                        lineHeight: 0.92,
                        textAlign: 'center',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em',
                        color: textAccent ? '#D40B0B' : '#fff',
                        whiteSpace: 'pre-line',
                        padding: 'clamp(1rem, 4vw, 3rem)',
                        willChange: 'opacity',
                        opacity: wordOpacity,
                        transition: wordOpacity === 0 ? 'opacity 0.15s ease' : 'none',
                    }}>
                        {currentText}
                    </div>

                    <div style={{
                        position: 'fixed', inset: 0,
                        background: '#D40B0B',
                        opacity: flashOpacity,
                        pointerEvents: 'none', zIndex: 10,
                        transition: `opacity ${flashOpacity === 0 ? `${flashDur}ms` : '0ms'} ease`,
                    }} />

                    <div style={{
                        position: 'fixed', inset: 0,
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
                        pointerEvents: 'none', zIndex: 5, opacity: 0.4,
                    }} />

                    <button
                        onClick={showFinal}
                        style={{
                            position: 'fixed',
                            bottom: 'clamp(1rem, 3vw, 2rem)', right: 'clamp(1rem, 3vw, 2rem)',
                            zIndex: 20, background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.25)',
                            color: 'rgba(255,255,255,0.45)',
                            fontFamily: "'Roboto Mono', monospace", fontWeight: 700,
                            fontSize: 'clamp(0.6rem, 1.2vw, 0.85rem)',
                            letterSpacing: '0.2em', textTransform: 'uppercase',
                            padding: '0.45em 0.9em', cursor: 'pointer',
                            transition: 'border-color 0.2s, color 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#D40B0B'; e.currentTarget.style.color = '#D40B0B' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
                    >
                        SKIP ▶
                    </button>
                </div>
            )}

            {/* ── Final screen ── */}
            {showIntro && (introPhase === 'final' || introPhase === 'fadeOut') && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 9999,
                    backgroundColor: '#000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 'clamp(0.5rem, 2vw, 1.5rem)',
                    fontFamily: "'Roboto Mono', monospace", fontWeight: 700,
                    opacity: introPhase === 'fadeOut' ? 0 : 1,
                    transition: introPhase === 'fadeOut' ? 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
                    pointerEvents: introPhase === 'fadeOut' ? 'none' : 'auto',
                }}>
                    <div style={{
                        fontSize: 'clamp(1rem, 3vw, 3rem)',
                        letterSpacing: '0.35em', color: '#888', textTransform: 'uppercase',
                    }}>
                        THIS IS
                    </div>
                    <div style={{
                        fontSize: 'clamp(4rem, 18vw, 16rem)',
                        lineHeight: 0.88, letterSpacing: '-0.03em',
                        textTransform: 'uppercase', textAlign: 'center', color: '#fff',
                    }}>
                        TBFP
                        <span style={{
                            display: 'inline-block',
                            width: 'clamp(0.15em, 0.5vw, 0.25em)',
                            height: '0.9em',
                            background: '#D40B0B',
                            verticalAlign: 'middle',
                            marginLeft: '0.06em',
                            animation: 'blink 0.8s step-end infinite',
                        }} />
                    </div>
                    <span style={{
                        fontSize: 'clamp(4rem, 16vw, 14rem)',
                        color: '#D40B0B', lineHeight: 1,
                        animation: 'starPulse 2s ease-in-out infinite',
                    }}>
            ★
          </span>
                    <style>{`
            @keyframes starPulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.08); }
            }
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
          `}</style>
                </div>
            )}

            {/* ── Password Gate – vorgeladen ab 'final' ── */}
            {(introPhase === 'final' || introPhase === 'fadeOut' || introPhase === 'done') &&
                (gatePhase === 'locked' || gatePhase === 'wrong') && (
                    <div style={{
                        position: 'fixed', inset: 0,
                        zIndex: introPhase === 'done' ? 9999 : 9998,
                        opacity: introPhase === 'done' ? 1 : 0,
                        backgroundColor: '#000',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        padding: '40px',
                        transition: 'opacity 0.3s ease',
                        pointerEvents: introPhase === 'done' ? 'auto' : 'none',
                    }}>
                        <h1 style={{
                            fontSize: 'clamp(5rem, 18vw, 18rem)',
                            fontFamily: "'Roboto Mono', monospace",
                            fontWeight: 700, letterSpacing: '-0.05em', lineHeight: 0.85,
                            textAlign: 'center', marginBottom: '0.15em',
                            animation: gatePhase === 'wrong' ? 'shake 0.5s ease' : 'none',
                            color: gatePhase === 'wrong' ? '#D40B0B' : '#fff',
                        }}>
                            TBFP
                        </h1>
                        <p style={{
                            fontSize: 'clamp(0.55rem, 1.2vw, 0.85rem)',
                            fontFamily: "'Roboto Mono', monospace",
                            letterSpacing: '0.35em', color: '#555',
                            textTransform: 'uppercase',
                            marginBottom: 'clamp(48px, 8vh, 80px)',
                            textAlign: 'center',
                        }}>
                            THE BEYONCÉ FAN PROJECT
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '320px' }}
                        >
                            <input
                                ref={inputRef}
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="ENTER PASSWORD"
                                autoComplete="off"
                                style={{
                                    width: '100%', background: 'transparent',
                                    border: 'none',
                                    borderBottom: `1px solid ${gatePhase === 'wrong' ? '#D40B0B' : 'rgba(255,255,255,0.2)'}`,
                                    padding: '10px 0', textAlign: 'center',
                                    fontSize: '0.85rem',
                                    fontFamily: "'Roboto Mono', monospace",
                                    letterSpacing: '0.3em',
                                    color: '#fff', outline: 'none',
                                    transition: 'border-color 0.2s ease',
                                }}
                            />
                            {gatePhase === 'wrong' && (
                                <p style={{
                                    fontFamily: "'Roboto Mono', monospace",
                                    fontSize: '0.75rem', color: '#D40B0B',
                                    letterSpacing: '0.2em', textTransform: 'uppercase',
                                }}>
                                    ACCESS DENIED
                                </p>
                            )}
                            <button
                                type="submit"
                                style={{
                                    fontFamily: "'Roboto Mono', monospace",
                                    fontSize: '0.75rem', letterSpacing: '0.25em',
                                    color: 'rgba(255,255,255,0.4)', marginTop: '8px',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    transition: 'color 0.2s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
                            >
                                ENTER →
                            </button>
                        </form>

                        <style>{`
            @keyframes shake {
              0%,100% { transform: translateX(0); }
              20% { transform: translateX(-12px); }
              40% { transform: translateX(12px); }
              60% { transform: translateX(-8px); }
              80% { transform: translateX(8px); }
            }
          `}</style>
                    </div>
                )}
        </>
    )
}