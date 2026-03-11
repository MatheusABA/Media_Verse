import { Elysia } from "elysia";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import cors from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";
import { uploadRoutes } from "./routes/upload.routes";

const app = new Elysia()
  .use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }))
  .use(staticPlugin({
    prefix: "/uploads",
    assets: "./uploads",
  }))
  .use(authRoutes)
  .use(userRoutes)
  .use(uploadRoutes)
  .listen(3333);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
