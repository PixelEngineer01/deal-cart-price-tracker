import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        alerts(id, min_price, max_price, alert_sent, notification_type),
        price_history(price, checked_at)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
