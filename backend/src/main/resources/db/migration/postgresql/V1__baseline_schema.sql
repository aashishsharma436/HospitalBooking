-- HospitalBooking SaaS — PostgreSQL schema v2
-- Doctor-practice architecture: APPOINTMENT / QUEUE / HYBRID
-- Purpose: reviewable foundation for the new Spring Boot implementation.
-- This is intentionally standalone DDL; application code and migrations come later.

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE tenant_status AS ENUM ('ACTIVE', 'SUSPENDED', 'CANCELLED');
CREATE TYPE record_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE user_status AS ENUM ('INVITED', 'ACTIVE', 'LOCKED', 'DISABLED');
CREATE TYPE hospital_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE appointment_status AS ENUM (
    'PENDING_PAYMENT', 'CONFIRMED', 'CHECKED_IN',
    'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'
);
CREATE TYPE booking_source AS ENUM ('WEBSITE', 'RECEPTION', 'PHONE', 'WHATSAPP', 'ADMIN', 'API');
CREATE TYPE consultation_mode AS ENUM ('APPOINTMENT', 'QUEUE', 'HYBRID');
CREATE TYPE queue_ticket_source AS ENUM ('APPOINTMENT', 'WALK_IN', 'RECEPTION', 'ONLINE');
CREATE TYPE queue_status AS ENUM ('WAITING', 'CALLED', 'SERVING', 'COMPLETED', 'SKIPPED', 'NO_SHOW');
CREATE TYPE schedule_exception_type AS ENUM ('LEAVE', 'HOLIDAY', 'BLOCKED', 'SPECIAL_HOURS');
CREATE TYPE payment_status AS ENUM (
    'CREATED', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'
);
CREATE TYPE payment_method AS ENUM ('CARD', 'UPI', 'NET_BANKING', 'WALLET', 'CASH', 'OTHER');
CREATE TYPE billing_interval AS ENUM ('MONTHLY', 'YEARLY');
CREATE TYPE subscription_status AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED');
CREATE TYPE notification_channel AS ENUM ('WHATSAPP', 'SMS', 'EMAIL', 'PUSH');
CREATE TYPE notification_status AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'CANCELLED');

-- ============================================================
-- COMMON FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- SAAS / TENANCY
-- ============================================================

CREATE TABLE tenants (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name                varchar(200) NOT NULL,
    slug                citext NOT NULL UNIQUE,
    status              tenant_status NOT NULL DEFAULT 'ACTIVE',
    timezone            varchar(64) NOT NULL DEFAULT 'Asia/Kolkata',
    currency            char(3) NOT NULL DEFAULT 'INR',
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_tenants_id_tenant UNIQUE (id)
);

