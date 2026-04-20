import axios from 'axios'
import * as cheerio from 'cheerio'
import { getRequestHeaders, parsePrice } from './utils'
import { type ScrapedProduct } from '@/types'

export async function scrapeFlipkart(url: string): Promise<ScrapedProduct> {
  const response = await axios.get(url, {
    headers: getRequestHeaders('https://www.flipkart.com/'),
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
    $('span.B_NuCI').text().trim() ||
    $('span.VU-ZEz').text().trim() ||
    $('h1 .VU-ZEz').text().trim() ||
    $('h1._9E25nV span').first().text().trim() ||
    $('h1.yhB1nd').first().text().trim() ||
    $('span[class*="B_NuCI"]').first().text().trim() ||
    ''

  if (!title || title === '') {
    throw new Error('Flipkart blocked the scraper. Cannot extract the product title.')
  }

  // Price
  const rawPrice =
    ldPrice ||
    $('div._30jeq3._16Jk6d').first().text().trim() ||
    $('div.Nx9bqj.CxFj1').first().text().trim() ||
    $('div.dyC4hf div.Nx9bqj').first().text().trim() ||
    $('meta[propertyName="price"]').attr('content') ||
    ''

  const price = parsePrice(rawPrice)

  // Image
  const image_url =
    ldImage ||
    $('meta[property="og:image"]').attr('content') ||
    $('img._396cs4').first().attr('src') ||
    $('img._2r_T1I').first().attr('src') ||
    $('div._2xcnqk img').first().attr('src') ||
    $('img[loading="eager"]').first().attr('src') ||
    ''

  // Rating
  const rating =
    $('div._3LWZlK').first().text().trim() ||
    $('[class*="_3LWZlK"]').first().text().trim() ||
    'No rating'

  // Availability
  const outOfStock = $('div._16FRp0').length > 0 ||
    $('div.Z83tAp').text().toLowerCase().includes('out of stock')

  const availability = outOfStock ? 'Out of Stock' : 'In Stock'

  return {
    title: title.substring(0, 255),
    price,
    image_url,
    rating: rating ? `${rating} / 5` : 'No rating',
    availability,
    platform: 'flipkart',
    url,
  }
}
