import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createServiceClient()
  const out: any = {}
  
  const { data: users, error: err1 } = await supabase.auth.admin.listUsers()
  out.usersCount = users?.users?.length
  out.authError = err1
  
  const { data: profiles, error: err2 } = await supabase.from('profiles').select('*')
  out.profilesCount = profiles?.length
  out.profilesError = err2
  
  if (users?.users?.length && profiles?.length === 0) {
    out.issue = 'Users exist but NO profiles exist! The signup trigger failed or was not applied.'
  }

  return NextResponse.json(out)
}
