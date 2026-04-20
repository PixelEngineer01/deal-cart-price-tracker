import axios from 'axios'
import * as cheerio from 'cheerio'
import { getRequestHeaders, parsePrice } from './utils'
import { type ScrapedProduct } from '@/types'

export async function scrapeAmazon(url: string): Promise<ScrapedProduct> {
  const response = await axios.get(url, {
    headers: getRequestHeaders('https://www.amazon.in/'),
    timeout: 15000,
    maxRedirects: 5,
  })

  const $ = cheerio.load(response.data)

  let ldTitle = ''
  let ldPrice = ''
  let ldImage = ''

  // Attempt to extract from SEO structured data
  $('script[type="application/ld+json"]').each((i, el) => {
    try {
      const json = JSON.parse($(el).text())
      const items = Array.isArray(json) ? json : [json]
      for (const item of items) {
        if (item['@type'] === 'Product') {
          if (item.name) ldTitle = item.name
          if (item.offers && item.offers.price) ldPrice = item.offers.price.toString()
          if (item.image) ldImage = Array.isArray(item.image) ? item.image[0] : item.image
        }
      }
    } catch (err) {}
  })

  // Title
  const title =
    ldTitle ||
    $('#productTitle').text().trim() ||
    $('span#productTitle').text().trim() ||
    $('h1.a-size-large').text().trim()

  if (!title || title === '') {
    throw new Error('Amazon blocked the scraper with a Captcha. Try a Flipkart URL, or run tracking locally.')
  }

  // Price — try multiple selectors
  const rawPrice =
    ldPrice ||
    $('.a-price .a-offscreen').first().text().trim() ||
    $('#priceblock_ourprice').text().trim() ||
    $('#priceblock_dealprice').text().trim() ||
    $('#priceblock_saleprice').text().trim() ||
    $('.a-price-whole').first().text().trim() ||
    $('span[data-a-size="xl"] .a-offscreen').text().trim() ||
    ''

  const price = parsePrice(rawPrice)

  // Image
  const image_url =
    ldImage ||
    $('meta[property="og:image"]').attr('content') ||
    $('#landingImage').attr('src') ||
    $('#imgBlkFront').attr('src') ||
    $('img#main-image').attr('src') ||
    $('#main-image-container img').first().attr('src') ||
    ''

  // Rating
  const rating =
    $('#acrPopover').attr('title') ||
    $('span.a-icon-alt').first().text().trim() ||
    'No rating'

  // Availability
  const availabilityRaw =
    $('#availability span').first().text().trim() ||
    $('[data-feature-name="availability"] span').first().text().trim() ||
    'Check website'

  const availability = availabilityRaw.toLowerCase().includes('in stock')
    ? 'In Stock'
    : availabilityRaw.toLowerCase().includes('out of stock')
    ? 'Out of Stock'
    : availabilityRaw || 'Check website'

  return {
    title: title.substring(0, 255),
    price,
    image_url: image_url.split('?')[0] || '', // clean query params
    rating: rating.substring(0, 50),
    availability,
    platform: 'amazon',
    url,
  }
}
