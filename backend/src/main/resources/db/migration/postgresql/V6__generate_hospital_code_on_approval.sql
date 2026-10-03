-- Hospital code is a CareFlow-generated identifier assigned only when a verified hospital is approved.
ALTER TABLE platform_tenants ALTER COLUMN hospital_code DROP NOT NULL;
