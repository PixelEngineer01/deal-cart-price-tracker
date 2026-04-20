import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, min_price, max_price, notification_type = 'email' } = body

    if (!product_id || min_price === undefined || max_price === undefined) {
      return NextResponse.json(
        { error: 'product_id, min_price, and max_price are required' },
        { status: 400 }
      )
    }

    if (min_price >= max_price) {
      return NextResponse.json(
        { error: 'min_price must be less than max_price' },
        { status: 400 }
      )
    }

    // Verify product belongs to user
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('id', product_id)
      .eq('user_id', user.id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if alert exists
    const { data: existingAlert } = await supabase
      .from('alerts')
      .select('id')
      .eq('product_id', product_id)
      .eq('user_id', user.id)
      .maybeSingle()

    let alert, alertError;

    if (existingAlert) {
      // Update existing alert
      const updateRes = await supabase
        .from('alerts')
        .update({
          min_price: parseFloat(min_price),
          max_price: parseFloat(max_price),
          notification_type,
          alert_sent: false,
        })
        .eq('id', existingAlert.id)
        .select()
        .single()
      alert = updateRes.data;
      alertError = updateRes.error;
    } else {
      // Insert new alert
      const insertRes = await supabase
        .from('alerts')
        .insert({
          product_id,
          user_id: user.id,
          min_price: parseFloat(min_price),
          max_price: parseFloat(max_price),
          notification_type,
          alert_sent: false,
        })
        .select()
        .single()
      alert = insertRes.data;
      alertError = insertRes.error;
    }

    if (alertError) {
      return NextResponse.json({ error: alertError.message }, { status: 500 })
    }

    return NextResponse.json({ alert }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to set alert' }, { status: 500 })
  }
}
