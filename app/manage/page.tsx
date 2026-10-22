import { AppNav } from '@/components/app-nav'
import { AuthGuard } from '@/components/auth-guard'
import { ManageDashboard } from '@/components/manage-dashboard'

export default function ManagePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <AuthGuard>
        <ManageDashboard />
      </AuthGuard>
    </div>
  )
}
