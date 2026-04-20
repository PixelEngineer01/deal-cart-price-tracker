'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

function PlatformBadge({ url }: { url: string }) {
  const lower = url.toLowerCase()
  if (lower.includes('amazon') || lower.includes('amzn.')) return <span style={{ background: '#ff9900', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20, textTransform: 'uppercase' }}>Amazon</span>
  if (lower.includes('flipkart')) return <span style={{ background: '#2874f0', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 10px', borderRadius: 20, textTransform: 'uppercase' }}>Flipkart</span>
  return null
}

export default function AddProductPage() {
  const router = useRouter()
  const [url, setUrl] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<{ title: string; price: number | null; image_url: string; platform: string } | null>(null)
  const [step, setStep] = useState<'url' | 'budget' | 'done'>('url')

  const isValidUrl = (u: string) => {
    try { 
      new URL(u); 
      const lower = u.toLowerCase();
      return lower.includes('amazon') || lower.includes('amzn.in') || lower.includes('amzn.to') || lower.includes('flipkart');
    } catch { 
      return false 
    }
  }

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidUrl(url)) {
      setError('Please enter a valid Amazon.in or Flipkart product URL')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/add-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to add product')

      setPreview(data.scraped)
      setStep('budget')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!preview || !minPrice || !maxPrice) return

    if (parseFloat(minPrice) >= parseFloat(maxPrice)) {
      setError('Min price must be less than max price')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Get the product ID from the last added product
      const productsRes = await fetch('/api/products')
      const productsData = await productsRes.json()
      const latestProduct = productsData.products?.[0]

      if (!latestProduct) throw new Error('Product not found')

      const alertRes = await fetch('/api/set-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: latestProduct.id,
          min_price: parseFloat(minPrice),
          max_price: parseFloat(maxPrice),
        }),
      })

      if (!alertRes.ok) {
        const alertData = await alertRes.json()
        throw new Error(alertData.error || 'Failed to set alert')
      }

      setStep('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set alert')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'done') {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', paddingTop: 40 }}>
        <div style={{
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 24,
          padding: 48,
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 26, marginBottom: 12 }}>
            Product Added!
          </h2>
          {preview && (
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              <strong style={{ color: '#f1f5f9' }}>{preview.title.substring(0, 60)}...</strong>
              <br />is now being tracked. You&apos;ll get an email when the price hits your budget!
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setUrl(''); setPreview(null); setStep('url'); setMinPrice(''); setMaxPrice('') }}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9',
                padding: '12px 28px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >➕ Add Another</button>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
                border: 'none',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >📊 View Dashboard</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Add a Product ➕
        </h1>
        <p style={{ color: '#64748b', fontSize: 15 }}>
          Paste a product URL from Amazon or Flipkart to start tracking its price.
        </p>
      </div>

      {/* Steps indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {[
          { n: 1, label: 'Add URL', active: step === 'url' },
          { n: 2, label: 'Set Budget', active: step === 'budget' },
        ].map(s => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: s.active || step === 'budget' && s.n === 1
                ? 'linear-gradient(135deg, #4f46e5, #22d3ee)'
                : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700,
              color: s.active || step === 'budget' && s.n === 1 ? '#fff' : '#64748b',
            }}>{s.n}</div>
            <span style={{ fontSize: 13, color: s.active ? '#f1f5f9' : '#64748b', fontWeight: s.active ? 600 : 400 }}>{s.label}</span>
            {s.n === 1 && <span style={{ color: '#374151' }}>→</span>}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 10,
          padding: '12px 16px',
          color: '#ef4444',
          fontSize: 14,
          marginBottom: 20,
        }}>⚠️ {error}</div>
      )}

      {/* Step 1 — URL */}
      {step === 'url' && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 20,
          padding: 32,
        }}>
          <form onSubmit={handleScrape}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
              Product URL
            </label>

            {url && (
              <div style={{ marginBottom: 8 }}>
                <PlatformBadge url={url} />
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <input
                id="product-url"
                type="url"
                value={url}
                onChange={e => { setUrl(e.target.value); setError('') }}
                placeholder="https://www.amazon.in/product/... or https://www.flipkart.com/..."
                required
                style={{
                  flex: 1,
                  minWidth: 200,
                  background: '#1e2433',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  color: '#f1f5f9',
                  fontSize: 14,
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <button
                type="submit"
                disabled={loading || !url}
                style={{
                  background: loading ? 'rgba(79,70,229,0.4)' : 'linear-gradient(135deg, #4f46e5, #22d3ee)',
                  border: 'none',
                  color: '#fff',
                  padding: '14px 28px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? '🔄 Scraping...' : '🔍 Fetch Product'}
              </button>
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ color: '#374151', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>✅ Amazon.in</span>
              <span style={{ color: '#374151', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>✅ Flipkart.com</span>
            </div>
          </form>
        </div>
      )}

      {/* Step 2 — Preview + Budget */}
      {step === 'budget' && preview && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Preview card */}
          <div style={{
            background: 'rgba(34,197,94,0.05)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 20,
            padding: 24,
            display: 'flex',
            gap: 20,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            {preview.image_url && (
              <img
                src={preview.image_url}
                alt={preview.title}
                style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 8, background: '#1e2433', padding: 4, flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ color: '#22c55e', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>✅ Product fetched successfully!</p>
              <p style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 600, lineHeight: 1.4, marginBottom: 8 }}>
                {preview.title.substring(0, 80)}{preview.title.length > 80 ? '...' : ''}
              </p>
              <div style={{ color: '#22c55e', fontSize: 22, fontWeight: 700 }}>
                {preview.price ? `₹${preview.price.toLocaleString('en-IN')}` : 'Price not found'}
              </div>
            </div>
          </div>

          {/* Budget form */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: 28,
          }}>
            <h3 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
              🔔 Set Budget Alert
            </h3>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>
              You&apos;ll get an email when the price falls within your range.
            </p>

            <form onSubmit={handleSetAlert}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                    Min Price (₹)
                  </label>
                  <input
                    id="min-price"
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="e.g. 45000"
                    required
                    min="0"
                    step="100"
                    style={{
                      width: '100%',
                      background: '#1e2433',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      color: '#f1f5f9',
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#22c55e'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                    Max Price (₹)
                  </label>
                  <input
                    id="max-price"
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="e.g. 55000"
                    required
                    min="0"
                    step="100"
                    style={{
                      width: '100%',
                      background: '#1e2433',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 10,
                      padding: '12px 16px',
                      color: '#f1f5f9',
                      fontSize: 15,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    onFocus={e => e.target.style.borderColor = '#ef4444'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>
              </div>

              {minPrice && maxPrice && parseFloat(minPrice) < parseFloat(maxPrice) && (
                <div style={{
                  background: 'rgba(79,70,229,0.1)',
                  border: '1px solid rgba(79,70,229,0.2)',
                  borderRadius: 10,
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#a5b4fc',
                  marginBottom: 20,
                }}>
                  🎯 Alert range: ₹{parseFloat(minPrice).toLocaleString('en-IN')} – ₹{parseFloat(maxPrice).toLocaleString('en-IN')}
                </div>
              )}

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                    padding: '12px 20px',
                    borderRadius: 10,
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >Skip & Track</button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
                    border: 'none',
                    color: '#fff',
                    padding: '12px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? '🔄 Saving...' : '🔔 Set Alert & Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
