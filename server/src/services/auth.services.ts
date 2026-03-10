import { db } from "../db/db"
import { users } from "../db/schema"
import { eq } from "drizzle-orm"

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
  }).returning({
    id: users.id,
    username: users.username,
    email: users.email,
  })

  return user
}

export async function loginUser(data: {
  email: string
  password: string
}) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  })

  if (!user) return null

  const valid = await Bun.password.verify(data.password, user.passwordHash)
  if (!valid) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
  }
}