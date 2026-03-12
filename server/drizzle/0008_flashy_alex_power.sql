ALTER TABLE "reviews" DROP CONSTRAINT "reviews_user_media_id_user_media_id_fk";
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_media_id_user_media_id_fk" FOREIGN KEY ("user_media_id") REFERENCES "public"."user_media"("id") ON DELETE cascade ON UPDATE no action;