import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isValidAdminSession, SESSION_COOKIE } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)

  if (isValidAdminSession(session?.value)) {
    return NextResponse.json({ authenticated: true })
  }

  return NextResponse.json({ authenticated: false }, { status: 401 })
}
