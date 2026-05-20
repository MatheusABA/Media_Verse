import { Elysia } from "elysia"
import { rateLimit } from "elysia-rate-limit"

const DURATION = 60_000

const ipGenerator = (req: Request, server: any) => {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    server?.requestIP(req)?.address ??
    "unknown"
  )
}

export const publicRateLimit = new Elysia({ name: "public-rate-limit" })
  .use(
    rateLimit({
      duration: DURATION,
      max: 30,
      generator: (req, server) => ipGenerator(req, server),
      errorResponse: new Response(
        JSON.stringify({ error: "Too many requests" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      ),
    })
  )

export const authRateLimit = new Elysia({ name: "auth-rate-limit" })
  .use(
    rateLimit({
      duration: DURATION,
      max: 100,
      generator: (req, server, context: any) => {
        return context?.userId ?? ipGenerator(req, server)
      },
      errorResponse: new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      ),
    })
  )