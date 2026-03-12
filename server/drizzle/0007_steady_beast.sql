CREATE TABLE "user_top_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"media_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"position" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_top_media" ADD CONSTRAINT "user_top_media_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_top_media" ADD CONSTRAINT "user_top_media_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_top_media_position_unique" ON "user_top_media" USING btree ("user_id","type","position");--> statement-breakpoint
CREATE UNIQUE INDEX "user_top_media_media_unique" ON "user_top_media" USING btree ("user_id","media_id");