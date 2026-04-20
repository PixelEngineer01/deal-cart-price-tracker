import { type PriceHistory } from '@/types'
export interface InsightResult {
  type:
    | 'great_deal'
    | 'price_drop'
    | 'price_rising'
    | 'stable'
    | 'all_time_low'
    | 'in_budget'
    | 'fake_sale'
    | 'high_volatility'
    | 'savings'
    | 'buy_now'
    | 'wait'
  message: string
  icon: string
  color: string
  priority?: number
}

export interface DealScore {
  score: number       // 0-100
  label: string       // 'Great Deal' | 'Good' | 'Fair' | 'Overpriced' | 'Wait'
  color: string
}

export interface PriceSavings {
  vsHigh: number      // Amount saved vs all-time high
  vsHighPct: number
  vsAvg: number       // Amount saved vs average
  vsAvgPct: number
  vsPeak: number      // Amount saved vs recent peak (within 30 days)
  vsPeakPct: number
}

/**
 * Detect "fake sale" V-curve pattern (inspired by PriceDive).
 * Pattern: price rises 10%+ over a few days, then drops with a "discount" label.
 * The final price may still be higher than the original baseline.
 */
function detectFakeSale(history: PriceHistory[]): InsightResult | null {
  if (history.length < 5) return null

  const prices = history.map(h => h.price)
  const recent = prices.slice(-10)  // Look at last 10 data points

  if (recent.length < 5) return null

  // Find min in first half and max in the series
  const firstHalf = recent.slice(0, Math.ceil(recent.length / 2))
  const baseline = Math.min(...firstHalf)
  const peak = Math.max(...recent)
  const current = recent[recent.length - 1]

  // V-curve: price went up 15%+ from baseline, then came back down
  const hikePercent = ((peak - baseline) / baseline) * 100
  const dropFromPeak = ((peak - current) / peak) * 100
  const actualDiscount = ((baseline - current) / baseline) * 100

  if (hikePercent >= 15 && dropFromPeak >= 10) {
    if (current >= baseline * 0.95) {
      // Price dropped from peak but is still near or above original
      return {
        type: 'fake_sale',
        message: `⚠️ Fake sale detected! Price was hiked ${hikePercent.toFixed(0)}% before this "discount". Real savings: only ${Math.max(0, actualDiscount).toFixed(1)}% vs the original price.`,
        icon: '🚨',
        color: '#ef4444',
        priority: 10,
      }
    }
  }

  return null
}

/**
 * Calculate the "Deal Score" (0-100) for a product.
 * Higher = better deal.
 * Inspired by BrowserUse-Price-Tracker's "best deal" ranking.
 */
