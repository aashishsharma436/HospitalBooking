CREATE TABLE IF NOT EXISTS platform_users (
 id uuid PRIMARY KEY,
 email varchar(255) NOT NULL UNIQUE,
 password_hash varchar(255) NOT NULL,
 role varchar(50) NOT NULL,
 active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS tenants (
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

CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_onboarding_status ON tenants(onboarding_status);