import { Elysia } from "elysia"

export const loggerPlugin = new Elysia({ name: "logger-plugin" })
  .onRequest(({ request, server }) => {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      server?.requestIP(request)?.address ??
      "unknown"

    const method = request.method
    const url = new URL(request.url)
    const path = url.pathname

    console.log(`→ [${new Date().toISOString()}] ${method} ${path} | ip: ${ip}`)
  })
  .onAfterResponse({ as: "global" }, ({ request, response }) => {
    const method = request.method
    const url = new URL(request.url)
    const path = url.pathname
    const status = response instanceof Response ? response.status : 200

    console.log(`← [${new Date().toISOString()}] ${method} ${path} | status: ${status}`)
  })