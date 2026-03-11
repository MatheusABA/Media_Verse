// src/routes/auth.routes.ts
import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { registerUser, loginUser, createRefreshToken, rotateRefreshToken, revokeRefreshToken } from "../services/auth.services"

const ACCESS_TOKEN_EXP = 60 * 15 // 15 minutos

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))

  .post("/register", async ({ body, set }) => {
    try {
      const user = await registerUser(body)
      return { user }
    } catch (e: any) {
      const code = e.code || e.cause?.code
      const message = e.message || e.cause?.message
      if (code === "23505" || message?.includes("duplicate key") || message?.includes("already exists")) {
        set.status = 409
        return { error: "Email ou username já cadastrado" }
      }
      throw e
    }
  }, {
    body: t.Object({
      username: t.String({ minLength: 3 }),
      email: t.String({ format: "email" }),
      password: t.String({ minLength: 6 }),
    })
  })

  .post("/login", async ({ body, jwt, set }) => {
    const user = await loginUser(body)
    if (!user) {
      set.status = 401
      return { error: "Credenciais inválidas" }
    }

    const accessToken = await jwt.sign({
      sub: user.id,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP,
    })
    const refreshToken = await createRefreshToken(user.id)

    return { accessToken, refreshToken, user }
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String(),
    })
  })
  .post("/refresh", async ({ body, jwt, set }) => {
    const result = await rotateRefreshToken(body.refreshToken)
    if (!result) {
      set.status = 401
      return { error: "Refresh token inválido ou expirado" }
    }

    const accessToken = await jwt.sign({
      sub: result.userId,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXP,
    })

    return { accessToken, refreshToken: result.newRefreshToken }
  }, {
    body: t.Object({ refreshToken: t.String() })
  })

  .post("/logout", async ({ body }) => {
    await revokeRefreshToken(body.refreshToken)
    return { success: true }
  }, {
    body: t.Object({ refreshToken: t.String() })
  })