export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
}

export function getRequestHeaders(referer?: string): Record<string, string> {
  return {
    'User-Agent': getRandomUserAgent(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,en-IN;q=0.8',
    'Referer': referer || 'https://www.google.com/',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'cross-site',
    'Cache-Control': 'max-age=0',
  }
}

export function parsePrice(raw: string): number | null {
  if (!raw) return null
  // Remove currency symbols, commas, whitespace, handle ₹ and Rs., but KEEP the decimal point '.'
  const cleaned = raw
    .replace(/[₹Rs,\s]/g, '')
    .trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

export function detectPlatform(url: string): 'amazon' | 'flipkart' | 'unknown' {
  const lowercaseUrl = url.toLowerCase()
  if (
    lowercaseUrl.includes('amazon.in') ||
    lowercaseUrl.includes('amazon.com') ||
    lowercaseUrl.includes('amzn.in') ||
    lowercaseUrl.includes('amzn.to')
  ) {
    return 'amazon'
  }
  if (lowercaseUrl.includes('flipkart.com') || lowercaseUrl.includes('flipkart.app.link')) {
    return 'flipkart'
  }
  return 'unknown'
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 2000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i === retries - 1) throw err
      await sleep(delayMs * (i + 1))
    }
  }
  throw new Error('Max retries exceeded')
}

