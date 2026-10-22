import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { initializeDatabase, sql } from '@/lib/db'
import { isValidAdminSession, SESSION_COOKIE } from '@/lib/auth'

async function isAuthenticated() {
  const cookieStore = await cookies()
  return isValidAdminSession(cookieStore.get(SESSION_COOKIE)?.value)
}

export async function GET() {
  try {
    await initializeDatabase()
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const persons = await sql`
      SELECT id, name, photo_base64, face_descriptor,
             email, phone, address, date_of_birth, notes, created_at, updated_at
      FROM persons
      ORDER BY name ASC
    `
    const result = Array.isArray(persons) ? persons : Object.values(persons || {})
    const mapped = result.map((row: any) => ({
      ...row,
      face_descriptor: row.face_descriptor ? JSON.parse(row.face_descriptor) : null,
    }))
    return NextResponse.json(mapped)
  } catch (error) {
    console.error('Failed to fetch persons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch persons' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabase()
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, address, date_of_birth, notes, photo_base64, face_descriptor } = body

    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const descriptorJson = face_descriptor
      ? JSON.stringify(face_descriptor)
      : null

    const rows = await sql`
      INSERT INTO persons (name, email, phone, address, date_of_birth, notes, photo_base64, face_descriptor)
      VALUES (${name.trim()}, ${email || null}, ${phone || null}, ${address || null}, ${date_of_birth || null}, ${notes || null}, ${photo_base64 || null}, ${descriptorJson})
      RETURNING *
    `

    const person = {
      ...rows[0],
      face_descriptor: rows[0].face_descriptor
        ? JSON.parse(rows[0].face_descriptor)
        : null,
    }

    return NextResponse.json(person, { status: 201 })
  } catch (error) {
    console.error('Failed to create person:', error)
    return NextResponse.json(
      { error: 'Failed to create person' },
      { status: 500 }
    )
  }
}
