'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import PriceTicker from '@/components/price-ticker'
import { calculateDealScore, getDailyChange,  } from '@/lib/insights'

import { type Product, type PriceHistory, type Alert } from '@/types'

type SortMode = 'recent' | 'price_drop' | 'deal_score' | 'in_budget' | 'price_low' | 'price_high'

function getPriceChange(current: number | null, history: PriceHistory[]) {
  if (!current || !history || history.length < 2) return null
  const sorted = [...history].sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime())
  const previous = sorted[sorted.length - 2]?.price
  if (!previous) return null
  const diff = current - previous
  const pct = ((diff) / previous) * 100
  return { diff, pct }
}

// ===== SPARKLINE MINI CHART =====
function Sparkline({ history, color = '#4f46e5' }: { history: PriceHistory[]; color?: string }) {
  const prices = history
    .slice(-12)
    .map(h => h.price)
    .filter(Boolean)

  if (prices.length < 2) return null

  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1

  return (
    <div className="sparkline-container" style={{ marginBottom: 8 }}>
      {prices.map((price, i) => {
        const height = ((price - min) / range) * 100
        const isLast = i === prices.length - 1
        const isDown = i > 0 && price < prices[i - 1]
        return (
          <div
            key={i}
            className="sparkline-bar"
            style={{
              height: `${Math.max(12, height)}%`,
              background: isLast
                ? 'linear-gradient(180deg, #4f46e5, #22d3ee)'
                : isDown
                  ? 'rgba(34,197,94,0.4)'
                  : `${color}40`,
            }}
          />
        )
      })}
    </div>
  )
}

// ===== DEAL SCORE BADGE =====
function DealScoreBadge({ product }: { product: Product }) {
  const alert = product.alerts?.[0]
  const score = calculateDealScore(
    product.price_history || [],
    product.current_price || 0,
    alert?.min_price,
    alert?.max_price
  )

  const cls = score.score >= 80 ? 'great' : score.score >= 60 ? 'good' : score.score >= 40 ? 'fair' : 'bad'

  return (
    <div className={`deal-score-badge ${cls}`} title={`Deal Score: ${score.score}/100`}>
      {score.score}
    </div>
  )
}

