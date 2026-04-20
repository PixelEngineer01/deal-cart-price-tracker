import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scrapeProduct } from '@/lib/scraper'
import { detectPlatform } from '@/lib/scraper/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Product URL is required' }, { status: 400 })
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const platform = detectPlatform(parsedUrl.href)
    if (platform === 'unknown') {
      return NextResponse.json(
        { error: 'Only Amazon.in and Flipkart URLs are supported' },
        { status: 400 }
      )
    }

    // Scrape product details
    const scraped = await scrapeProduct(parsedUrl.href)

    // Insert product
    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        title: scraped.title,
        url: parsedUrl.href,
        image_url: scraped.image_url,
        platform: scraped.platform,
        current_price: scraped.price,
        original_price: scraped.price,
        rating: scraped.rating,
        availability: scraped.availability,
      })
      .select()
      .single()

    if (insertError) {
      console.error('Insert error details:', JSON.stringify(insertError, null, 2))
      return NextResponse.json(
        { error: `Failed to save product: ${insertError.message} | ${insertError.details}` },
        { status: 500 }
      )
    }

    // Record initial price history
    if (scraped.price && product) {
      await supabase.from('price_history').insert({
        product_id: product.id,
        price: scraped.price,
      })
    }

    return NextResponse.json({ product, scraped }, { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Scraping failed'
    console.error('Add product error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
