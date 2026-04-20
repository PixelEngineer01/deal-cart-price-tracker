import { type ScrapedProduct } from '@/types'
import { detectPlatform, withRetry } from './utils'
import { scrapeAmazon } from './amazon'
import { scrapeFlipkart } from './flipkart'

export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  const platform = detectPlatform(url)

  if (platform === 'amazon') {
    return withRetry(() => scrapeAmazon(url))
  }

  if (platform === 'flipkart') {
    return withRetry(() => scrapeFlipkart(url))
  }

  throw new Error(`Unsupported platform. Please use Amazon.in or Flipkart URLs.`)
}

export { detectPlatform }
// ScrapedProduct is exported from @/types
