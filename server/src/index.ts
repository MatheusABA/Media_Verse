// import { Elysia } from "elysia";
// import { authRoutes } from "./routes/auth.routes";
// import { userRoutes } from "./routes/user.routes";
// import cors from "@elysiajs/cors";
// import staticPlugin from "@elysiajs/static";
// import { uploadRoutes } from "./routes/upload.routes";
// import { userMediaRoutes } from "./routes/user_media.routes";
// import { userFavoriteRoutes } from "./routes/user_favorite.routes";
// import { reviewRoutes } from "./routes/review.routes";
// import { userTopMediaRoutes } from "./routes/user_top_media.routes";
// import { listRoutes } from "./routes/list.routes";
// import { discoverRoutes } from "./routes/discover.routes";
// import openapi from "@elysiajs/openapi";
// import { loggerPlugin } from "./plugins/logger.plugin";

// const app = new Elysia()
//   .use(cors({
//     origin: "*",
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//   }))
//   // Static files (uploads)
//   .use(staticPlugin({
//     prefix: "/uploads",
//     assets: "./uploads",
//   }))
//   // OpenAPI Documentation
//   .use(openapi({
//     documentation: {
//       tags: [
//         { name: "Auth", description: "Endpoints de autenticação" },
//         { name: "User", description: "Endpoints relacionados a usuários" },
//         { name: "Upload", description: "Endpoints para upload de arquivos" },
//         { name: "User Media", description: "Endpoints para gerenciamento de mídia do usuário" },
//         { name: "User Favorite", description: "Endpoints para gerenciamento de favoritos do usuário" },
//         { name: "Review", description: "Endpoints para gerenciamento de reviews" },
//         { name: "User Top Media", description: "Endpoints para gerenciamento de top mídia do usuário" },
//         { name: "List", description: "Endpoints para gerenciamento de listas personalizadas" },
//         { name: "Discover", description: "Endpoints para descoberta de conteúdo e interações sociais" },
//       ]
//     }
//   }))
//   .use(loggerPlugin)  // Personalized logging plugin to log requests and responses
//   // Routes
//   .use(authRoutes)
//   .use(userRoutes)
//   .use(uploadRoutes)
//   .use(userMediaRoutes)
//   .use(userFavoriteRoutes)
//   .use(reviewRoutes)
//   .use(userTopMediaRoutes)
//   .use(listRoutes)
//   .use(discoverRoutes)
//   .listen({ port: process.env.PORT, hostname: process.env.ENV === "production" ? "0.0.0.0" : "localhost" });

// console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}.`);

import { Elysia } from "elysia";
import { authRoutes } from "./routes/auth.routes";
import { userRoutes } from "./routes/user.routes";
import cors from "@elysiajs/cors";
// import staticPlugin from "@elysiajs/static"; ← still remove this
import { uploadRoutes } from "./routes/upload.routes";
import { userMediaRoutes } from "./routes/user_media.routes";
import { userFavoriteRoutes } from "./routes/user_favorite.routes";
import { reviewRoutes } from "./routes/review.routes";
import { userTopMediaRoutes } from "./routes/user_top_media.routes";
import { listRoutes } from "./routes/list.routes";
import { discoverRoutes } from "./routes/discover.routes";
import openapi from "@elysiajs/openapi";
import { loggerPlugin } from "./plugins/logger.plugin";

// ✅ Don't create the app at global scope — create it lazily
let app: Elysia | null = null;

function createApp() {
  return new Elysia()
    .use(cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
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
    .use(loggerPlugin)
    .use(authRoutes)
    .use(userRoutes)
    .use(uploadRoutes)
    .use(userMediaRoutes)
    .use(userFavoriteRoutes)
    .use(reviewRoutes)
    .use(userTopMediaRoutes)
    .use(listRoutes)
    .use(discoverRoutes);
}

// ✅ Export Workers handler — app is created inside fetch, not at global scope
export default {
  fetch(request: Request, env: Record<string, string>) {
    // Inject Workers env into process.env BEFORE creating the app
    // This way @elysiajs/jwt can read JWT_SECRET from process.env
    Object.assign(process.env, env);

    // Lazy-init: only create app once, then cache it
    if (!app) {
      app = createApp();
    }

    return app.fetch(request);
  }
};
