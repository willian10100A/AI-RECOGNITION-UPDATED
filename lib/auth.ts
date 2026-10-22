import { createHmac, timingSafeEqual } from 'node:crypto'

const SESSION_COOKIE = 'admin_session'
const SESSION_TTL_SECONDS = 60 * 60 * 8

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    (process.env.NODE_ENV !== 'production'
      ? 'development-only-session-secret-change-me'
      : '')

  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET must be set in production')
  }

  return secret
}

function signSession(expiresAt: string) {
  return createHmac('sha256', getSessionSecret())
    .update(expiresAt)
    .digest('base64url')
}

export function createAdminSession() {
  const expiresAt = String(Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS)
  return { token: `${expiresAt}.${signSession(expiresAt)}`, maxAge: SESSION_TTL_SECONDS }
}

export function isValidAdminSession(token?: string) {
  if (!token) return false

  const [expiresAt, signature, extra] = token.split('.')
  if (!expiresAt || !signature || extra || !/^\d+$/.test(expiresAt)) return false
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false

  try {
    const expected = Buffer.from(signSession(expiresAt))
    const actual = Buffer.from(signature)
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

export { SESSION_COOKIE }
