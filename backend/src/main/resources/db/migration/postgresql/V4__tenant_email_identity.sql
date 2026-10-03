ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS tenant_slug varchar(80);
ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS tenant_domain varchar(255);
ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS admin_email varchar(255);
ALTER TABLE platform_tenants ADD COLUMN IF NOT EXISTS admin_user_id uuid;
CREATE UNIQUE INDEX IF NOT EXISTS uq_platform_tenants_slug ON platform_tenants(tenant_slug);
CREATE UNIQUE INDEX IF NOT EXISTS uq_platform_tenants_domain ON platform_tenants(tenant_domain);

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS tenant_domain varchar(255);
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS tenant_slug varchar(80);
CREATE UNIQUE INDEX IF NOT EXISTS uq_tenants_domain ON tenants(tenant_domain);

CREATE TABLE IF NOT EXISTS email_accounts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 hospital_id uuid NOT NULL,
 user_id uuid NOT NULL,
 local_part varchar(120) NOT NULL,
 email_address citext NOT NULL,
 provider varchar(40) NOT NULL,
 provider_account_id varchar(120),
 status varchar(40) NOT NULL DEFAULT 'PENDING',
 recovery_email citext,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT uq_email_accounts_tenant_address UNIQUE (tenant_id,email_address),
 CONSTRAINT uq_email_accounts_tenant_local UNIQUE (tenant_id,local_part)
);
CREATE INDEX IF NOT EXISTS idx_email_accounts_tenant ON email_accounts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_email_accounts_user ON email_accounts(user_id);
