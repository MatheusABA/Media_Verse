// src/routes/auth.routes.ts
import { Elysia, t } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { registerUser, loginUser } from "../services/auth.services"

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(jwt({ name: "jwt", secret: process.env.JWT_SECRET! }))
  .post("/register", async ({ body, set }) => {
    try {
      const user = await registerUser(body)
      return { user }
    } catch (e: any) {
      const code = e.code || e.cause?.code
      const message = e.message || e.cause?.message

      if (
        code === "23505" ||
        (message && message.includes("duplicate key")) ||
        (message && message.includes("already exists"))
      ) {
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

    const token = await jwt.sign({ sub: user.id, username: user.username })
    return { token, user }
  }, {
    body: t.Object({
      email: t.String({ format: "email" }),
      password: t.String(),
    })
  })