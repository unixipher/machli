CREATE TABLE "OTP" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar NOT NULL,
	"otp" varchar NOT NULL,
	"verified" varchar DEFAULT 'false' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
