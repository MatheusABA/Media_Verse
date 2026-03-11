import { db } from "../db/db"
import { users, refreshTokens } from "../db/schema"
import { eq, and, gt } from "drizzle-orm"

function hashToken(token: string): string {
  const hasher = new Bun.CryptoHasher("sha256")
  hasher.update(token)
  return hasher.digest("hex")
}

function generateOpaqueToken(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("hex")
}

export async function registerUser(data: {
  username: string
  email: string
  password: string
}) {
  const passwordHash = await Bun.password.hash(data.password)
  const [user] = await db.insert(users).values({
    username: data.username,
    email: data.email,
    passwordHash,
  }).returning({ id: users.id, username: users.username, email: users.email })
  return user
}

export async function loginUser(data: { email: string; password: string }) {
  const user = await db.query.users.findFirst({ where: eq(users.email, data.email) })
  if (!user) return null
  const valid = await Bun.password.verify(data.password, user.passwordHash)
  if (!valid) return null
  return { id: user.id, username: user.username, email: user.email }
}

export async function createRefreshToken(userId: string): Promise<string> {
  const token = generateOpaqueToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 dias

  await db.insert(refreshTokens).values({ userId, tokenHash, expiresAt })
  return token
}

export async function rotateRefreshToken(token: string): Promise<{
  userId: string
  newRefreshToken: string
} | null> {
  const tokenHash = hashToken(token)

  const existing = await db.query.refreshTokens.findFirst({
    where: and(
      eq(refreshTokens.tokenHash, tokenHash),
      gt(refreshTokens.expiresAt, new Date())
    ),
  })

  if (!existing) return null

  // Refresh: apaga o antigo e cria um novo
  await db.delete(refreshTokens).where(eq(refreshTokens.id, existing.id))
  const newRefreshToken = await createRefreshToken(existing.userId)

  return { userId: existing.userId, newRefreshToken }
}

// Logout: invalida o refresh token
export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token)
  await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash))
}