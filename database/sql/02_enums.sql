CREATE TYPE vehicle_status AS ENUM (
    'AVAILABLE',
    'ON_TRIP',
    'IN_SHOP',
    'RETIRED'
);

CREATE TYPE driver_status AS ENUM (
    'AVAILABLE',
    'ON_TRIP',
    'OFF_DUTY',
    'SUSPENDED'
);

CREATE TYPE trip_status AS ENUM (
    'DRAFT',
    'DISPATCHED',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE maintenance_status AS ENUM (
    'SCHEDULED',
    'ACTIVE',
    'COMPLETED',
    'CANCELLED'
);

CREATE TYPE expense_category AS ENUM (
    'TOLL',
    'PARKING',
    'DRIVER_ALLOWANCE',
    'REPAIR',
    'MAINTENANCE',
    'INSURANCE',
    'PERMIT',
    'FINE',
    'MISCELLANEOUS'
);

CREATE TYPE capacity_unit AS ENUM (
    'KG',
    'TON'
);