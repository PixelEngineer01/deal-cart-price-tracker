import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

/**
 * GET /api/test/seed-fake-sale?product_id=<uuid>
 *
 * Seeds a "V-curve" fake-sale price history pattern into the given product
 * so you can verify the fake-sale detection badge on the dashboard.
 *
 * The pattern:
 *   Day 1-3 : baseline price  (e.g. ₹1,000)
 *   Day 4-6 : hiked price     (+25%, ₹1,250)
 *   Day 7-10: "discounted"    (back to ₹1,020 — looks like a deal but isn't)
 *
 * Pass ?reset=true to clear existing history first.
 */
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Dev only' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('product_id')
  const reset = searchParams.get('reset') === 'true'

  if (!productId) {
    return NextResponse.json({
      error: 'Missing product_id query param',
      usage: 'GET /api/test/seed-fake-sale?product_id=<uuid>&reset=true',
    }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Verify product exists
  const { data: product, error: prodErr } = await supabase
    .from('products')
    .select('id, title, current_price')
    .eq('id', productId)
    .single()

  if (prodErr || !product) {
    return NextResponse.json({ error: 'Product not found', details: prodErr }, { status: 404 })
  }

  const basePrice = product.current_price || 1000

  // Optionally clear old history
  if (reset) {
    await supabase.from('price_history').delete().eq('product_id', productId)
  }

  // Build the V-curve pattern (10 data points over ~10 days)
  const now = Date.now()
  const DAY = 24 * 60 * 60 * 1000

  const fakePrices = [
    // Baseline (days 1-3)
    { price: basePrice,                  daysAgo: 10 },
    { price: basePrice * 1.01,           daysAgo: 9 },
    { price: basePrice * 0.99,           daysAgo: 8 },
    // Hike phase (days 4-6) — price inflated 25%
    { price: basePrice * 1.20,           daysAgo: 7 },
    { price: basePrice * 1.25,           daysAgo: 6 },
    { price: basePrice * 1.28,           daysAgo: 5 },
    // "Discount" phase (days 7-10) — drops back near baseline
    { price: basePrice * 1.15,           daysAgo: 4 },
    { price: basePrice * 1.08,           daysAgo: 3 },
    { price: basePrice * 1.03,           daysAgo: 2 },
    { price: basePrice * 1.02,           daysAgo: 1 },  // "sale price" — still above original!
  ]

  const rows = fakePrices.map(fp => ({
    product_id: productId,
    price: Math.round(fp.price),
    checked_at: new Date(now - fp.daysAgo * DAY).toISOString(),
  }))

  const { error: insertErr } = await supabase.from('price_history').insert(rows)

  if (insertErr) {
    return NextResponse.json({ error: 'Insert failed', details: insertErr }, { status: 500 })
  }

  // Update product current_price to the "sale" price
  const salePrice = Math.round(basePrice * 1.02)
  await supabase
    .from('products')
    .update({ current_price: salePrice })
    .eq('id', productId)

  return NextResponse.json({
    message: '✅ Fake sale V-curve pattern seeded!',
    product: product.title,
    basePrice,
    hikedTo: Math.round(basePrice * 1.28),
    currentSalePrice: salePrice,
    realDiscount: '-2% (actually MORE expensive than original)',
    dataPoints: rows.length,
    howToVerify: [
      `1. Open http://localhost:3000/dashboard`,
      `2. Look for the 🚨 "Fake Sale" badge on "${product.title}"`,
      `3. Click into the product detail page to see the full insight`,
    ],
  })
}
