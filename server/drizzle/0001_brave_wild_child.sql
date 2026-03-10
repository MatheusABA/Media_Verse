CREATE TYPE "public"."user_media_status" AS ENUM('plan_to_watch', 'watching', 'watched', 'dropped');--> statement-breakpoint
CREATE TYPE "public"."list_visibility" AS ENUM('public', 'private');--> statement-breakpoint
ALTER TABLE "media" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_media" ALTER COLUMN "status" SET DATA TYPE "public"."user_media_status" USING "status"::"public"."user_media_status";--> statement-breakpoint
ALTER TABLE "user_media" ALTER COLUMN "rating" SET DATA TYPE numeric(3, 1);--> statement-breakpoint
ALTER TABLE "user_media" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "reviews" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lists" ALTER COLUMN "visibility" SET DEFAULT 'public'::"public"."list_visibility";--> statement-breakpoint
ALTER TABLE "lists" ALTER COLUMN "visibility" SET DATA TYPE "public"."list_visibility" USING "visibility"::"public"."list_visibility";--> statement-breakpoint
ALTER TABLE "lists" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "follows" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "list_items" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "user_media_user_id_idx" ON "user_media" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_media_media_id_idx" ON "user_media" USING btree ("media_id");--> statement-breakpoint
CREATE INDEX "reviews_user_media_id_idx" ON "reviews" USING btree ("user_media_id");--> statement-breakpoint
CREATE INDEX "lists_user_id_idx" ON "lists" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "list_items_unique" ON "list_items" USING btree ("list_id","media_id");--> statement-breakpoint
CREATE INDEX "list_items_list_id_idx" ON "list_items" USING btree ("list_id");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_unique" ON "follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "follows_follower_id_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_id_idx" ON "follows" USING btree ("following_id");