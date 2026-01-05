ALTER TYPE "public"."OrderStatus" ADD VALUE 'in_source' BEFORE 'delivered';--> statement-breakpoint
ALTER TYPE "public"."OrderStatus" ADD VALUE 'in_hub' BEFORE 'delivered';