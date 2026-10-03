ALTER TABLE platform_tenants
  ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mobile_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_otp_hash varchar(128),
  ADD COLUMN IF NOT EXISTS mobile_otp_hash varchar(128),
  ADD COLUMN IF NOT EXISTS email_otp_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS mobile_otp_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_otp_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS mobile_otp_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_verification_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mobile_verification_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_platform_tenants_verification
  ON platform_tenants(email_verified, mobile_verified, status);

CREATE INDEX IF NOT EXISTS ix_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS ix_audit_logs_action ON audit_logs(action);
