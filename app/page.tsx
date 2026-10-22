import { AppNav } from '@/components/app-nav'
import { AuthGuard } from '@/components/auth-guard'
import { LiveRecognition } from '@/components/live-recognition'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <AuthGuard>
        <LiveRecognition />
      </AuthGuard>
    </div>
  )
}
