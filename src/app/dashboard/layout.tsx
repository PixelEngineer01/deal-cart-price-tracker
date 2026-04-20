import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/navbar'
import DashboardSidebar from '@/components/layout/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div style={{ background: '#0b0f19', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', paddingTop: 64, flex: 1 }}>
        <DashboardSidebar />
        <main style={{ flex: 1, minWidth: 0, padding: '32px 24px', maxWidth: '100%' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
