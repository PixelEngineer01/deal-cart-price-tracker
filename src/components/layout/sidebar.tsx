'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/dashboard/add', icon: '➕', label: 'Add Product' },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        width: 220,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        padding: '24px 12px',
        flexShrink: 0,
        display: 'none',
        alignSelf: 'flex-start',
        position: 'sticky',
        top: 64,
        maxHeight: 'calc(100vh - 64px)',
        overflowY: 'auto',
      }}
        id="dashboard-sidebar"
        className="lg-sidebar"
      >
        <p style={{ color: '#374151', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0 12px', marginBottom: 8 }}>
          Navigation
        </p>
        {navItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                marginBottom: 4,
                textDecoration: 'none',
                color: isActive ? '#f1f5f9' : '#64748b',
                background: isActive ? 'rgba(79,70,229,0.15)' : 'transparent',
                borderLeft: isActive ? '3px solid #4f46e5' : '3px solid transparent',
                fontSize: 14,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        <div style={{ marginTop: 24, padding: '0 12px' }}>
          <div style={{
            background: 'rgba(79,70,229,0.1)',
            border: '1px solid rgba(79,70,229,0.2)',
            borderRadius: 12,
            padding: 16,
          }}>
            <p style={{ color: '#a5b4fc', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>💡 Price Check</p>
            <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
              Manually trigger a price update for all your products.
            </p>
            <button
              id="trigger-price-check"
              onClick={async () => {
                const res = await fetch('/api/check-prices')
                const data = await res.json()
                alert(`Updated ${data.updated || 0} products. Alerts sent: ${data.alerts_sent || 0}`)
              }}
              style={{
                width: '100%',
                background: 'rgba(79,70,229,0.3)',
                border: '1px solid rgba(79,70,229,0.4)',
                color: '#a5b4fc',
                padding: '8px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🔄 Check Now
            </button>
          </div>
        </div>
      </aside>
      <style>{`
        @media (min-width: 900px) {
          #dashboard-sidebar { display: block !important; }
        }
      `}</style>
    </>
  )
}
