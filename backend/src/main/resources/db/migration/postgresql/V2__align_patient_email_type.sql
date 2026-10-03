-- Align the patient email column with the Java String mapping.
-- The initial schema used PostgreSQL citext here, but the current JPA model
-- intentionally maps patient email as a regular varchar.
ALTER TABLE patients
    ALTER COLUMN email TYPE varchar(255)
    USING email::text;
