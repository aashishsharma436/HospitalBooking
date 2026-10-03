-- Platform control-plane schema for Super Admin tenant onboarding.
-- Keep this separate from the core SaaS "tenants" table created by V1.
-- The control-plane record represents an onboarding request; provisioning
-- can later create/link the real tenant and hospital records.

CREATE TABLE IF NOT EXISTS platform_users (
 id uuid PRIMARY KEY,
 email varchar(255) NOT NULL UNIQUE,
 password_hash varchar(255) NOT NULL,
 role varchar(50) NOT NULL,
 active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS platform_tenants (
 id uuid PRIMARY KEY,
 hospital_name varchar(255) NOT NULL,
 hospital_code varchar(100) NOT NULL UNIQUE,
 email varchar(255) NOT NULL,
 phone varchar(50),
 city varchar(120),
 status varchar(50) NOT NULL,
 onboarding_status varchar(50) NOT NULL,
 created_at timestamp with time zone NOT NULL,
 approved_at timestamp with time zone
);

CREATE INDEX IF NOT EXISTS idx_platform_tenants_status ON platform_tenants(status);
CREATE INDEX IF NOT EXISTS idx_platform_tenants_onboarding_status ON platform_tenants(onboarding_status);