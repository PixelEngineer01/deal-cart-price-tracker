'use client'

import { type PriceHistory } from '@/types'
import { getDailyChange } from '@/lib/insights'

interface TickerProduct {
  id: string
  title: string
  current_price: number | null
  price_history: PriceHistory[]
}

export default function PriceTicker({ products }: { products: TickerProduct[] }) {
  const tickerItems = products
    .map(p => {
      const change = getDailyChange(p.price_history)
      if (!change || !p.current_price) return null
      return {
        id: p.id,
        title: p.title.length > 30 ? p.title.slice(0, 30) + '…' : p.title,
        price: p.current_price,
        change,
      }
    })
    .filter(Boolean)

  if (tickerItems.length === 0) return null

  // Duplicate for seamless loop
  const allItems = [...tickerItems, ...tickerItems]

  return (
    <div className="ticker-container" style={{ marginBottom: 24, padding: '10px 0' }}>
      <div className="ticker-track">
        {allItems.map((item, i) => (
          <div
            key={`${item!.id}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 20px',
              whiteSpace: 'nowrap',
              fontSize: 13,
              borderRight: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <span style={{ color: '#94a3b8', fontWeight: 500 }}>{item!.title}</span>
            <span style={{ color: '#f1f5f9', fontWeight: 700 }}>
              ₹{item!.price.toLocaleString('en-IN')}
            </span>
            <span
              style={{
                color: item!.change.direction === 'down' ? '#22c55e' : item!.change.direction === 'up' ? '#ef4444' : '#64748b',
                fontWeight: 600,
                fontSize: 12,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
              }}
            >
              {item!.change.direction === 'down' ? '↓' : item!.change.direction === 'up' ? '↑' : '→'}
              {Math.abs(item!.change.pct).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
