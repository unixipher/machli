ALTER TABLE "DriverManager" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."DriverManagerCategory";--> statement-breakpoint
CREATE TYPE "public"."DriverManagerCategory" AS ENUM('main', 'intermediate');--> statement-breakpoint
ALTER TABLE "DriverManager" ALTER COLUMN "category" SET DATA TYPE "public"."DriverManagerCategory" USING "category"::"public"."DriverManagerCategory";