export function calculateDealScore(
  history: PriceHistory[],
  currentPrice: number,
  minBudget?: number,
  maxBudget?: number
): DealScore {
  if (!history || history.length === 0 || !currentPrice) {
    return { score: 50, label: 'No Data', color: '#64748b' }
  }

  const prices = history.map(h => h.price).filter(Boolean)
  if (prices.length === 0) return { score: 50, label: 'No Data', color: '#64748b' }

  const allTimeLow = Math.min(...prices)
  const allTimeHigh = Math.max(...prices)
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length
  const range = allTimeHigh - allTimeLow

  let score = 50

  // Position in price range (0 = at high, 100 = at low)
  if (range > 0) {
    const positionScore = ((allTimeHigh - currentPrice) / range) * 40
    score += positionScore - 20  // -20 to +20 range
  }

  // Below average bonus
  if (currentPrice < avgPrice) {
    const belowAvgPct = ((avgPrice - currentPrice) / avgPrice) * 100
    score += Math.min(belowAvgPct * 2, 20)  // up to +20
  } else {
    const aboveAvgPct = ((currentPrice - avgPrice) / avgPrice) * 100
    score -= Math.min(aboveAvgPct * 2, 15)  // up to -15
  }

  // At all-time low bonus
  if (currentPrice <= allTimeLow * 1.02) {
    score += 15
  }

  // In budget bonus
  if (minBudget !== undefined && maxBudget !== undefined) {
    if (currentPrice >= minBudget && currentPrice <= maxBudget) {
      score += 10
    }
  }

  // Recent trend: falling = +5, rising = -5
  if (prices.length >= 3) {
    const last3 = prices.slice(-3)
    if (last3[0] > last3[1] && last3[1] > last3[2]) score += 5
    else if (last3[0] < last3[1] && last3[1] < last3[2]) score -= 5
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  if (score >= 80) return { score, label: 'Great Deal', color: '#22c55e' }
  if (score >= 60) return { score, label: 'Good', color: '#22d3ee' }
  if (score >= 40) return { score, label: 'Fair', color: '#f59e0b' }
  if (score >= 20) return { score, label: 'Overpriced', color: '#ef4444' }
  return { score, label: 'Wait', color: '#ef4444' }
}

/**
 * Calculate savings vs historical prices.
 * Inspired by PriceDive's price change calculation.
 */
export function calculateSavings(
  history: PriceHistory[],
  currentPrice: number
): PriceSavings {
  const prices = history.map(h => h.price).filter(Boolean)
  const defaultSavings: PriceSavings = { vsHigh: 0, vsHighPct: 0, vsAvg: 0, vsAvgPct: 0, vsPeak: 0, vsPeakPct: 0 }

  if (prices.length === 0 || !currentPrice) return defaultSavings

  const allTimeHigh = Math.max(...prices)
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

  // Recent peak (last 30 entries)
  const recentPrices = prices.slice(-30)
  const recentPeak = Math.max(...recentPrices)

  return {
    vsHigh: Math.max(0, allTimeHigh - currentPrice),
    vsHighPct: allTimeHigh > 0 ? Math.max(0, ((allTimeHigh - currentPrice) / allTimeHigh) * 100) : 0,
    vsAvg: avgPrice - currentPrice,
    vsAvgPct: avgPrice > 0 ? ((avgPrice - currentPrice) / avgPrice) * 100 : 0,
    vsPeak: Math.max(0, recentPeak - currentPrice),
    vsPeakPct: recentPeak > 0 ? Math.max(0, ((recentPeak - currentPrice) / recentPeak) * 100) : 0,
  }
}

/**
 * Calculate daily price change percentage.
 * Inspired by PriceDive's daily change % with emoji indicators.
 */
export function getDailyChange(history: PriceHistory[]): { pct: number; direction: 'up' | 'down' | 'stable'; emoji: string } | null {
  if (!history || history.length < 2) return null

  const sorted = [...history].sort((a, b) => new Date(a.checked_at).getTime() - new Date(b.checked_at).getTime())
  const current = sorted[sorted.length - 1].price
  const previous = sorted[sorted.length - 2].price

  if (!current || !previous || previous === 0) return null

  const pct = ((current - previous) / previous) * 100
  if (Math.abs(pct) < 0.5) return { pct: 0, direction: 'stable', emoji: '➡️' }
  if (pct > 0) return { pct, direction: 'up', emoji: '📈' }
  return { pct, direction: 'down', emoji: '📉' }
}

export function generateInsights(
  history: PriceHistory[],
  currentPrice: number,
  minBudget?: number,
  maxBudget?: number
): InsightResult[] {
  const insights: InsightResult[] = []
  if (!history || history.length === 0) return insights

  const prices = history.map(h => h.price).filter(Boolean)
  if (prices.length === 0) return insights

  const allTimeLow = Math.min(...prices)
  const allTimeHigh = Math.max(...prices)
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length

  // ===== FAKE SALE DETECTION (PriceDive inspired) =====
  const fakeSale = detectFakeSale(history)
  if (fakeSale) insights.push(fakeSale)

  // ===== In budget check =====
  if (minBudget !== undefined && maxBudget !== undefined) {
    if (currentPrice >= minBudget && currentPrice <= maxBudget) {
      insights.push({
        type: 'in_budget',
        message: 'Price is within your budget range! Great time to buy.',
        icon: '✅',
        color: '#22c55e',
        priority: 9,
      })
    }
  }

  // ===== All time low =====
  if (currentPrice <= allTimeLow) {
    insights.push({
      type: 'all_time_low',
      message: "This is the lowest price we've ever recorded!",
      icon: '⭐',
      color: '#f59e0b',
      priority: 8,
    })
  }

  // ===== Savings info =====
  if (allTimeHigh > currentPrice && prices.length >= 3) {
    const savingsVsHigh = allTimeHigh - currentPrice
    const savingsPct = ((savingsVsHigh) / allTimeHigh) * 100
    if (savingsPct >= 5) {
      insights.push({
        type: 'savings',
        message: `You save ₹${savingsVsHigh.toLocaleString('en-IN', { maximumFractionDigits: 0 })} (${savingsPct.toFixed(1)}%) vs the peak price of ₹${allTimeHigh.toLocaleString('en-IN', { maximumFractionDigits: 0 })}.`,
        icon: '💰',
        color: '#22c55e',
        priority: 6,
      })
    }
  }

  // ===== Recent price drop (last 24h) =====
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const recent = history.filter(h => new Date(h.checked_at) >= oneDayAgo)
  if (recent.length >= 2) {
    const firstRecent = recent[0].price
    const lastRecent = recent[recent.length - 1].price
    const dropPercent = ((firstRecent - lastRecent) / firstRecent) * 100
    if (dropPercent > 5) {
      insights.push({
        type: 'price_drop',
        message: `Price dropped ${dropPercent.toFixed(1)}% in the last 24 hours!`,
        icon: '🔥',
        color: '#22c55e',
        priority: 7,
      })
    }
  }

  // ===== High volatility =====
  if (prices.length >= 5) {
    const recentPrices = prices.slice(-5)
    const recentMin = Math.min(...recentPrices)
    const recentMax = Math.max(...recentPrices)
    const volatility = ((recentMax - recentMin) / recentMin) * 100
    if (volatility > 15) {
      insights.push({
        type: 'high_volatility',
        message: `⚡ High volatility: Price swung ${volatility.toFixed(1)}% in recent checks. Might change quickly.`,
        icon: '⚡',
        color: '#f59e0b',
        priority: 5,
      })
    }
  }

  // ===== Trending (last 3 checks) =====
  if (prices.length >= 3) {
    const last3 = prices.slice(-3)
    const isRising = last3[0] < last3[1] && last3[1] < last3[2]
    const isFalling = last3[0] > last3[1] && last3[1] > last3[2]

    if (isRising) {
      insights.push({
        type: 'price_rising',
        message: 'Price is trending upward — consider buying soon.',
        icon: '📈',
        color: '#ef4444',
        priority: 4,
      })
    } else if (isFalling) {
      insights.push({
        type: 'wait',
        message: 'Price is trending downward — might drop further. Consider waiting.',
        icon: '📉',
        color: '#22d3ee',
        priority: 4,
      })
    }
  }

  // ===== Stable (all prices within 2% of each other) =====
  if (prices.length >= 5) {
    const range = allTimeHigh - allTimeLow
    if (range / avgPrice < 0.02) {
      insights.push({
        type: 'stable',
        message: 'Price has been very stable — no rush to buy.',
        icon: '📊',
        color: '#64748b',
        priority: 2,
      })
    }
  }

  // ===== Good deal vs historical average =====
  if (prices.length >= 3) {
    if (currentPrice < avgPrice * 0.9) {
      insights.push({
        type: 'great_deal',
        message: `Price is 10%+ below historical average (avg: ₹${avgPrice.toFixed(0)}).`,
        icon: '💎',
        color: '#22c55e',
        priority: 7,
      })
    }
  }

  // ===== Buy now recommendation =====
  const dealScore = calculateDealScore(history, currentPrice, minBudget, maxBudget)
  if (dealScore.score >= 80 && !fakeSale) {
    insights.push({
      type: 'buy_now',
      message: `Deal Score: ${dealScore.score}/100 — This is a great time to buy!`,
      icon: '🎯',
      color: '#22c55e',
      priority: 9,
    })
  }

  // Sort by priority (highest first)
  insights.sort((a, b) => (b.priority || 0) - (a.priority || 0))

  return insights
}
