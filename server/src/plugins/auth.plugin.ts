import { Elysia } from "elysia"
import { jwt } from "@elysiajs/jwt"

export const authPlugin = new Elysia({ name: "auth-plugin" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .derive(async ({ jwt, headers, set }) => {
    const authorization = headers["authorization"]
    const token = authorization?.startsWith("Bearer ")
      ? authorization.slice(7)
      : null

    if (!token) {
      set.status = 401
      throw new Error("Token não fornecido")
    }

    const payload = await jwt.verify(token)
    if (!payload) {
      set.status = 401
      throw new Error("Token inválido")
    }

    return { userId: payload.sub as string }
  })