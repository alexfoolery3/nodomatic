CREATE TABLE "monitoring_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prospect_id" uuid NOT NULL,
	"performance_score" integer,
	"seo_score" integer,
	"accessibility_score" integer,
	"best_practices_score" integer,
	"load_time_ms" integer,
	"has_https" boolean,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prospects" ADD COLUMN "monitored" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "monitoring_snapshots" ADD CONSTRAINT "monitoring_snapshots_prospect_id_prospects_id_fk" FOREIGN KEY ("prospect_id") REFERENCES "public"."prospects"("id") ON DELETE cascade ON UPDATE no action;