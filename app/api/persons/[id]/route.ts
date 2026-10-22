import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { initializeDatabase, sql } from '@/lib/db'
import { isValidAdminSession, SESSION_COOKIE } from '@/lib/auth'

async function isAuthenticated() {
  const cookieStore = await cookies()
  return isValidAdminSession(cookieStore.get(SESSION_COOKIE)?.value)
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase()
    if (!await isAuthenticated()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const personId = Number(id)
    if (!Number.isInteger(personId) || personId <= 0) {
      return NextResponse.json({ error: 'Invalid person id' }, { status: 400 })
    }
    const rows = await sql`SELECT * FROM persons WHERE id = ${personId}`

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    const person = {
      ...rows[0],
      face_descriptor: rows[0].face_descriptor
        ? JSON.parse(rows[0].face_descriptor)
        : null,
    }

    return NextResponse.json(person)
  } catch (error) {
    console.error('Failed to fetch person:', error)
    return NextResponse.json(
      { error: 'Failed to fetch person' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase()
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const personId = Number(id)
    if (!Number.isInteger(personId) || personId <= 0) {
      return NextResponse.json({ error: 'Invalid person id' }, { status: 400 })
    }
    const body = await request.json()
    const { name, email, phone, address, date_of_birth, notes, photo_base64, face_descriptor } = body

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    const descriptorJson = face_descriptor
      ? JSON.stringify(face_descriptor)
      : null

    const rows = await sql`
      UPDATE persons
      SET name = ${name.trim()},
          email = ${email || null},
          phone = ${phone || null},
          address = ${address || null},
          date_of_birth = ${date_of_birth || null},
          notes = ${notes || null},
          photo_base64 = ${photo_base64 || null},
          face_descriptor = ${descriptorJson},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${personId}
      RETURNING *
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    const person = {
      ...rows[0],
      face_descriptor: rows[0].face_descriptor
        ? JSON.parse(rows[0].face_descriptor)
        : null,
    }

    return NextResponse.json(person)
  } catch (error) {
    console.error('Failed to update person:', error)
    return NextResponse.json(
      { error: 'Failed to update person' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initializeDatabase()
    if (!(await isAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const personId = Number(id)
    if (!Number.isInteger(personId) || personId <= 0) {
      return NextResponse.json({ error: 'Invalid person id' }, { status: 400 })
    }
    const rows = await sql`
      DELETE FROM persons WHERE id = ${personId} RETURNING id
    `

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Person not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete person:', error)
    return NextResponse.json(
      { error: 'Failed to delete person' },
      { status: 500 }
    )
  }
}