// ===== PRODUCT CARD =====
function ProductCard({ product, onDelete }: { product: Product, onDelete?: (id: string) => void }) {
  const change = getPriceChange(product.current_price, product.price_history)
  const alert = product.alerts?.[0]
  const isInBudget = alert && product.current_price
    ? product.current_price >= alert.min_price && product.current_price <= alert.max_price
    : false

  const dailyChange = getDailyChange(product.price_history)

  // Check for fake sale pattern (simplified check for badge)
  const prices = (product.price_history || []).map(h => h.price).filter(Boolean)
  const recent10 = prices.slice(-10)
  let hasFakeSale = false
  if (recent10.length >= 5) {
    const firstHalf = recent10.slice(0, Math.ceil(recent10.length / 2))
    const baseline = Math.min(...firstHalf)
    const peak = Math.max(...recent10)
    const current = recent10[recent10.length - 1]
    const hike = ((peak - baseline) / baseline) * 100
    const drop = ((peak - current) / peak) * 100
    if (hike >= 15 && drop >= 10 && current >= baseline * 0.95) hasFakeSale = true
  }

  const platformColor = product.platform === 'amazon' ? '#ff9900' : '#2874f0'
  const platformLabel = product.platform === 'amazon' ? 'Amazon' : 'Flipkart'

  return (
    <div
      className="product-card-3d"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: isInBudget
          ? '1px solid rgba(34,197,94,0.3)'
          : hasFakeSale
            ? '1px solid rgba(239,68,68,0.3)'
            : '1px solid rgba(255,255,255,0.07)',
        borderRadius: 20,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div style={{
        height: 170,
        background: '#1e2433',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: 12 }}
          />
        ) : (
          <div style={{ fontSize: 48, opacity: 0.5 }}>📦</div>
        )}

        {/* Platform badge */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: platformColor, color: '#fff',
          fontSize: 10, fontWeight: 700, padding: '3px 10px',
          borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>{platformLabel}</div>

        {/* Deal Score (top right) */}
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <DealScoreBadge product={product} />
        </div>

        {/* Status badges (bottom) */}
        <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 6 }}>
          {isInBudget && (
            <div style={{
              background: 'rgba(34,197,94,0.9)', color: '#fff',
              fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
            }}>✅ In Budget</div>
          )}
          {hasFakeSale && (
            <div className="fake-sale-badge">🚨 Fake Sale</div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          color: '#f1f5f9', fontSize: 13, fontWeight: 600, lineHeight: 1.4, marginBottom: 10,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>{product.title}</h3>

        {/* Sparkline */}
        <Sparkline history={product.price_history || []} />

        {/* Price row */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
          <span style={{ color: '#22c55e', fontSize: 22, fontWeight: 700 }}>
            {product.current_price ? `₹${product.current_price.toLocaleString('en-IN')}` : 'N/A'}
          </span>

          {change && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: change.pct < 0 ? '#22c55e' : '#ef4444',
              background: change.pct < 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              padding: '2px 8px', borderRadius: 20,
            }}>
              {change.pct < 0 ? '↓' : '↑'} {Math.abs(change.pct).toFixed(1)}%
            </span>
          )}

          {dailyChange && dailyChange.direction !== 'stable' && !change && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: dailyChange.direction === 'down' ? '#22c55e' : '#ef4444',
            }}>
              {dailyChange.emoji} {Math.abs(dailyChange.pct).toFixed(1)}%
            </span>
          )}
        </div>

        {/* Alert badge */}
        {alert && (
          <div style={{
            background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)',
            borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#a5b4fc', marginBottom: 12,
          }}>
            🎯 ₹{alert.min_price.toLocaleString('en-IN')} – ₹{alert.max_price.toLocaleString('en-IN')}
          </div>
        )}

        <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
          <Link href={`/dashboard/product/${product.id}`} className="attach-button" title="View Details">
            <svg
              className="attach-icon"
              xmlns="http://www.w3.org/2000/svg"
              width="22px"
              height="22px"
              viewBox="0 -0.5 25 25"
              fill="none"
            >
              <path
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="1.5"
                d="M15.17 11.053L11.18 15.315C10.8416 15.6932 10.3599 15.9119 9.85236 15.9178C9.34487 15.9237 8.85821 15.7162 8.51104 15.346C7.74412 14.5454 7.757 13.2788 8.54004 12.494L13.899 6.763C14.4902 6.10491 15.3315 5.72677 16.2161 5.72163C17.1006 5.71649 17.9463 6.08482 18.545 6.736C19.8222 8.14736 19.8131 10.2995 18.524 11.7L12.842 17.771C12.0334 18.5827 10.9265 19.0261 9.78113 18.9971C8.63575 18.9682 7.55268 18.4695 6.78604 17.618C5.0337 15.6414 5.07705 12.6549 6.88604 10.73L12.253 5"
              />
            </svg>
            <span className="attach-label">Details</span>
          </Link>
          {onDelete && (
             <button onClick={() => onDelete(product.id)} className="bin-button" title="Delete Product">
                <svg
                  className="bin-top"
                  viewBox="0 0 39 7"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <line y1="5" x2="39" y2="5" stroke="#ef4444" strokeWidth="4"></line>
                  <line
                    x1="12"
                    y1="1.5"
                    x2="26.0357"
                    y2="1.5"
                    stroke="#ef4444"
                    strokeWidth="3"
                  ></line>
                </svg>
                <svg
                  className="bin-bottom"
                  viewBox="0 0 33 39"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask id="path-1-inside-1_8_19" fill="white">
                    <path d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"></path>
                  </mask>
                  <path
                    d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
                    fill="#ef4444"
                    mask="url(#path-1-inside-1_8_19)"
                  ></path>
                  <path d="M12 6L12 29" stroke="#ef4444" strokeWidth="4"></path>
                  <path d="M21 6V29" stroke="#ef4444" strokeWidth="4"></path>
                </svg>
             </button>
          )}
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 20, overflow: 'hidden',
    }}>
      <div className="skeleton" style={{ height: 170 }} />
      <div style={{ padding: '14px 18px' }}>
        <div className="skeleton" style={{ height: 16, marginBottom: 8, borderRadius: 4 }} />
        <div className="skeleton" style={{ height: 16, width: '60%', marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 32, width: '50%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 36 }} />
      </div>
    </div>
  )
}

