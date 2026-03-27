import { Elysia } from "elysia";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import cors from "@elysiajs/cors";
import staticPlugin from "@elysiajs/static";
import { uploadRoutes } from "./routes/upload.routes";
import { userMediaRoutes } from "./routes/user_media.routes";
import { userFavoriteRoutes } from "./routes/user_favorite.routes";
import { reviewRoutes } from "./routes/review.routes";
import { userTopMediaRoutes } from "./routes/user_top_media.routes";
import { listRoutes } from "./routes/list.routes";
import { discoverRoutes } from "./routes/discover.routes";

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
  .use(userMediaRoutes)
  .use(userFavoriteRoutes)
  .use(reviewRoutes)
  .use(userTopMediaRoutes)
  .use(listRoutes)
  .use(discoverRoutes)
  .listen(3333);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
