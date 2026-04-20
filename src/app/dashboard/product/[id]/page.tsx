'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot
} from 'recharts'
import { generateInsights, calculateDealScore, calculateSavings } from '@/lib/insights'
import ShareCard from '@/components/share-card'

import { type Product, type PriceHistory, type Alert } from '@/types'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(30,36,51,0.95)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', fontSize: 13,
      }}>
        <p style={{ color: '#64748b', marginBottom: 4, fontSize: 11 }}>{label}</p>
        <p style={{ color: '#22c55e', fontWeight: 700, fontSize: 16 }}>₹{payload[0].value.toLocaleString('en-IN')}</p>
      </div>
    )
  }
  return null
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [alertForm, setAlertForm] = useState({ min: '', max: '' })
  const [alertSaving, setAlertSaving] = useState(false)
  const [alertSaved, setAlertSaved] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch('/api/products')
        const data = await res.json()
        const found = data.products?.find((p: Product) => p.id === id)
        if (!found) throw new Error('Product not found')
        setProduct(found)
        if (found.alerts?.[0]) {
          setAlertForm({ min: String(found.alerts[0].min_price), max: String(found.alerts[0].max_price) })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    setAlertSaving(true)
    try {
      const res = await fetch('/api/set-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          min_price: parseFloat(alertForm.min),
          max_price: parseFloat(alertForm.max),
        }),
      })
      if (!res.ok) throw new Error('Failed to save alert')
      setAlertSaved(true)
      setTimeout(() => setAlertSaved(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setAlertSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div className="skeleton" style={{ height: 40, width: 200, marginBottom: 32 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          <div className="skeleton" style={{ height: 300, borderRadius: 20 }} />
          <div>
            <div className="skeleton" style={{ height: 28, marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 28, width: '70%', marginBottom: 24 }} />
            <div className="skeleton" style={{ height: 200, borderRadius: 20 }} />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <p style={{ color: '#ef4444', fontSize: 16, marginBottom: 16 }}>⚠️ {error || 'Product not found'}</p>
        <Link href="/dashboard" style={{ color: '#4f46e5', textDecoration: 'none' }}>← Back to Dashboard</Link>
      </div>
    )
  }

  // Build chart data
  const sortedHistory = [...(product.price_history || [])]
    .sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime())

  const chartData = sortedHistory.map(h => ({ date: formatDate(h.checked_at), price: h.price, fullDate: h.checked_at }))

  const prices = (product.price_history || []).map(h => h.price)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0
  const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0

  // Find peak and drop annotation points
  const peakIdx = chartData.findIndex(d => d.price === maxPrice)
  const dropIdx = chartData.findIndex(d => d.price === minPrice)

  const alert = product.alerts?.[0]
  const insights = generateInsights(
    product.price_history || [],
    product.current_price || 0,
    alert?.min_price,
    alert?.max_price
  )
  const dealScore = calculateDealScore(
    product.price_history || [],
    product.current_price || 0,
    alert?.min_price,
    alert?.max_price
  )
  const savings = calculateSavings(product.price_history || [], product.current_price || 0)

  const platformColor = product.platform === 'amazon' ? '#ff9900' : '#2874f0'
  const dealCls = dealScore.score >= 80 ? 'great' : dealScore.score >= 60 ? 'good' : dealScore.score >= 40 ? 'fair' : 'bad'

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Breadcrumb */}
      <Link href="/dashboard" style={{ color: '#64748b', textDecoration: 'none', fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        ← Back to Dashboard
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Product image + info */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, overflow: 'hidden',
          }}>
            <div style={{ height: 240, background: '#1e2433', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              {product.image_url ? (
                <img src={product.image_url} alt={product.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', padding: 16 }} />
              ) : <span style={{ fontSize: 48 }}>📦</span>}
              <div style={{
                position: 'absolute', top: 12, left: 12,
                background: platformColor, color: '#fff',
                fontSize: 10, fontWeight: 700, padding: '3px 10px',
                borderRadius: 20, textTransform: 'uppercase',
              }}>{product.platform}</div>
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <div className={`deal-score-badge ${dealCls}`} style={{ padding: '4px 12px', fontSize: 12 }}>
                  {dealScore.score} · {dealScore.label}
                </div>
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 16, fontWeight: 700, lineHeight: 1.4, marginBottom: 16 }}>
                {product.title}
              </h1>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e', marginBottom: 12 }}>
                {product.current_price ? `₹${product.current_price.toLocaleString('en-IN')}` : 'N/A'}
              </div>
              {product.rating && product.rating !== 'No rating' && (
                <p style={{ color: '#f59e0b', fontSize: 13, marginBottom: 6 }}>⭐ {product.rating}</p>
              )}
              <p style={{
                fontSize: 12,
                color: product.availability === 'In Stock' ? '#22c55e' : '#ef4444',
              }}>● {product.availability}</p>
              <a
                href={product.url} target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'block', marginTop: 16,
                  background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
                  color: '#fff', textDecoration: 'none', padding: '10px',
                  borderRadius: 8, fontSize: 13, fontWeight: 600, textAlign: 'center',
                }}
              >🛍️ Buy Now ↗</a>
            </div>
          </div>

          {/* Savings Calculator */}
          {prices.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: 20,
            }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                💰 Savings Calculator
              </h3>
              {[
                { label: 'vs Peak Price', value: savings.vsHigh, pct: savings.vsHighPct, color: '#22c55e' },
                { label: 'vs Average', value: savings.vsAvg, pct: savings.vsAvgPct, color: savings.vsAvg > 0 ? '#22c55e' : '#ef4444' },
                { label: 'vs Recent Peak', value: savings.vsPeak, pct: savings.vsPeakPct, color: '#22d3ee' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>{row.label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: row.color, fontWeight: 700, fontSize: 14 }}>
                      {row.value >= 0 ? '−' : '+'}₹{Math.abs(row.value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                    <span style={{ color: row.color, fontSize: 11, marginLeft: 6 }}>
                      ({row.pct >= 0 ? '−' : '+'}{Math.abs(row.pct).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Price Statistics */}
          {prices.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: 20,
            }}>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
                📈 Price Statistics
              </h3>
              {[
                { label: 'All-Time Low', value: minPrice, color: '#22c55e' },
                { label: 'All-Time High', value: maxPrice, color: '#ef4444' },
                { label: 'Average Price', value: avgPrice, color: '#64748b' },
                { label: 'Current Price', value: product.current_price || 0, color: '#22d3ee' },
              ].map(stat => (
                <div key={stat.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <span style={{ color: '#64748b', fontSize: 13 }}>{stat.label}</span>
                  <span style={{ color: stat.color, fontWeight: 700, fontSize: 15 }}>
                    ₹{stat.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Share Card */}
          {product.current_price && (
            <ShareCard
              title={product.title}
              platform={product.platform}
              currentPrice={product.current_price}
              imageUrl={product.image_url}
              url={product.url}
              priceHistory={product.price_history || []}
            />
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Price History Chart */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, padding: 24,
          }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              📊 Price History
            </h2>
            {chartData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="50%" stopColor="#22d3ee" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="date" stroke="#374151" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis stroke="#374151" tick={{ fill: '#64748b', fontSize: 11 }}
                    tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  {alert && (
                    <>
                      <ReferenceLine y={alert.min_price} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Min', fill: '#22c55e', fontSize: 10 }} />
                      <ReferenceLine y={alert.max_price} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Max', fill: '#f59e0b', fontSize: 10 }} />
                    </>
                  )}
                  {/* Average line */}
                  <ReferenceLine y={avgPrice} stroke="#64748b" strokeDasharray="6 3" strokeOpacity={0.5}
                    label={{ value: 'Avg', fill: '#64748b', fontSize: 9, position: 'insideBottomRight' }} />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="url(#priceGradient)"
                    strokeWidth={2.5}
                    fill="url(#areaFill)"
                    dot={{ fill: '#4f46e5', strokeWidth: 1.5, r: 3, stroke: '#1e2433' }}
                    activeDot={{ r: 6, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2 }}
                    isAnimationActive={true}
                  />
                  {/* Peak and Drop annotations */}
                  {peakIdx >= 0 && chartData[peakIdx] && (
                    <ReferenceDot x={chartData[peakIdx].date} y={chartData[peakIdx].price}
                      r={6} fill="#ef4444" stroke="#fff" strokeWidth={2}
                      label={{ value: '▲ Peak', fill: '#ef4444', fontSize: 10, position: 'top' }}
                    />
                  )}
                  {dropIdx >= 0 && chartData[dropIdx] && dropIdx !== peakIdx && (
                    <ReferenceDot x={chartData[dropIdx].date} y={chartData[dropIdx].price}
                      r={6} fill="#22c55e" stroke="#fff" strokeWidth={2}
                      label={{ value: '▼ Low', fill: '#22c55e', fontSize: 10, position: 'bottom' }}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>📉</p>
                <p style={{ fontSize: 14 }}>Not enough data yet.</p>
                <p style={{ fontSize: 12, marginTop: 4 }}>More data will appear after the next price check.</p>
              </div>
            )}
          </div>

          {/* Smart Insights */}
          {insights.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: 24,
            }}>
              <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                🧠 Smart Insights
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {insights.map((insight, i) => (
                  <div key={i} style={{
                    background: insight.color + '10',
                    border: `1px solid ${insight.color}30`,
                    borderRadius: 12, padding: '12px 16px',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{insight.icon}</span>
                    <span style={{ color: '#f1f5f9', fontSize: 14, lineHeight: 1.5 }}>{insight.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price History Table */}
          {sortedHistory.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 20, padding: 24,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 18, fontWeight: 700 }}>
                  📋 Price Log
                </h2>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    color: '#94a3b8', padding: '6px 14px', borderRadius: 8, fontSize: 12,
                    fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {showHistory ? 'Hide' : `Show All (${sortedHistory.length})`}
                </button>
              </div>
              {showHistory && (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {[...sortedHistory].reverse().map((entry, i, arr) => {
                    const prev = arr[i + 1]
                    const diff = prev ? entry.price - prev.price : 0
                    const diffPct = prev && prev.price > 0 ? (diff / prev.price) * 100 : 0
                    return (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                        fontSize: 13,
                      }}>
                        <span style={{ color: '#64748b' }}>{formatFullDate(entry.checked_at)}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ color: '#f1f5f9', fontWeight: 600 }}>
                            ₹{entry.price.toLocaleString('en-IN')}
                          </span>
                          {diff !== 0 && (
                            <span style={{
                              fontSize: 11, fontWeight: 600,
                              color: diff < 0 ? '#22c55e' : '#ef4444',
                            }}>
                              {diff < 0 ? '↓' : '↑'}{Math.abs(diffPct).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Budget Alert Form */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20, padding: 24,
          }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              🔔 Budget Alert
            </h2>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
              Get emailed when the price falls in your range.
            </p>
            {alertSaved && (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, padding: '10px 14px', color: '#22c55e', fontSize: 13, marginBottom: 16 }}>
                ✅ Alert saved! You&apos;ll be notified when the price matches.
              </div>
            )}
            <form onSubmit={handleSaveAlert}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>Min Price (₹)</label>
                  <input
                    id="detail-min-price"
                    type="number" value={alertForm.min}
                    onChange={e => setAlertForm(p => ({ ...p, min: e.target.value }))}
                    placeholder="45000"
                    required min="0"
                    style={{ width: '100%', background: '#1e2433', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6 }}>Max Price (₹)</label>
                  <input
                    id="detail-max-price"
                    type="number" value={alertForm.max}
                    onChange={e => setAlertForm(p => ({ ...p, max: e.target.value }))}
                    placeholder="55000"
                    required min="0"
                    style={{ width: '100%', background: '#1e2433', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px', color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={alertSaving}
                style={{
                  width: '100%',
                  background: alertSaving ? 'rgba(79,70,229,0.4)' : 'linear-gradient(135deg, #4f46e5, #22d3ee)',
                  border: 'none', color: '#fff', padding: '12px', borderRadius: 8,
                  fontSize: 14, fontWeight: 600, cursor: alertSaving ? 'not-allowed' : 'pointer',
                }}
              >
                {alertSaving ? '🔄 Saving...' : alert ? '✏️ Update Alert' : '🔔 Set Alert'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
