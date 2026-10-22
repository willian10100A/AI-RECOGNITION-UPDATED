'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Camera, Users, Shield, LogOut, ScanFace } from 'lucide-react'
import { cn } from '@/lib/utils'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function AppNav() {
  const pathname = usePathname()
  const { data: authData } = useSWR('/api/auth/check', fetcher)
  const isAuthenticated = authData?.authenticated

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/'
  }

  const navItems = [
    { href: '/', label: 'Live Recognition', icon: Camera },
    { href: '/manage', label: 'Manage Persons', icon: Users },
  ]

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <ScanFace className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            ForeSight
          </span>
        </Link>

        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Shield className="h-4 w-4" />
            Admin Login
          </Link>
        )}
      </div>
    </header>
  )
}
