CREATE TABLE "lectures" (
	"id" serial PRIMARY KEY NOT NULL,
	"term" varchar(16) NOT NULL,
	"day_of_week" varchar(8) NOT NULL,
	"period" varchar(8) NOT NULL,
	"classroom" varchar(32),
	"classroom_capacity" smallint,
	"target_common" varchar(16),
	"target_intl_studies" varchar(16),
	"target_intl_culture" varchar(16),
	"target_intl_tourism" varchar(16),
	"target_sports_health" varchar(16),
	"target_nursing" varchar(16),
	"target_health_info" varchar(16),
	"is_remote_class" varchar(8),
	"subject_name" varchar(64) NOT NULL,
	"class_name" varchar(32),
	"credits" integer,
	"concurrent_slots" varchar(32),
	"is_part_time_lecturer" varchar(8),
	"instructor_name" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "user_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"lecture_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_schedules" ADD CONSTRAINT "user_schedules_lecture_id_lectures_id_fk" FOREIGN KEY ("lecture_id") REFERENCES "public"."lectures"("id") ON DELETE no action ON UPDATE no action;