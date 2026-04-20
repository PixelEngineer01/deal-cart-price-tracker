import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'DealCart — Track smarter. Buy better.',
  description: 'Track e-commerce product prices and get notified when prices match your budget. Never miss a deal again.',
  keywords: ['price tracker', 'deal tracker', 'amazon price alert', 'flipkart price alert'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen" style={{ background: '#0b0f19', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>{children}</div>
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.05)',
          padding: '16px 24px',
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}>
          <span style={{ color: '#374151', fontSize: 13 }}>Made with</span>
          <span style={{
            fontSize: 15,
            background: 'linear-gradient(135deg, #ef4444, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>❤️</span>
          <span style={{ color: '#374151', fontSize: 13 }}>by</span>
          <span style={{
            fontSize: 13,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.02em',
          }}>Code Nexus</span>
        </footer>
      </body>
    </html>
  )
}
