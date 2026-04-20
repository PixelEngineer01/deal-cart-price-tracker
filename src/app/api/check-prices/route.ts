import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { scrapeProduct } from '@/lib/scraper'
import { sendBudgetAlertEmail, sendPriceDropEmail } from '@/lib/notifications/email'

// Protect this endpoint with a secret key
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  // Allow access without secret in development
  if (process.env.NODE_ENV === 'development') return true

  if (!cronSecret) return true
  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const results = { checked: 0, updated: 0, alerts_sent: 0, errors: [] as string[] }

  try {
    // Fetch all products with their alerts and owner emails
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        profiles(email),
        alerts(id, min_price, max_price, alert_sent, notification_type, user_id)
      `)

    if (error) throw error
    if (!products || products.length === 0) {
      return NextResponse.json({ message: 'No products to check', ...results })
    }

    results.checked = products.length

    for (const product of products) {
      try {
        // Scrape new price
        const scraped = await scrapeProduct(product.url)

        if (!scraped.price) continue

        const oldPrice = product.current_price
        const newPrice = scraped.price

        // Update product
        await supabase
          .from('products')
          .update({
            current_price: newPrice,
            availability: scraped.availability,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id)

        // Log price history
        await supabase.from('price_history').insert({
          product_id: product.id,
          price: newPrice,
        })

        results.updated++

        const userEmail = product.profiles?.email
        if (!userEmail) continue

        // Check price drop (> 5%)
        if (oldPrice && newPrice < oldPrice * 0.95) {
          try {
            await sendPriceDropEmail({
              to: userEmail,
              productTitle: product.title,
              oldPrice,
              newPrice,
              productUrl: product.url,
              imageUrl: product.image_url,
              platform: product.platform,
            })
          } catch (emailErr) {
            console.error('Price drop email error:', emailErr)
          }
        }

        // Check alerts
        const alerts = product.alerts || []
        for (const alert of alerts) {
          if (newPrice >= alert.min_price && newPrice <= alert.max_price) {
            // Price is in budget range — send alert
            try {
              await sendBudgetAlertEmail({
                to: userEmail,
                productTitle: product.title,
                currentPrice: newPrice,
                minPrice: alert.min_price,
                maxPrice: alert.max_price,
                productUrl: product.url,
                imageUrl: product.image_url,
                platform: product.platform,
              })

              // Mark alert as sent
              await supabase
                .from('alerts')
                .update({ alert_sent: true, last_triggered_at: new Date().toISOString() })
                .eq('id', alert.id)

              results.alerts_sent++
            } catch (emailErr) {
              console.error('Alert email error:', emailErr)
            }
          } else if (alert.alert_sent && (newPrice < alert.min_price || newPrice > alert.max_price)) {
            // Price moved out of range — reset alert so it can fire again
            await supabase
              .from('alerts')
              .update({ alert_sent: false })
              .eq('id', alert.id)
          }
        }

        // Small delay to be respectful to target sites
        await new Promise(resolve => setTimeout(resolve, 2000))
      } catch (productErr) {
        const msg = productErr instanceof Error ? productErr.message : 'Unknown error'
        results.errors.push(`${product.title}: ${msg}`)
        console.error(`Error checking product ${product.id}:`, productErr)
      }
    }

    return NextResponse.json({
      message: 'Price check complete',
      ...results,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Check prices error:', err)
    return NextResponse.json({ error: 'Price check failed' }, { status: 500 })
  }
}
