import { NextRequest, NextResponse } from 'next/server'
import { createAdminSession, SESSION_COOKIE } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const adminPassword = process.env.ADMIN_PASSWORD
    if (
      process.env.NODE_ENV === 'production' &&
      (!adminPassword || !process.env.ADMIN_SESSION_SECRET)
    ) {
      console.error('ADMIN_PASSWORD and ADMIN_SESSION_SECRET must be configured in production')
      return NextResponse.json(
        { error: 'Authentication is not configured' },
        { status: 503 }
      )
    }

    if (typeof password !== 'string' || password !== (adminPassword || 'admin')) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({ success: true })
    const session = createAdminSession()
    response.cookies.set(SESSION_COOKIE, session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: session.maxAge,
      path: '/',
    })

    return response
  } catch {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
