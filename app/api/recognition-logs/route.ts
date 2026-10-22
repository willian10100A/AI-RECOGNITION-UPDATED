import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { initializeDatabase, sql } from '@/lib/db'
import { isValidAdminSession, SESSION_COOKIE } from '@/lib/auth'

async function isAuthenticated() {
  const cookieStore = await cookies()
  return isValidAdminSession(cookieStore.get(SESSION_COOKIE)?.value)
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { person_id, confidence } = await request.json()

    if (!Number.isInteger(person_id) || person_id <= 0) {
      return NextResponse.json(
        { error: 'A valid person_id is required' },
        { status: 400 }
      )
    }
    if (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      return NextResponse.json({ error: 'confidence must be between 0 and 1' }, { status: 400 })
    }

    await sql`
      INSERT INTO recognition_logs (person_id, confidence)
      VALUES (${person_id}, ${confidence})
    `

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Failed to log recognition:', error)
    return NextResponse.json(
      { error: 'Failed to log recognition' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await initializeDatabase()
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rows = await sql`
      SELECT rl.*, p.name as person_name
      FROM recognition_logs rl
      JOIN persons p ON p.id = rl.person_id
      ORDER BY rl.recognized_at DESC
      LIMIT 50
    `
    const result = Array.isArray(rows) ? rows : Object.values(rows || {})
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
