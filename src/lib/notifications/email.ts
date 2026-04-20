import { type AlertEmailData, type PriceDropEmailData } from '@/types'

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`
}

function getPlatformBadge(platform: string): string {
  const badges: Record<string, string> = {
    amazon: '#FF9900',
    flipkart: '#2874f0',
    unknown: '#4f46e5',
  }
  return badges[platform.toLowerCase()] || '#4f46e5'
}

const emailBase = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DealCart Alert</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f19;font-family:'Segoe UI',Arial,sans-serif;color:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b0f19;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#22d3ee);border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;letter-spacing:4px;text-transform:uppercase;color:rgba(255,255,255,0.7);">DEALCART</p>
              <h1 style="margin:8px 0 0;font-size:28px;font-weight:700;color:#ffffff;">🛒 Track Smarter. Buy Better.</h1>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="background:#0f172a;border:1px solid rgba(255,255,255,0.08);border-top:none;border-radius:0 0 16px 16px;padding:32px;">
              ${content}
              <!-- Footer -->
              <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);text-align:center;">
                <p style="color:#64748b;font-size:12px;margin:0;">You're receiving this because you set a price alert on DealCart.</p>
                <p style="color:#64748b;font-size:12px;margin:8px 0 0;">DealCart — localhost prototype</p>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

export async function sendBudgetAlertEmail(data: AlertEmailData): Promise<void> {
  const { to, productTitle, currentPrice, minPrice, maxPrice, productUrl, imageUrl, platform } = data
  const platformColor = getPlatformBadge(platform)

  const content = `
    <h2 style="color:#22c55e;font-size:22px;margin:0 0 8px;">✅ Price is Within Your Budget!</h2>
    <p style="color:#94a3b8;font-size:16px;margin:0 0 24px;">Great news! A product you're tracking has dropped into your budget range.</p>

    ${imageUrl ? `<div style="text-align:center;margin-bottom:24px;"><img src="${imageUrl}" alt="${productTitle}" style="max-width:200px;max-height:200px;object-fit:contain;border-radius:8px;background:#1e2433;padding:8px;" /></div>` : ''}

    <div style="background:#1e2433;border-radius:12px;padding:24px;margin-bottom:24px;">
      <span style="background:${platformColor};color:#fff;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">${platform}</span>
      <h3 style="color:#f1f5f9;font-size:18px;font-weight:600;margin:12px 0;">${productTitle}</h3>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="color:#64748b;font-size:14px;">Current Price</span>
          </td>
          <td align="right" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="color:#22c55e;font-size:22px;font-weight:700;">${formatPrice(currentPrice)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <span style="color:#64748b;font-size:14px;">Your Budget Range</span>
          </td>
          <td align="right" style="padding:8px 0;">
            <span style="color:#22d3ee;font-size:16px;font-weight:600;">${formatPrice(minPrice)} – ${formatPrice(maxPrice)}</span>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align:center;">
      <a href="${productUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#22d3ee);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;letter-spacing:0.5px;">
        🛍️ Buy Now
      </a>
    </div>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `DealCart <${process.env.SMTP_USER}>`,
    to,
    subject: `✅ Price Alert! ${productTitle.substring(0, 50)} is now ${formatPrice(currentPrice)}`,
    html: emailBase(content),
  })
}

export async function sendPriceDropEmail(data: PriceDropEmailData): Promise<void> {
  const { to, productTitle, oldPrice, newPrice, productUrl, imageUrl, platform } = data
  const platformColor = getPlatformBadge(platform)
  const dropPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100)

  const content = `
    <h2 style="color:#f59e0b;font-size:22px;margin:0 0 8px;">📉 Price Dropped!</h2>
    <p style="color:#94a3b8;font-size:16px;margin:0 0 24px;">A product in your DealCart just got cheaper!</p>

    ${imageUrl ? `<div style="text-align:center;margin-bottom:24px;"><img src="${imageUrl}" alt="${productTitle}" style="max-width:200px;max-height:200px;object-fit:contain;border-radius:8px;background:#1e2433;padding:8px;" /></div>` : ''}

    <div style="background:#1e2433;border-radius:12px;padding:24px;margin-bottom:24px;">
      <span style="background:${platformColor};color:#fff;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;">${platform}</span>
      <h3 style="color:#f1f5f9;font-size:18px;font-weight:600;margin:12px 0;">${productTitle}</h3>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;background:#0b0f19;border-radius:8px;padding:16px;">
        <div style="text-align:center;">
          <p style="color:#64748b;font-size:12px;margin:0 0 4px;">WAS</p>
          <p style="color:#ef4444;font-size:18px;font-weight:600;text-decoration:line-through;margin:0;">${formatPrice(oldPrice)}</p>
        </div>
        <div style="color:#22d3ee;font-size:24px;">→</div>
        <div style="text-align:center;">
          <p style="color:#64748b;font-size:12px;margin:0 0 4px;">NOW</p>
          <p style="color:#22c55e;font-size:24px;font-weight:700;margin:0;">${formatPrice(newPrice)}</p>
        </div>
        <div style="background:rgba(34,197,94,0.15);border-radius:8px;padding:8px 16px;text-align:center;">
          <p style="color:#22c55e;font-size:20px;font-weight:700;margin:0;">-${dropPercent}%</p>
          <p style="color:#64748b;font-size:11px;margin:0;">OFF</p>
        </div>
      </div>
    </div>

    <div style="text-align:center;">
      <a href="${productUrl}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#22d3ee);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;letter-spacing:0.5px;">
        🛍️ View Deal
      </a>
    </div>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `DealCart <${process.env.SMTP_USER}>`,
    to,
    subject: `📉 Price Drop! ${productTitle.substring(0, 50)} dropped by ${dropPercent}%`,
    html: emailBase(content),
  })
}

export async function sendWelcomeEmail(to: string): Promise<void> {
  const content = `
    <h2 style="color:#f1f5f9;font-size:24px;margin:0 0 12px;">Welcome to DealCart! 🎉</h2>
    <p style="color:#94a3b8;font-size:16px;line-height:1.6;margin:0 0 24px;">
      You're all set to track prices and never miss a deal again. Here's what you can do:
    </p>
    
    <div style="background:#1e2433;border-radius:12px;padding:24px;">
      <div style="margin-bottom:16px;">
        <span style="font-size:20px;">🔗</span>
        <strong style="color:#f1f5f9;margin-left:8px;">Add Product URLs</strong>
        <p style="color:#64748b;font-size:14px;margin:4px 0 0 28px;">Paste any Amazon or Flipkart product link.</p>
      </div>
      <div style="margin-bottom:16px;">
        <span style="font-size:20px;">📊</span>
        <strong style="color:#f1f5f9;margin-left:8px;">Track Price History</strong>
        <p style="color:#64748b;font-size:14px;margin:4px 0 0 28px;">See price trends over time with beautiful charts.</p>
      </div>
      <div>
        <span style="font-size:20px;">🔔</span>
        <strong style="color:#f1f5f9;margin-left:8px;">Set Budget Alerts</strong>
        <p style="color:#64748b;font-size:14px;margin:4px 0 0 28px;">Get emailed the moment a price matches your budget.</p>
      </div>
    </div>

    <div style="text-align:center;margin-top:32px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
         style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#22d3ee);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:16px;font-weight:600;">
        Go to Dashboard →
      </a>
    </div>
  `

  await transporter.sendMail({
    from: process.env.SMTP_FROM || `DealCart <${process.env.SMTP_USER}>`,
    to,
    subject: '🛒 Welcome to DealCart — Track smarter. Buy better.',
    html: emailBase(content),
  })
}
