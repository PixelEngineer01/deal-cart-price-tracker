'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/navbar'

const features = [
  {
    icon: '🔗',
    title: 'Add Any Product',
    desc: 'Paste an Amazon or Flipkart product URL. We\'ll scrape all the details automatically.',
    color: '#4f46e5',
  },
  {
    icon: '📊',
    title: 'Price History Charts',
    desc: 'See price trends over time with beautiful interactive charts. Know when to buy.',
    color: '#22d3ee',
  },
  {
    icon: '🔔',
    title: 'Budget Alerts',
    desc: 'Set a budget range. Get an email the moment the price drops into your range.',
    color: '#22c55e',
  },
  {
    icon: '🧠',
    title: 'Smart Insights',
    desc: 'AI-powered insights that detect fake sales, price trends, and best buy timing.',
    color: '#f59e0b',
  },
  {
    icon: '🚨',
    title: 'Fake Sale Detector',
    desc: 'Our V-curve algorithm spots pre-sale price hikes so you never fall for fake discounts.',
    color: '#ef4444',
  },
  {
    icon: '📤',
    title: 'Share Deals',
    desc: 'Found a great deal? Share it instantly with friends via Twitter or WhatsApp.',
    color: '#a855f7',
  },
]

const stats = [
  { value: '2', label: 'Platforms', suffix: '+' },
  { value: '100', label: 'Products Trackable', suffix: '+' },
  { value: '6', label: 'Hour Price Checks', suffix: 'hr' },
  { value: '0', label: 'Cost to Use', prefix: '₹' },
]

const howItWorks = [
  {
    step: '01',
    title: 'Paste a Link',
    desc: 'Copy any Amazon or Flipkart product URL and paste it into DealCart.',
    icon: '🔗',
    color: '#4f46e5',
  },
  {
    step: '02',
    title: 'Set Your Budget',
    desc: 'Tell us your ideal price range. We\'ll watch it for you 24/7.',
    icon: '💰',
    color: '#22d3ee',
  },
  {
    step: '03',
    title: 'Get Alerted',
    desc: 'Receive an instant email when the price drops into your budget.',
    icon: '📧',
    color: '#22c55e',
  },
  {
    step: '04',
    title: 'Buy Smarter',
    desc: 'Check insights, avoid fake sales, and buy at the perfect moment.',
    icon: '🎯',
    color: '#f59e0b',
  },
]

function AnimatedNumber({ target }: { target: string }) {
  const [display, setDisplay] = useState('0')
  useEffect(() => {
    const num = parseInt(target)
    if (isNaN(num)) { setDisplay(target); return }
    let current = 0
    const step = Math.ceil(num / 30)
    const interval = setInterval(() => {
      current = Math.min(current + step, num)
      setDisplay(String(current))
      if (current >= num) clearInterval(interval)
    }, 40)
    return () => clearInterval(interval)
  }, [target])
  return <>{display}</>
}

