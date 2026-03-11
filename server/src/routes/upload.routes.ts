import { Elysia, t } from "elysia";
import { db } from "../db/db";
import { users } from "../db/schema/users";
import { eq } from "drizzle-orm";
import { authPlugin } from "../plugins/auth.plugin";
import { saveImage } from "../services/upload.services";

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  .use(authPlugin)
  .post(
    "/avatar",
    async ({ body, userId }) => {
      // Apagar foto antiga primeiro
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      const oldAvatarUrl = user?.avatarUrl;
      if (oldAvatarUrl) {
        const fs = await import("fs/promises");
        const path = await import("path");
        const avatarPath = path.join(
          process.cwd(),
          oldAvatarUrl.startsWith("/") ? oldAvatarUrl.slice(1) : oldAvatarUrl,
        );
        try {
          await fs.unlink(avatarPath);
        } catch (e) {
          console.error("Erro ao apagar avatar antigo:", e);
        }
      }

      const avatarUrl = await saveImage(body.file, "avatar", userId);
      await db.update(users).set({ avatarUrl }).where(eq(users.id, userId));
      return { avatarUrl };
    },
    {
      body: t.Object({
        file: t.File({
          type: "image",
          maxSize: 5 * 1024 * 1024,
        }),
      }),
    },
  )
  .post(
    "/banner",
    async ({ body, userId }) => {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      const oldBannerUrl = user?.bannerUrl;

      if (oldBannerUrl) {
        const fs = await import("fs/promises");
        const path = await import("path");
        const avatarPath = path.join(
          process.cwd(),
          oldBannerUrl.startsWith("/") ? oldBannerUrl.slice(1) : oldBannerUrl,
        );
        try {
          await fs.unlink(avatarPath);
        } catch (e) {
          console.error("Erro ao apagar avatar antigo:", e);
        }
      }
      const bannerUrl = await saveImage(body.file, "banner", userId);
      await db.update(users).set({ bannerUrl }).where(eq(users.id, userId));
      return { bannerUrl };
    },
    {
      body: t.Object({
        file: t.File({
          type: "image",
          maxSize: 8 * 1024 * 1024,
        }),
      }),
    },
  );
