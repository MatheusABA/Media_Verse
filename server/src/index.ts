import { Elysia } from "elysia";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }))
  .use(authRoutes)
  .use(userRoutes)
  .listen(3333);

// console.log("Server settings", JSON.stringify(app, null, 2));
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