// Floating product card visual
function HeroVisual() {
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      maxWidth: 420,
      margin: '0 auto',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        inset: -40,
        background: 'radial-gradient(ellipse, rgba(79,70,229,0.3) 0%, rgba(34,211,238,0.15) 50%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(20px)',
        animation: 'pulse-glow 3s ease-in-out infinite',
      }} />

      {/* Main card - floating */}
      <div className="animate-float" style={{
        background: 'rgba(30,36,51,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24,
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, background: '#ff9900',
            borderRadius: 10, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 22,
          }}>📦</div>
          <div>
            <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>Gaming Laptop</div>
            <div style={{ color: '#64748b', fontSize: 12 }}>Amazon.in</div>
          </div>
          <div style={{
            marginLeft: 'auto',
            background: 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.3)',
            color: '#22c55e', padding: '4px 10px',
            borderRadius: 20, fontSize: 12, fontWeight: 600,
          }}>↓ 12%</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
          <div>
            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>CURRENT PRICE</div>
            <div style={{ color: '#22c55e', fontSize: 28, fontWeight: 700 }}>₹72,499</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>DEAL SCORE</div>
            <div className="deal-score-badge great" style={{ padding: '4px 14px', fontSize: 13 }}>87</div>
          </div>
        </div>

        {/* Mini chart bars */}
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40, marginBottom: 12 }}>
          {[60, 80, 70, 90, 75, 65, 72].map((h, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${h}%`,
              borderRadius: 3,
              background: i === 6
                ? 'linear-gradient(180deg, #4f46e5, #22d3ee)'
                : 'rgba(79,70,229,0.3)',
              transition: 'height 0.3s',
            }} />
          ))}
        </div>

        <div style={{
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 10, padding: '8px 12px',
          color: '#22c55e', fontSize: 12,
        }}>
          ✅ Price is within your budget! Good time to buy.
        </div>
      </div>

      {/* Floating badge - top right */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
        borderRadius: 12,
        padding: '10px 16px',
        fontSize: 12,
        fontWeight: 600,
        color: '#fff',
        zIndex: 3,
        animation: 'float 3s ease-in-out infinite 1s',
        boxShadow: '0 8px 32px rgba(79,70,229,0.4)',
      }}>
        🔔 Alert Sent!
      </div>

      {/* Floating badge - bottom left */}
      <div style={{
        position: 'absolute',
        bottom: -16,
        left: -16,
        background: 'rgba(30,36,51,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '10px 16px',
        fontSize: 12,
        fontWeight: 500,
        color: '#f1f5f9',
        zIndex: 3,
        animation: 'float 3.5s ease-in-out infinite 0.5s',
      }}>
        📉 Price dropped ₹9,000 today
      </div>
    </div>
  )
}

// ===== FAKE SALE SHOWCASE =====
function FakeSaleShowcase() {
  const [animStep, setAnimStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimStep(prev => (prev + 1) % 4)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const barData = [
    { label: 'Original', price: 45000, color: '#64748b' },
    { label: 'Hiked Price', price: 59000, color: '#ef4444' },
    { label: '"Sale" Price', price: 47000, color: '#f59e0b' },
    { label: 'Real Discount', price: 2000, color: '#22c55e' },
  ]

  return (
    <section style={{
      padding: '80px 24px',
      background: 'linear-gradient(180deg, transparent, rgba(239,68,68,0.03), transparent)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: 20, padding: '6px 16px', fontSize: 12, color: '#ef4444',
            fontWeight: 600, marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            🚨 New Feature
          </div>
          <h2 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(28px, 4vw, 44px)',
            fontWeight: 800, color: '#f1f5f9', marginBottom: 16,
          }}>
            Fake Sale<br />
            <span style={{
              background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Detector
            </span>
          </h2>
          <p style={{ color: '#64748b', fontSize: 17, maxWidth: 550, margin: '0 auto', lineHeight: 1.7 }}>
            E-commerce sites often hike prices before sales, then &quot;discount&quot; them back to normal.
            Our V-curve algorithm catches these patterns automatically.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 32, alignItems: 'center',
        }}>
          {/* Left: Visual */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, padding: 32,
          }}>
            <div style={{ marginBottom: 20, fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>
              📊 How a Fake Sale Looks
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 160, marginBottom: 16 }}>
              {barData.map((bar, i) => (
                <div key={bar.label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: `${(bar.price / 59000) * 140}px`,
                    background: i <= animStep ? bar.color : 'rgba(255,255,255,0.05)',
                    borderRadius: '8px 8px 0 0',
                    transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative',
                  }}>
                    {i <= animStep && (
                      <div style={{
                        position: 'absolute', top: -24, left: '50%', transform: 'translateX(-50%)',
                        color: bar.color, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                      }}>
                        ₹{(bar.price / 1000).toFixed(0)}K
                      </div>
                    )}
                  </div>
                  <div style={{ color: '#64748b', fontSize: 10, marginTop: 8, lineHeight: 1.2 }}>
                    {bar.label}
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#ef4444',
              textAlign: 'center',
            }}>
              🚨 Real discount: only ₹2,000 (4.4%) — not the &quot;20% off&quot; they claim!
            </div>
          </div>

          {/* Right: Explanation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              {
                icon: '📈',
                title: 'Price Hike Detected',
                desc: 'We spot when a product\'s price is quietly raised 15%+ before a sale event.',
                color: '#ef4444',
              },
              {
                icon: '🏷️',
                title: '"Discount" Applied',
                desc: 'The sale drops the price back to near-original, but claims a huge discount.',
                color: '#f59e0b',
              },
              {
                icon: '🛡️',
                title: 'DealCart Warns You',
                desc: 'Our algorithm compares against the real baseline price so you see the truth.',
                color: '#22c55e',
              },
            ].map(item => (
              <div key={item.title} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '20px 24px',
                display: 'flex', gap: 16, alignItems: 'flex-start',
                transition: 'all 0.3s',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: item.color + '15', border: `1px solid ${item.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>{item.icon}</div>
                <div>
                  <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LandingPage() {
  const [visible, setVisible] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Trigger fade-in
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div style={{ background: '#0b0f19', minHeight: '100vh', overflowX: 'hidden' }}>
      <Navbar />

      {/* ===== HERO ===== */}
      <section ref={heroRef} style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        {/* Background mesh gradient */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,70,229,0.2) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 200,
          background: 'linear-gradient(to bottom, transparent, #0b0f19)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '100px 24px 60px', width: '100%' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 60,
            alignItems: 'center',
          }}>
            {/* Left — Text */}
            <div style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(79,70,229,0.15)',
                border: '1px solid rgba(79,70,229,0.3)',
                borderRadius: 20,
                padding: '6px 16px',
                fontSize: 13,
                color: '#a5b4fc',
                fontWeight: 500,
                marginBottom: 24,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-glow 2s ease-in-out infinite' }} />
                Free to use • No credit card needed
              </div>

              <h1 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: 'clamp(36px, 5vw, 64px)',
                fontWeight: 800,
                lineHeight: 1.1,
                color: '#f1f5f9',
                marginBottom: 20,
              }}>
                Track Prices.<br />
                <span style={{
                  background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>Buy Smarter.</span>
              </h1>

              <p style={{
                color: '#94a3b8',
                fontSize: 18,
                lineHeight: 1.7,
                marginBottom: 40,
                maxWidth: 480,
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              }}>
                Add Amazon & Flipkart product links. We track prices 24/7, detect fake sales, and email you the moment a deal matches your budget.
              </p>

              <div style={{
                display: 'flex',
                gap: 16,
                flexWrap: 'wrap',
                opacity: visible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
              }}>
                <Link href="/signup" style={{
                  background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
                  color: '#fff',
                  textDecoration: 'none',
                  padding: '16px 36px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  boxShadow: '0 8px 32px rgba(79,70,229,0.35)',
                  transition: 'all 0.2s',
                  display: 'inline-block',
                }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.target as HTMLElement).style.boxShadow = '0 12px 40px rgba(79,70,229,0.5)'
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.transform = 'translateY(0)';
                    (e.target as HTMLElement).style.boxShadow = '0 8px 32px rgba(79,70,229,0.35)'
                  }}
                >
                  🚀 Start Tracking Free
                </Link>
                <Link href="/login" style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#f1f5f9',
                  textDecoration: 'none',
                  padding: '16px 36px',
                  borderRadius: 12,
                  fontSize: 16,
                  fontWeight: 600,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}>
                  Sign In →
                </Link>
              </div>

              {/* Trust badges */}
              <div style={{
                display: 'flex', gap: 20, marginTop: 36, flexWrap: 'wrap',
                opacity: visible ? 1 : 0,
                transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s',
              }}>
                {['✅ Amazon.in', '✅ Flipkart', '🛡️ Fake Sale Alert', '📧 Email Alerts'].map(badge => (
                  <span key={badge} style={{ color: '#4b5563', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — Hero Visual */}
            <div style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
            }}>
              <HeroVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32, textAlign: 'center' }}>
          {stats.map(stat => (
            <div key={stat.label}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 42, fontWeight: 800, background: 'linear-gradient(135deg, #4f46e5, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {stat.prefix}<AnimatedNumber target={stat.value} />{stat.suffix}
              </div>
              <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section style={{ padding: '80px 24px', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#f1f5f9', marginBottom: 16 }}>
              How it{' '}
              <span style={{ background: 'linear-gradient(135deg, #4f46e5, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Works
              </span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>
              Start saving money in 4 simple steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {howItWorks.map((step, i) => (
              <div key={step.step} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 20, padding: '32px 24px', textAlign: 'center',
                position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.borderColor = step.color + '40'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                }}
              >
                <div style={{
                  position: 'absolute', top: -10, right: -10,
                  fontSize: 64, fontWeight: 900, color: step.color + '08',
                  fontFamily: 'Outfit, sans-serif',
                }}>{step.step}</div>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: step.color + '15', border: `1px solid ${step.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, margin: '0 auto 16px',
                }}>{step.icon}</div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6 }}>{step.desc}</p>
                {i < howItWorks.length - 1 && (
                  <div style={{
                    position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)',
                    color: '#243048', fontSize: 20, display: 'none',
                  }}>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section style={{ padding: '80px 24px', position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#f1f5f9', marginBottom: 16 }}>
              Everything you need to<br />
              <span style={{ background: 'linear-gradient(135deg, #4f46e5, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                never overpay again
              </span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
              DealCart monitors prices around the clock so you don&apos;t have to keep refreshing product pages.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div
                key={f.title}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 20,
                  padding: 32,
                  transition: 'all 0.3s ease',
                  animationDelay: `${i * 0.1}s`,
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget
                  el.style.background = 'rgba(255,255,255,0.06)'
                  el.style.transform = 'translateY(-4px)'
                  el.style.borderColor = f.color + '50'
                  el.style.boxShadow = `0 20px 40px ${f.color}20`
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget
                  el.style.background = 'rgba(255,255,255,0.03)'
                  el.style.transform = 'translateY(0)'
                  el.style.borderColor = 'rgba(255,255,255,0.07)'
                  el.style.boxShadow = 'none'
                }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: f.color + '20',
                  border: `1px solid ${f.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  marginBottom: 20,
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
                  {f.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAKE SALE SHOWCASE ===== */}
      <FakeSaleShowcase />

      {/* ===== CTA ===== */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(34,211,238,0.1))',
            border: '1px solid rgba(79,70,229,0.2)',
            borderRadius: 28,
            padding: '60px 40px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute',
              top: -60,
              right: -60,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle, rgba(34,211,238,0.15), transparent)',
              borderRadius: '50%',
            }} />
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, color: '#f1f5f9', marginBottom: 16 }}>
              Start saving money today
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 16, lineHeight: 1.7, marginBottom: 36 }}>
              Join DealCart for free. Add your first product in under 30 seconds and let us do the price watching for you.
            </p>
            <Link href="/signup" style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
              color: '#fff',
              textDecoration: 'none',
              padding: '16px 48px',
              borderRadius: 12,
              fontSize: 17,
              fontWeight: 700,
              boxShadow: '0 8px 32px rgba(79,70,229,0.4)',
              transition: 'all 0.2s',
            }}>
              🛒 Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '48px 24px 32px',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 32, marginBottom: 32,
          }}>
            {/* Brand */}
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
                <span style={{ background: 'linear-gradient(135deg, #4f46e5, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  🛒 DealCart
                </span>
              </div>
              <p style={{ color: '#4b5563', fontSize: 13, lineHeight: 1.6 }}>
                Track prices, detect fake sales, and buy at the perfect moment. Built with Next.js + Supabase.
              </p>
            </div>

            {/* Links */}
            <div>
              <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Product</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Add Product', href: '/dashboard/add' },
                  { label: 'Sign Up', href: '/signup' },
                ].map(link => (
                  <Link key={link.label} href={link.href} style={{ color: '#4b5563', fontSize: 13, textDecoration: 'none' }}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Features</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {['Price Tracking', 'Budget Alerts', 'Fake Sale Detection', 'Deal Scoring', 'Share Deals'].map(f => (
                  <span key={f} style={{ color: '#4b5563', fontSize: 13 }}>{f}</span>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Supported</div>
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <div style={{
                  background: '#ff990020', border: '1px solid #ff990040', borderRadius: 10,
                  padding: '8px 14px', fontSize: 12, color: '#ff9900', fontWeight: 600,
                }}>Amazon.in</div>
                <div style={{
                  background: '#2874f020', border: '1px solid #2874f040', borderRadius: 10,
                  padding: '8px 14px', fontSize: 12, color: '#2874f0', fontWeight: 600,
                }}>Flipkart</div>
              </div>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: 20, textAlign: 'center', color: '#374151', fontSize: 12,
          }}>
            <p>© {new Date().getFullYear()} DealCart · Track smarter. Buy better.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
