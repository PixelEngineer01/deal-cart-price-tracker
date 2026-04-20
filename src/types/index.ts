export interface PriceHistory {
  price: number
  checked_at: string
}

export interface Alert {
  id: string
  min_price: number
  max_price: number
  alert_sent: boolean
}

export interface Product {
  id: string
  title: string
  url: string
  image_url: string
  platform: string
  current_price: number | null
  original_price: number | null
  rating: string
  availability: string
  created_at: string
  updated_at: string
  alerts: Alert[]
  price_history: PriceHistory[]
}

export interface ScrapedProduct {
  title: string
  price: number | null
  image_url: string
  rating: string
  availability: string
  platform: 'amazon' | 'flipkart'
  url: string
}

export interface AlertEmailData {
  to: string
  productTitle: string
  currentPrice: number
  minPrice: number
  maxPrice: number
  productUrl: string
  imageUrl?: string
  platform: string
}

export interface PriceDropEmailData {
  to: string
  productTitle: string
  oldPrice: number
  newPrice: number
  productUrl: string
  imageUrl?: string
  platform: string
}
