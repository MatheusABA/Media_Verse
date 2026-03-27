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
import openapi from "@elysiajs/openapi";

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
  .use(openapi({
    documentation: {
      tags: [
        { name: "Auth", description: "Endpoints de autenticação" },
        { name: "User", description: "Endpoints relacionados a usuários" },
        { name: "Upload", description: "Endpoints para upload de arquivos" },
        { name: "User Media", description: "Endpoints para gerenciamento de mídia do usuário" },
        { name: "User Favorite", description: "Endpoints para gerenciamento de favoritos do usuário" },
        { name: "Review", description: "Endpoints para gerenciamento de reviews" },
        { name: "User Top Media", description: "Endpoints para gerenciamento de top mídia do usuário" },
        { name: "List", description: "Endpoints para gerenciamento de listas personalizadas" },
        { name: "Discover", description: "Endpoints para descoberta de conteúdo e interações sociais" },
      ]
    }
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
