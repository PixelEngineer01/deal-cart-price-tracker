'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0b0f19',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 20,
          padding: 48,
          textAlign: 'center',
          maxWidth: 440,
          width: '100%',
        }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', color: '#f1f5f9', fontSize: 24, marginBottom: 12 }}>
            You&apos;re almost in!
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
            Check your email at <strong style={{ color: '#22d3ee' }}>{email}</strong> and click the confirmation link.
          </p>
          <Link href="/login" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
            color: '#fff',
            textDecoration: 'none',
            padding: '12px 32px',
            borderRadius: 10,
            fontWeight: 600,
          }}>Go to Login</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0f19',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 600,
        height: 400,
        background: 'radial-gradient(ellipse, rgba(34,211,238,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>🛒</div>
            <span style={{
              fontFamily: 'Outfit, sans-serif', fontSize: 26, fontWeight: 700,
              background: 'linear-gradient(135deg, #4f46e5, #22d3ee)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>DealCart</span>
          </Link>
          <p style={{ color: '#64748b', marginTop: 8, fontSize: 14 }}>Create your free account.</p>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: 36,
        }}>
          <form onSubmit={handleSignup}>
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10,
                padding: '12px 16px',
                marginBottom: 20,
                color: '#ef4444',
                fontSize: 14,
              }}>⚠️ {error}</div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                style={{
                  width: '100%', background: '#1e2433',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '12px 16px',
                  color: '#f1f5f9', fontSize: 15, outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
                minLength={6}
                style={{
                  width: '100%', background: '#1e2433',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10, padding: '12px 16px',
                  color: '#f1f5f9', fontSize: 15, outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => e.target.style.borderColor = '#22d3ee'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />

              {/* Password strength */}
              {password.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', gap: 4 }}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: password.length >= i * 4
                        ? i === 3 ? '#22c55e' : i === 2 ? '#f59e0b' : '#ef4444'
                        : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 28 }}>
              <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
                {password.length < 6 ? `${6 - password.length} more characters needed` :
                  password.length < 10 ? '🟡 Fair password' : '🟢 Strong password'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(79,70,229,0.5)' : 'linear-gradient(135deg, #4f46e5, #22d3ee)',
                border: 'none', borderRadius: 10, padding: '14px',
                color: '#fff', fontSize: 15, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '🔄 Creating account...' : '🚀 Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#64748b', fontSize: 14 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#22d3ee', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
