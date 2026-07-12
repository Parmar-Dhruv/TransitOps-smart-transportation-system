
-- 5. Table Definitions

-- 5.1 Roles


CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 5.2 Users


CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 5.3 Vehicles


CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(30) NOT NULL UNIQUE,
    vehicle_name VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(100),
    model VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    max_load_capacity NUMERIC(12,2) NOT NULL CHECK (max_load_capacity > 0),
    capacity_unit capacity_unit NOT NULL DEFAULT 'KG',
    odometer NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (odometer >= 0),
    acquisition_cost NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (acquisition_cost >= 0),
    acquisition_date DATE,
    region VARCHAR(100),
    status vehicle_status NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 5.4 Drivers


CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    license_category VARCHAR(30) NOT NULL,
    license_expiry_date DATE NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    safety_score NUMERIC(5,2) NOT NULL DEFAULT 100
        CHECK (safety_score BETWEEN 0 AND 100),
    region VARCHAR(100),
    status driver_status NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 5.5 Trips


CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_number VARCHAR(30) NOT NULL UNIQUE,
    source VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    driver_id UUID NOT NULL REFERENCES drivers(id),
    cargo_description TEXT,
    cargo_weight NUMERIC(12,2) NOT NULL CHECK (cargo_weight > 0),
    planned_distance NUMERIC(12,2) NOT NULL CHECK (planned_distance > 0),
    actual_distance NUMERIC(12,2) CHECK (actual_distance >= 0),
    starting_odometer NUMERIC(12,2) CHECK (starting_odometer >= 0),
    final_odometer NUMERIC(12,2) CHECK (final_odometer >= 0),
    planned_start_time TIMESTAMP,
    actual_dispatch_time TIMESTAMP,
    completion_time TIMESTAMP,
    revenue NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (revenue >= 0),
    fuel_consumed NUMERIC(12,2) CHECK (fuel_consumed >= 0),
    status trip_status NOT NULL DEFAULT 'DRAFT',
    cancellation_reason TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        final_odometer IS NULL
        OR starting_odometer IS NULL
        OR final_odometer >= starting_odometer
    )
);


-- 5.6 Maintenance Logs


CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    start_date TIMESTAMP,
    expected_completion_date DATE,
    actual_completion_date DATE,
    service_provider VARCHAR(150),
    cost NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    odometer_at_service NUMERIC(12,2) CHECK (odometer_at_service >= 0),
    status maintenance_status NOT NULL DEFAULT 'SCHEDULED',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 5.7 Fuel Logs


CREATE TABLE fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    trip_id UUID REFERENCES trips(id),
    fuel_date DATE NOT NULL,
    liters NUMERIC(12,2) NOT NULL CHECK (liters > 0),
    cost_per_liter NUMERIC(12,2) NOT NULL CHECK (cost_per_liter >= 0),
    total_cost NUMERIC(14,2) GENERATED ALWAYS AS
        (liters * cost_per_liter) STORED,
    odometer NUMERIC(12,2) CHECK (odometer >= 0),
    fuel_station VARCHAR(150),
    receipt_number VARCHAR(80),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 5.8 Expenses


CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID REFERENCES vehicles(id),
    trip_id UUID REFERENCES trips(id),
    maintenance_id UUID REFERENCES maintenance_logs(id),
    category expense_category NOT NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL,
    vendor VARCHAR(150),
    description TEXT,
    receipt_url TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (
        vehicle_id IS NOT NULL
        OR trip_id IS NOT NULL
        OR maintenance_id IS NOT NULL
    )
);


-- 5.9 Audit Logs


CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