// ===== WEEKLY SUMMARY PANEL =====
function WeeklySummary({ products }: { products: Product[] }) {
  const priceDrops = products.filter(p => {
    const change = getPriceChange(p.current_price, p.price_history)
    return change && change.pct < -1
  }).length

  const priceRises = products.filter(p => {
    const change = getPriceChange(p.current_price, p.price_history)
    return change && change.pct > 1
  }).length

  const totalSavings = products.reduce((sum, p) => {
    if (!p.current_price || !p.price_history?.length) return sum
    const prices = p.price_history.map(h => h.price).filter(Boolean)
    const peak = prices.length ? Math.max(...prices) : p.current_price
    return sum + Math.max(0, peak - p.current_price)
  }, 0)

  const fakeSales = products.filter(p => {
    const prices = (p.price_history || []).map(h => h.price).filter(Boolean).slice(-10)
    if (prices.length < 5) return false
    const firstHalf = prices.slice(0, Math.ceil(prices.length / 2))
    const baseline = Math.min(...firstHalf)
    const peak = Math.max(...prices)
    const current = prices[prices.length - 1]
    const hike = ((peak - baseline) / baseline) * 100
    const drop = ((peak - current) / peak) * 100
    return hike >= 15 && drop >= 10 && current >= baseline * 0.95
  }).length

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(79,70,229,0.08), rgba(34,211,238,0.05))',
      border: '1px solid rgba(79,70,229,0.15)',
      borderRadius: 16, padding: '18px 24px', marginBottom: 24,
      display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'center',
    }}>
      <div style={{ fontSize: 13, color: '#a5b4fc', fontWeight: 600 }}>📋 Summary</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, flex: 1 }}>
        {[
          { label: 'Price Drops', value: priceDrops, icon: '📉', color: '#22c55e' },
          { label: 'Price Rises', value: priceRises, icon: '📈', color: '#ef4444' },
          { label: 'Fake Sales', value: fakeSales, icon: '🚨', color: '#ef4444' },
          { label: 'Potential Savings', value: `₹${totalSavings.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: '💰', color: '#22c55e' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ color: item.color, fontWeight: 700, fontSize: 15 }}>
              {item.value}
            </span>
            <span style={{ color: '#64748b', fontSize: 12 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== MAIN DASHBOARD =====
export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('recent')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const res = await fetch('/api/products')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setProducts(data.products || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = useMemo(() => {
    let list = [...products]

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.platform.toLowerCase().includes(q)
      )
    }

    // Sort
    switch (sortMode) {
      case 'price_drop': {
        list.sort((a, b) => {
          const changeA = getPriceChange(a.current_price, a.price_history)
          const changeB = getPriceChange(b.current_price, b.price_history)
          return (changeA?.pct ?? 0) - (changeB?.pct ?? 0)
        })
        break
      }
      case 'deal_score': {
        list.sort((a, b) => {
          const scoreA = calculateDealScore(a.price_history, a.current_price || 0, a.alerts?.[0]?.min_price, a.alerts?.[0]?.max_price)
          const scoreB = calculateDealScore(b.price_history, b.current_price || 0, b.alerts?.[0]?.min_price, b.alerts?.[0]?.max_price)
          return scoreB.score - scoreA.score
        })
        break
      }
      case 'in_budget': {
        list.sort((a, b) => {
          const aInBudget = a.alerts?.[0] && a.current_price
            ? (a.current_price >= a.alerts[0].min_price && a.current_price <= a.alerts[0].max_price ? 1 : 0)
            : 0
          const bInBudget = b.alerts?.[0] && b.current_price
            ? (b.current_price >= b.alerts[0].min_price && b.current_price <= b.alerts[0].max_price ? 1 : 0)
            : 0
          return bInBudget - aInBudget
        })
        break
      }
      case 'price_low':
        list.sort((a, b) => (a.current_price || Infinity) - (b.current_price || Infinity))
        break
      case 'price_high':
        list.sort((a, b) => (b.current_price || 0) - (a.current_price || 0))
        break
      case 'recent':
      default:
        list.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    }

    return list
  }, [products, search, sortMode])

  async function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this product? All tracking and alerts will be removed.')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Error deleting product');
    }
  }

  const inBudgetCount = products.filter(p => {
    const alert = p.alerts?.[0]
    return alert && p.current_price && p.current_price >= alert.min_price && p.current_price <= alert.max_price
  }).length

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            My DealCart 🛒
          </h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>
            {products.length} product{products.length !== 1 ? 's' : ''} tracked
            {inBudgetCount > 0 && <span style={{ color: '#22c55e', marginLeft: 8 }}>· {inBudgetCount} in your budget!</span>}
          </p>
        </div>
        <Link href="/dashboard/add" style={{ textDecoration: 'none' }}>
          <button className="steveblox-add-btn" style={{ transform: 'scale(0.85)' }}>
            + Add Product
          </button>
        </Link>
      </div>

      {/* Price Ticker */}
      {!loading && products.length > 0 && <PriceTicker products={products} />}

      {/* Weekly Summary */}
      {!loading && products.length > 0 && <WeeklySummary products={products} />}

      {/* Search + Sort + Stats */}
      {!loading && products.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {/* Search + Sort bar */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#374151' }}>🔍</span>
              <input
                className="search-input"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="sort-select"
              value={sortMode}
              onChange={e => setSortMode(e.target.value as SortMode)}
            >
              <option value="recent">⏰ Recent</option>
              <option value="price_drop">📉 Price Drop</option>
              <option value="deal_score">🎯 Deal Score</option>
              <option value="in_budget">✅ In Budget</option>
              <option value="price_low">💰 Price: Low</option>
              <option value="price_high">💸 Price: High</option>
            </select>
          </div>

          {/* Mini stat cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 12,
          }}>
            {[
              { label: 'Products', value: products.length, icon: '📦', color: '#4f46e5' },
              { label: 'With Alerts', value: products.filter(p => p.alerts?.length > 0).length, icon: '🔔', color: '#f59e0b' },
              { label: 'In Budget', value: inBudgetCount, icon: '✅', color: '#22c55e' },
              { label: 'In Stock', value: products.filter(p => p.availability === 'In Stock').length, icon: '🟢', color: '#22d3ee' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12, padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>{stat.icon}</span>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 12, padding: '16px 20px', color: '#ef4444', marginBottom: 24,
        }}>⚠️ {error}</div>
      )}

      {/* Product Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 24px',
          background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)',
          borderRadius: 20,
        }}>
          {products.length === 0 ? (
            <>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 22, marginBottom: 12 }}>
                Your cart is empty
              </h2>
              <p style={{ color: '#64748b', fontSize: 15, marginBottom: 28 }}>
                Add your first product to start tracking prices and get deal alerts.
              </p>
              <Link href="/dashboard/add" style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
                color: '#fff', textDecoration: 'none', padding: '14px 36px',
                borderRadius: 10, fontSize: 15, fontWeight: 600,
              }}>
                ➕ Add Your First Product
              </Link>
            </>
          ) : (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <h3 style={{ color: '#f1f5f9', fontSize: 16, marginBottom: 8 }}>No matching products</h3>
              <p style={{ color: '#64748b', fontSize: 14 }}>Try a different search term or sort filter.</p>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
