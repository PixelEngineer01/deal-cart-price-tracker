'use client'

import { useState } from 'react'
import { type PriceHistory } from '@/types'
import { calculateSavings } from '@/lib/insights'

interface ShareCardProps {
  title: string
  platform: string
  currentPrice: number
  imageUrl?: string
  url: string
  priceHistory: PriceHistory[]
}

export default function ShareCard({ title, platform, currentPrice, imageUrl, url, priceHistory }: ShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [showCard, setShowCard] = useState(false)

  const savings = calculateSavings(priceHistory, currentPrice)
  const prices = priceHistory.map(h => h.price).filter(Boolean)
  const allTimeHigh = prices.length ? Math.max(...prices) : currentPrice

  const shareText = `🛒 Found a deal on ${platform}!\n${title}\n💰 Now: ₹${currentPrice.toLocaleString('en-IN')}${savings.vsHighPct > 5 ? ` (${savings.vsHighPct.toFixed(0)}% off peak)` : ''}\n\nTracked with DealCart`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${url}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = `${shareText}\n${url}`
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`

  return (
    <div>
      <button
        onClick={() => setShowCard(!showCard)}
        style={{
          background: 'rgba(79,70,229,0.15)',
          border: '1px solid rgba(79,70,229,0.3)',
          color: '#a5b4fc',
          padding: '10px 20px',
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          width: '100%',
          justifyContent: 'center',
        }}
      >
        📤 {showCard ? 'Hide' : 'Share This Deal'}
      </button>

      {showCard && (
        <div style={{ marginTop: 16 }}>
          {/* Preview Card */}
          <div className="share-card" style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {imageUrl && (
                <div style={{
                  width: 60, height: 60, borderRadius: 10, overflow: 'hidden',
                  background: '#1e2433', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <img src={imageUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: platform === 'amazon' ? '#ff9900' : '#2874f0',
                  textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
                }}>{platform}</div>
                <div style={{
                  color: '#f1f5f9', fontSize: 13, fontWeight: 600, lineHeight: 1.3,
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{title}</div>
              </div>
            </div>

            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div>
                <div style={{ color: '#22c55e', fontSize: 22, fontWeight: 700 }}>
                  ₹{currentPrice.toLocaleString('en-IN')}
                </div>
                {savings.vsHighPct > 5 && (
                  <div style={{ color: '#64748b', fontSize: 11, marginTop: 2 }}>
                    <span style={{ textDecoration: 'line-through' }}>₹{allTimeHigh.toLocaleString('en-IN')}</span>
                    <span style={{ color: '#22c55e', marginLeft: 6 }}>−{savings.vsHighPct.toFixed(0)}%</span>
                  </div>
                )}
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
              }}>
                🛒 DealCart
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleCopyLink}
              style={{
                flex: 1,
                background: copied ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.08)'}`,
                color: copied ? '#22c55e' : '#f1f5f9',
                padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
            <a
              href={twitterUrl} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, background: 'rgba(29,161,242,0.1)', border: '1px solid rgba(29,161,242,0.3)',
                color: '#1da1f2', padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                textDecoration: 'none', textAlign: 'center', display: 'block',
              }}
            >
              𝕏 Tweet
            </a>
            <a
              href={whatsappUrl} target="_blank" rel="noopener noreferrer"
              style={{
                flex: 1, background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)',
                color: '#25d366', padding: '9px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                textDecoration: 'none', textAlign: 'center', display: 'block',
              }}
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
