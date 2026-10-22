'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data, isLoading } = useSWR('/api/auth/check', fetcher)

  useEffect(() => {
    if (!isLoading && !data?.authenticated) {
      router.replace('/login')
    }
  }, [data?.authenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (!data?.authenticated) {
    return (
      <div className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 ring-1 ring-destructive/20">
            <ShieldAlert className="h-7 w-7 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Authentication Required
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Redirecting to login…
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
