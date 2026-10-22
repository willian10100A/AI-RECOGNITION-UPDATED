import { AppNav } from '@/components/app-nav'
import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <LoginForm />
    </div>
  )
}
