# HospitalBooking database

## Architecture

```
Tenant
  └── Hospital
        └── Doctor
              └── Doctor Practice
                    ├── Services
                    ├── Weekly schedules
                    ├── Date exceptions
                    ├── Appointments
                    │      └── Check-in → Queue ticket
                    └── Walk-in registration → Queue ticket
```

## Consultation modes

- APPOINTMENT — patients reserve a time; they enter the live queue after check-in.
- QUEUE — patients register/walk in and receive a token.
- HYBRID — both appointment booking and queue registration are supported.

## Availability

Appointment availability is calculated dynamically from:
1. doctor practice
2. weekly schedule
3. date-specific exceptions
4. service duration
5. existing appointments

There is deliberately no persistent appointment_slots table. This avoids stale generated slots and lets schedules change without regenerating a large slot table.

## Queue

Queue numbers are scoped to doctor_practice + queue_date.
Token generation must lock the corresponding queue_counters row inside a transaction.

## Tenant isolation

Tenant-owned relationships use composite (tenant_id, id) foreign keys where practical. The authenticated tenant must be the source of tenant context; clients must never be allowed to choose an arbitrary tenant ID.

## Environments

- Development/test: H2, PostgreSQL compatibility mode.
- Production: PostgreSQL + Flyway.
- The PostgreSQL schema in database/schema.sql is the design reference and is also copied into the backend Flyway baseline migration.