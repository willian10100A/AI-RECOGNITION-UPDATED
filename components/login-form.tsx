'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export function LoginForm() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      })

      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast.success('Login successful')
        router.push('/manage')
        router.refresh()
      } else {
        toast.error(data.error || 'Invalid password')
        setPassword('')
      }
    } catch {
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 pb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground">
              Admin Access
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the admin password to manage persons
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className="w-full rounded-lg border border-border bg-secondary px-4 py-3 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !password.trim()}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Shield className="h-4 w-4" />
            )}
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