CREATE TABLE plans (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name                varchar(100) NOT NULL UNIQUE,
    description         text,
    price               numeric(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    currency            char(3) NOT NULL DEFAULT 'INR',
    billing_interval    billing_interval NOT NULL,
    status              record_status NOT NULL DEFAULT 'ACTIVE',
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE features (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key                 varchar(100) NOT NULL UNIQUE,
    name                varchar(150) NOT NULL,
    description         text,
    status              record_status NOT NULL DEFAULT 'ACTIVE',
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE plan_features (
    plan_id             uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
    feature_id          uuid NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    limits_json         jsonb NOT NULL DEFAULT '{}'::jsonb,
    PRIMARY KEY (plan_id, feature_id)
);

CREATE TABLE subscriptions (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id),
    plan_id             uuid NOT NULL REFERENCES plans(id),
    status              subscription_status NOT NULL,
    started_at          timestamptz NOT NULL,
    current_period_start timestamptz,
    current_period_end  timestamptz,
    cancelled_at        timestamptz,
    provider            varchar(50),
    provider_subscription_id varchar(150),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_subscriptions_provider UNIQUE (provider, provider_subscription_id)
);

CREATE TABLE tenant_features (
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    feature_id          uuid NOT NULL REFERENCES features(id),
    enabled             boolean NOT NULL DEFAULT true,
    limits_json         jsonb NOT NULL DEFAULT '{}'::jsonb,
    expires_at          timestamptz,
    PRIMARY KEY (tenant_id, feature_id)
);

CREATE TABLE tenant_settings (
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    key                 varchar(100) NOT NULL,
    value_json          jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at          timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (tenant_id, key)
);

CREATE TABLE tenant_branding (
    tenant_id           uuid PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    logo_url             text,
    favicon_url         text,
    primary_color       varchar(20),
    secondary_color     varchar(20),
    custom_domain       citext UNIQUE,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- HOSPITAL / IDENTITY / RBAC
-- ============================================================

CREATE TABLE hospitals (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name                varchar(200) NOT NULL,
    code                varchar(50) NOT NULL,
    slug                citext NOT NULL,
    address             text,
    city                varchar(100),
    state               varchar(100),
    postal_code         varchar(20),
    phone               varchar(30),
    email               citext,
    timezone            varchar(64),
    status              hospital_status NOT NULL DEFAULT 'ACTIVE',
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_hospitals_tenant_code UNIQUE (tenant_id, code),
    CONSTRAINT uq_hospitals_tenant_slug UNIQUE (tenant_id, slug),
    CONSTRAINT uq_hospitals_tenant_id UNIQUE (tenant_id, id)
);

CREATE TABLE users (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email               citext,
    phone               varchar(30),
    password_hash       text,
    full_name           varchar(200) NOT NULL,
    status              user_status NOT NULL DEFAULT 'INVITED',
    last_login_at       timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_users_tenant_email UNIQUE (tenant_id, email),
    CONSTRAINT uq_users_tenant_phone UNIQUE (tenant_id, phone),
    CONSTRAINT uq_users_tenant_id UNIQUE (tenant_id, id)
);

CREATE TABLE roles (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name                varchar(80) NOT NULL UNIQUE,
    description         text
);

CREATE TABLE permissions (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key                 varchar(120) NOT NULL UNIQUE,
    description         text
);

CREATE TABLE role_permissions (
    role_id             uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id       uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id             uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id             uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE user_hospitals (
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id             uuid NOT NULL,
    hospital_id         uuid NOT NULL,
    PRIMARY KEY (user_id, hospital_id),
    CONSTRAINT fk_user_hospitals_user
        FOREIGN KEY (tenant_id, user_id)
        REFERENCES users(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT fk_user_hospitals_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE
);

-- ============================================================
-- CLINICAL ORGANIZATION
-- ============================================================

CREATE TABLE departments (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid NOT NULL,
    name                varchar(150) NOT NULL,
    description         text,
    status              record_status NOT NULL DEFAULT 'ACTIVE',
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_departments_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT uq_departments_tenant_hospital_name
        UNIQUE (tenant_id, hospital_id, name),
    CONSTRAINT uq_departments_tenant_id UNIQUE (tenant_id, id)
);

CREATE TABLE doctors (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid NOT NULL,
    user_id             uuid,
    department_id       uuid,
    registration_number varchar(100),
    full_name           varchar(200) NOT NULL,
    qualification       varchar(200),
    specialization      varchar(200),
    phone               varchar(30),
    email               citext,
    status              record_status NOT NULL DEFAULT 'ACTIVE',
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_doctors_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT fk_doctors_user
        FOREIGN KEY (tenant_id, user_id)
        REFERENCES users(tenant_id, id)
        ON DELETE SET NULL,
    CONSTRAINT fk_doctors_department
        FOREIGN KEY (tenant_id, department_id)
        REFERENCES departments(tenant_id, id)
        ON DELETE SET NULL,
    CONSTRAINT uq_doctors_tenant_registration UNIQUE (tenant_id, registration_number),
    CONSTRAINT uq_doctors_tenant_id UNIQUE (tenant_id, id)
);

CREATE TABLE services (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid NOT NULL,
    name                varchar(150) NOT NULL,
    description         text,
    duration_minutes    integer NOT NULL DEFAULT 15 CHECK (duration_minutes > 0),
    status              record_status NOT NULL DEFAULT 'ACTIVE',
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_services_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT uq_services_tenant_hospital_name UNIQUE (tenant_id, hospital_id, name),
    CONSTRAINT uq_services_tenant_id UNIQUE (tenant_id, id)
);

CREATE TABLE doctor_practice_services (
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    doctor_practice_id  uuid NOT NULL,
    service_id          uuid NOT NULL,
    price               numeric(12,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
    currency            char(3) NOT NULL DEFAULT 'INR',
    duration_minutes    integer CHECK (duration_minutes > 0),
    status              record_status NOT NULL DEFAULT 'ACTIVE',
    PRIMARY KEY (doctor_practice_id, service_id)
);
-- ============================================================
-- PATIENTS
-- ============================================================

CREATE TABLE patients (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid NOT NULL,
    patient_number      varchar(50) NOT NULL,
    full_name           varchar(200) NOT NULL,
    date_of_birth       date,
    gender              varchar(30),
    phone               varchar(30),
    email               citext,
    address             text,
    emergency_contact_name  varchar(200),
    emergency_contact_phone varchar(30),
    blood_group         varchar(10),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_patients_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT uq_patients_tenant_hospital_number
        UNIQUE (tenant_id, hospital_id, patient_number),
    CONSTRAINT uq_patients_tenant_id UNIQUE (tenant_id, id)
);

-- ============================================================
-- DOCTOR PRACTICES / SCHEDULING
-- ============================================================

CREATE TABLE doctor_practices (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid NOT NULL,
    doctor_id           uuid NOT NULL,
    consultation_mode   consultation_mode NOT NULL DEFAULT 'APPOINTMENT',
    queue_enabled       boolean NOT NULL DEFAULT false,
    online_booking_enabled boolean NOT NULL DEFAULT true,
    status              record_status NOT NULL DEFAULT 'ACTIVE',
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_doctor_practices_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT fk_doctor_practices_doctor
        FOREIGN KEY (tenant_id, doctor_id)
        REFERENCES doctors(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT uq_doctor_practice
        UNIQUE (tenant_id, hospital_id, doctor_id),
    CONSTRAINT uq_doctor_practices_tenant_id
        UNIQUE (tenant_id, id),
    CONSTRAINT ck_doctor_practice_queue_mode
        CHECK (
            (consultation_mode IN ('QUEUE','HYBRID') AND queue_enabled = true)
            OR
            (consultation_mode = 'APPOINTMENT' AND queue_enabled = false)
        )
);

ALTER TABLE doctor_practice_services
    ADD CONSTRAINT fk_doctor_practice_services_practice
    FOREIGN KEY (tenant_id, doctor_practice_id)
    REFERENCES doctor_practices(tenant_id, id)
    ON DELETE CASCADE;

ALTER TABLE doctor_practice_services
    ADD CONSTRAINT fk_doctor_practice_services_service
    FOREIGN KEY (tenant_id, service_id)
    REFERENCES services(tenant_id, id)
    ON DELETE RESTRICT;

CREATE TABLE doctor_schedules (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid NOT NULL,
    doctor_practice_id  uuid NOT NULL,
    day_of_week         smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time          time NOT NULL,
    end_time            time NOT NULL,
    appointment_duration_minutes integer NOT NULL DEFAULT 15 CHECK (appointment_duration_minutes > 0),
    status              record_status NOT NULL DEFAULT 'ACTIVE',
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_schedules_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT fk_schedules_practice
        FOREIGN KEY (tenant_id, doctor_practice_id)
        REFERENCES doctor_practices(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT ck_schedules_time CHECK (start_time < end_time),
    CONSTRAINT uq_practice_schedule_interval
        UNIQUE (doctor_practice_id, day_of_week, start_time, end_time)
);

CREATE TABLE doctor_schedule_exceptions (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid NOT NULL,
    doctor_practice_id  uuid NOT NULL,
    exception_date      date NOT NULL,
    start_time          time,
    end_time            time,
    type                schedule_exception_type NOT NULL,
    reason              text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_schedule_exceptions_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT fk_schedule_exceptions_practice
        FOREIGN KEY (tenant_id, doctor_practice_id)
        REFERENCES doctor_practices(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT ck_schedule_exception_time
        CHECK (
            (start_time IS NULL AND end_time IS NULL)
            OR (start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
        )
);

-- Availability is calculated dynamically from practice schedules,
-- date exceptions, service duration, and existing appointments.
-- We intentionally do not persist generated appointment slots.

-- ============================================================
-- APPOINTMENTS
-- ============================================================

CREATE TABLE appointments (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid NOT NULL,
    doctor_practice_id  uuid NOT NULL,
    patient_id          uuid NOT NULL,
    service_id          uuid NOT NULL,
    appointment_number  varchar(60) NOT NULL,
    appointment_date    date NOT NULL,
    appointment_start   time NOT NULL,
    appointment_end     time NOT NULL,
    status              appointment_status NOT NULL DEFAULT 'CONFIRMED',
    booking_source      booking_source NOT NULL,
    checked_in_at       timestamptz,
    checked_in_by       uuid,
    notes               text,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_appointments_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT fk_appointments_practice
        FOREIGN KEY (tenant_id, doctor_practice_id)
        REFERENCES doctor_practices(tenant_id, id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_appointments_patient
        FOREIGN KEY (tenant_id, patient_id)
        REFERENCES patients(tenant_id, id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_appointments_service
        FOREIGN KEY (tenant_id, service_id)
        REFERENCES services(tenant_id, id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_appointments_checked_in_by
        FOREIGN KEY (tenant_id, checked_in_by)
        REFERENCES users(tenant_id, id)
        ON DELETE SET NULL,
    CONSTRAINT ck_appointments_time CHECK (appointment_start < appointment_end),
    CONSTRAINT uq_appointment_number UNIQUE (tenant_id, appointment_number),
    CONSTRAINT uq_appointment_id_tenant UNIQUE (tenant_id, id)
);

-- ============================================================
-- QUEUE
-- ============================================================

CREATE TABLE queue_counters (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid NOT NULL,
    doctor_practice_id  uuid NOT NULL,
    queue_date          date NOT NULL,
    next_number         integer NOT NULL DEFAULT 1 CHECK (next_number > 0),
    CONSTRAINT fk_queue_counters_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT fk_queue_counters_practice
        FOREIGN KEY (tenant_id, doctor_practice_id)
        REFERENCES doctor_practices(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT uq_queue_counter UNIQUE (doctor_practice_id, queue_date)
);

CREATE TABLE queue_tickets (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid NOT NULL,
    doctor_practice_id  uuid NOT NULL,
    patient_id          uuid NOT NULL,
    appointment_id      uuid,
    queue_date          date NOT NULL,
    token_number        integer NOT NULL CHECK (token_number > 0),
    source              queue_ticket_source NOT NULL,
    status              queue_status NOT NULL DEFAULT 'WAITING',
    called_at           timestamptz,
    served_at           timestamptz,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_queue_tickets_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT fk_queue_tickets_practice
        FOREIGN KEY (tenant_id, doctor_practice_id)
        REFERENCES doctor_practices(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT fk_queue_tickets_patient
        FOREIGN KEY (tenant_id, patient_id)
        REFERENCES patients(tenant_id, id)
        ON DELETE RESTRICT,
    CONSTRAINT fk_queue_tickets_appointment
        FOREIGN KEY (tenant_id, appointment_id)
        REFERENCES appointments(tenant_id, id)
        ON DELETE SET NULL,
    CONSTRAINT uq_queue_token UNIQUE (doctor_practice_id, queue_date, token_number)
);

-- ============================================================
-- PAYMENTS
-- ============================================================

CREATE TABLE payments (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid NOT NULL,
    appointment_id      uuid,
    patient_id          uuid NOT NULL,
    amount              numeric(12,2) NOT NULL CHECK (amount >= 0),
    currency            char(3) NOT NULL DEFAULT 'INR',
    provider            varchar(50),
    provider_payment_id varchar(150),
    status              payment_status NOT NULL DEFAULT 'CREATED',
    payment_method      payment_method,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_payments_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT fk_payments_appointment
        FOREIGN KEY (tenant_id, appointment_id)
        REFERENCES appointments(tenant_id, id)
        ON DELETE SET NULL,
    CONSTRAINT fk_payments_patient
        FOREIGN KEY (tenant_id, patient_id)
        REFERENCES patients(tenant_id, id)
        ON DELETE RESTRICT,
    CONSTRAINT uq_payment_provider_reference
        UNIQUE (provider, provider_payment_id)
);

CREATE TABLE payment_transactions (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id          uuid NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    event_type          varchar(80) NOT NULL,
    provider_event_id   varchar(150),
    amount              numeric(12,2) NOT NULL CHECK (amount >= 0),
    status              payment_status NOT NULL,
    payload             jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_provider_event UNIQUE (provider_event_id)
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE notifications (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    hospital_id         uuid,
    user_id             uuid,
    patient_id          uuid,
    appointment_id      uuid,
    channel             notification_channel NOT NULL,
    template_key        varchar(100) NOT NULL,
    recipient           varchar(255) NOT NULL,
    status              notification_status NOT NULL DEFAULT 'PENDING',
    scheduled_at        timestamptz,
    sent_at             timestamptz,
    attempt_count       integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
    last_error          text,
    provider_message_id varchar(200),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_notifications_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE CASCADE,
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (tenant_id, user_id)
        REFERENCES users(tenant_id, id)
        ON DELETE SET NULL,
    CONSTRAINT fk_notifications_patient
        FOREIGN KEY (tenant_id, patient_id)
        REFERENCES patients(tenant_id, id)
        ON DELETE SET NULL,
    CONSTRAINT fk_notifications_appointment
        FOREIGN KEY (tenant_id, appointment_id)
        REFERENCES appointments(tenant_id, id)
        ON DELETE SET NULL
);

-- ============================================================
-- AUDIT
-- ============================================================

CREATE TABLE audit_logs (
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           uuid REFERENCES tenants(id) ON DELETE SET NULL,
    hospital_id         uuid,
    user_id             uuid,
    action              varchar(100) NOT NULL,
    entity_type         varchar(100),
    entity_id           uuid,
    ip_address          inet,
    user_agent          text,
    metadata            jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at          timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT fk_audit_hospital
        FOREIGN KEY (tenant_id, hospital_id)
        REFERENCES hospitals(tenant_id, id)
        ON DELETE SET NULL,
    CONSTRAINT fk_audit_user
        FOREIGN KEY (tenant_id, user_id)
        REFERENCES users(tenant_id, id)
        ON DELETE SET NULL
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX ix_hospitals_tenant ON hospitals (tenant_id);
CREATE INDEX ix_users_tenant_status ON users (tenant_id, status);
CREATE INDEX ix_user_hospitals_tenant_hospital ON user_hospitals (tenant_id, hospital_id);

CREATE INDEX ix_doctors_tenant_hospital ON doctors (tenant_id, hospital_id);
CREATE INDEX ix_doctors_department ON doctors (department_id);
CREATE INDEX ix_services_tenant_hospital ON services (tenant_id, hospital_id);
CREATE INDEX ix_patients_tenant_hospital ON patients (tenant_id, hospital_id);
CREATE INDEX ix_patients_phone ON patients (tenant_id, phone);

CREATE INDEX ix_doctor_practices_tenant_hospital
    ON doctor_practices (tenant_id, hospital_id);
CREATE INDEX ix_doctor_practices_doctor
    ON doctor_practices (doctor_id);

CREATE INDEX ix_doctor_practice_services_service
    ON doctor_practice_services (service_id);

CREATE INDEX ix_doctor_schedules_practice_day
    ON doctor_schedules (doctor_practice_id, day_of_week);
CREATE INDEX ix_schedule_exceptions_practice_date
    ON doctor_schedule_exceptions (doctor_practice_id, exception_date);

CREATE INDEX ix_appointments_tenant_date
    ON appointments (tenant_id, appointment_date);
CREATE INDEX ix_appointments_practice_date
    ON appointments (doctor_practice_id, appointment_date, appointment_start);
CREATE INDEX ix_appointments_patient
    ON appointments (patient_id, appointment_date);
CREATE INDEX ix_appointments_status
    ON appointments (tenant_id, status);

CREATE INDEX ix_queue_tickets_practice_date_status
    ON queue_tickets (doctor_practice_id, queue_date, status, token_number);

CREATE INDEX ix_payments_tenant_status
    ON payments (tenant_id, status);
CREATE INDEX ix_payment_transactions_payment
    ON payment_transactions (payment_id, created_at);

CREATE INDEX ix_notifications_pending
    ON notifications (status, scheduled_at);
CREATE INDEX ix_audit_logs_tenant_created
    ON audit_logs (tenant_id, created_at DESC);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER trg_tenants_updated_at
BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_plans_updated_at
BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_features_updated_at
BEFORE UPDATE ON features FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_subscriptions_updated_at
BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_tenant_branding_updated_at
BEFORE UPDATE ON tenant_branding FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hospitals_updated_at
BEFORE UPDATE ON hospitals FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_departments_updated_at
BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_doctors_updated_at
BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_patients_updated_at
BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_doctor_practices_updated_at
BEFORE UPDATE ON doctor_practices FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_doctor_schedules_updated_at
BEFORE UPDATE ON doctor_schedules FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_appointments_updated_at
BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_queue_tickets_updated_at
BEFORE UPDATE ON queue_tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_notifications_updated_at
BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- SEED: SYSTEM RBAC
-- ============================================================

INSERT INTO roles (name, description) VALUES
    ('SUPER_ADMIN', 'Platform administrator'),
    ('TENANT_ADMIN', 'Tenant administrator'),
    ('HOSPITAL_ADMIN', 'Hospital/branch administrator'),
    ('DOCTOR', 'Doctor'),
    ('RECEPTIONIST', 'Receptionist'),
    ('PATIENT', 'Patient portal user')
ON CONFLICT (name) DO NOTHING;

INSERT INTO features (key, name, description) VALUES
    ('ONLINE_BOOKING', 'Online Booking', 'Allow patients to book appointments online'),
    ('ONLINE_PAYMENT', 'Online Payment', 'Collect appointment payments online'),
    ('LIVE_QUEUE', 'Live Queue', 'Live token and queue management'),
    ('WHATSAPP', 'WhatsApp Notifications', 'Send WhatsApp notifications'),
    ('SMS', 'SMS Notifications', 'Send SMS notifications'),
    ('EMAIL', 'Email Notifications', 'Send email notifications'),
    ('REPORTS', 'Reports', 'Operational and business reports'),
    ('CUSTOM_BRANDING', 'Custom Branding', 'Tenant branding and custom domain'),
    ('MULTI_BRANCH', 'Multiple Branches', 'Multiple hospitals/branches per tenant'),
    ('API_ACCESS', 'API Access', 'External API access')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- CONCURRENCY NOTES
-- ============================================================
-- 1. Queue token generation MUST lock queue_counters row in a transaction:
--      SELECT ... FROM queue_counters WHERE doctor_id = ? AND queue_date = ? FOR UPDATE;
--      read next_number; increment; insert queue_tickets; COMMIT.
--
-- 2. Appointment booking MUST be transactional. The service should:
--      calculate availability from schedules/exceptions/current appointments;
--      lock the relevant practice/date or use an equivalent serialization strategy;
--      re-check overlap immediately before insert; create appointment; COMMIT.
--
-- 3. Appointment-based patients enter the queue only after check-in.
--    Queue-based patients create a queue ticket directly from walk-in registration.
--
-- 4. Payment webhooks MUST be idempotent using provider_event_id.
--
-- 5. Tenant isolation is enforced by composite (tenant_id, foreign_id) keys
--    on tenant-owned relationships. Application authorization must still
--    derive tenant_id from the authenticated principal, never from request input.
