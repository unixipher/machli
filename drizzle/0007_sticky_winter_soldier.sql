ALTER TABLE "DriverManager" ADD COLUMN "address" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "DriverManager" ADD COLUMN "geoLat" real NOT NULL;--> statement-breakpoint
ALTER TABLE "DriverManager" ADD COLUMN "geoLng" real NOT NULL;--> statement-breakpoint
ALTER TABLE "HubManager" ADD COLUMN "address" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "HubManager" ADD COLUMN "geoLat" real NOT NULL;--> statement-breakpoint
ALTER TABLE "HubManager" ADD COLUMN "geoLng" real NOT NULL;