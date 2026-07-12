


INSERT INTO roles (name, description) VALUES
('ADMIN', 'Full system access'),
('FLEET_MANAGER', 'Manages vehicles and maintenance'),
('DISPATCHER', 'Creates and manages trips'),
('SAFETY_OFFICER', 'Manages driver compliance and safety'),
('FINANCIAL_ANALYST', 'Reviews fuel, expenses, and profitability');







INSERT INTO users (full_name, email, password_hash, role_id)
SELECT
    'System Administrator',
    'admin@transitops.com',
    '$2b$10$examplehashadmin',
    id
FROM roles
WHERE name = 'ADMIN';

INSERT INTO users (full_name, email, password_hash, role_id)
SELECT
    'Meera Shah',
    'fleet@transitops.com',
    '$2b$10$examplehashfleet',
    id
FROM roles
WHERE name = 'FLEET_MANAGER';

INSERT INTO users (full_name, email, password_hash, role_id)
SELECT
    'Rahul Patel',
    'dispatcher@transitops.com',
    '$2b$10$examplehashdispatcher',
    id
FROM roles
WHERE name = 'DISPATCHER';

INSERT INTO users (full_name, email, password_hash, role_id)
SELECT
    'Nisha Rao',
    'safety@transitops.com',
    '$2b$10$examplehashsafety',
    id
FROM roles
WHERE name = 'SAFETY_OFFICER';

INSERT INTO users (full_name, email, password_hash, role_id)
SELECT
    'Amit Desai',
    'finance@transitops.com',
    '$2b$10$examplehashfinance',
    id
FROM roles
WHERE name = 'FINANCIAL_ANALYST';





INSERT INTO vehicles (
    registration_number,
    vehicle_name,
    manufacturer,
    model,
    vehicle_type,
    max_load_capacity,
    capacity_unit,
    odometer,
    acquisition_cost,
    acquisition_date,
    region,
    status
) VALUES
('GJ01AB1001', 'Van-05', 'Tata', 'Winger', 'VAN', 500, 'KG', 45210, 1250000, '2023-01-15', 'Ahmedabad', 'AVAILABLE'),
('GJ05TR2002', 'Truck-12', 'Ashok Leyland', 'Ecomet 1615', 'TRUCK', 7500, 'KG', 82300, 3200000, '2022-06-10', 'Vadodara', 'AVAILABLE'),
('GJ06BS3003', 'Bus-09', 'Tata', 'Starbus', 'BUS', 2500, 'KG', 120450, 4500000, '2021-03-20', 'Surat', 'IN_SHOP'),
('GJ01TR4004', 'Truck-18', 'BharatBenz', '1923C', 'TRUCK', 9000, 'KG', 65400, 3850000, '2023-09-05', 'Ahmedabad', 'ON_TRIP'),
('GJ18VN5005', 'Van-11', 'Force', 'Traveller', 'VAN', 1200, 'KG', 33100, 1750000, '2024-02-12', 'Rajkot', 'AVAILABLE'),
('GJ05TR6006', 'Truck-04', 'Eicher', 'Pro 3015', 'TRUCK', 6500, 'KG', 158000, 2800000, '2020-11-08', 'Vadodara', 'RETIRED');





INSERT INTO drivers (
    employee_code,
    full_name,
    license_number,
    license_category,
    license_expiry_date,
    contact_number,
    email,
    safety_score,
    region,
    status
) VALUES
('DRV001', 'Alex Joseph', 'GJ012020000101', 'LMV', CURRENT_DATE + INTERVAL '18 months', '9876500001', 'alex@transitops.com', 92, 'Ahmedabad', 'AVAILABLE'),
('DRV002', 'Rakesh Kumar', 'GJ052018000202', 'HMV', CURRENT_DATE + INTERVAL '10 months', '9876500002', 'rakesh@transitops.com', 88, 'Vadodara', 'AVAILABLE'),
('DRV003', 'Priya Singh', 'GJ062019000303', 'BUS', CURRENT_DATE + INTERVAL '25 days', '9876500003', 'priya@transitops.com', 95, 'Surat', 'AVAILABLE'),
('DRV004', 'Sunil Sharma', 'GJ012017000404', 'HMV', CURRENT_DATE + INTERVAL '8 months', '9876500004', 'sunil@transitops.com', 84, 'Ahmedabad', 'ON_TRIP'),
('DRV005', 'Imran Sheikh', 'GJ182021000505', 'LMV', CURRENT_DATE - INTERVAL '10 days', '9876500005', 'imran@transitops.com', 76, 'Rajkot', 'OFF_DUTY'),
('DRV006', 'Karan Mehta', 'GJ052016000606', 'HMV', CURRENT_DATE + INTERVAL '5 months', '9876500006', 'karan@transitops.com', 61, 'Vadodara', 'SUSPENDED');



INSERT INTO trips (
    trip_number,
    source,
    destination,
    vehicle_id,
    driver_id,
    cargo_description,
    cargo_weight,
    planned_distance,
    starting_odometer,
    planned_start_time,
    revenue,
    status,
    created_by
)
SELECT
    'TRP-1001',
    'Ahmedabad',
    'Vadodara',
    v.id,
    d.id,
    'Electronic components',
    450,
    115,
    v.odometer,
    CURRENT_TIMESTAMP + INTERVAL '1 day',
    18000,
    'DRAFT',
    u.id
FROM vehicles v
JOIN drivers d ON d.employee_code = 'DRV001'
JOIN users u ON u.email = 'dispatcher@transitops.com'
WHERE v.registration_number = 'GJ01AB1001';

INSERT INTO trips (
    trip_number,
    source,
    destination,
    vehicle_id,
    driver_id,
    cargo_description,
    cargo_weight,
    planned_distance,
    actual_distance,
    starting_odometer,
    final_odometer,
    planned_start_time,
    actual_dispatch_time,
    completion_time,
    revenue,
    fuel_consumed,
    status,
    created_by
)
SELECT
    'TRP-1002',
    'Vadodara',
    'Surat',
    v.id,
    d.id,
    'Industrial tools',
    4200,
    155,
    158,
    82142,
    82300,
    CURRENT_TIMESTAMP - INTERVAL '4 days',
    CURRENT_TIMESTAMP - INTERVAL '4 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    42000,
    38,
    'COMPLETED',
    u.id
FROM vehicles v
JOIN drivers d ON d.employee_code = 'DRV002'
JOIN users u ON u.email = 'dispatcher@transitops.com'
WHERE v.registration_number = 'GJ05TR2002';

INSERT INTO trips (
    trip_number,
    source,
    destination,
    vehicle_id,
    driver_id,
    cargo_description,
    cargo_weight,
    planned_distance,
    starting_odometer,
    planned_start_time,
    actual_dispatch_time,
    revenue,
    status,
    created_by
)
SELECT
    'TRP-1003',
    'Ahmedabad',
    'Rajkot',
    v.id,
    d.id,
    'Construction material',
    7800,
    215,
    65400,
    CURRENT_TIMESTAMP - INTERVAL '5 hours',
    CURRENT_TIMESTAMP - INTERVAL '4 hours',
    60000,
    'DISPATCHED',
    u.id
FROM vehicles v
JOIN drivers d ON d.employee_code = 'DRV004'
JOIN users u ON u.email = 'dispatcher@transitops.com'
WHERE v.registration_number = 'GJ01TR4004';

INSERT INTO trips (
    trip_number,
    source,
    destination,
    vehicle_id,
    driver_id,
    cargo_description,
    cargo_weight,
    planned_distance,
    starting_odometer,
    planned_start_time,
    revenue,
    status,
    cancellation_reason,
    created_by
)
SELECT
    'TRP-1004',
    'Rajkot',
    'Jamnagar',
    v.id,
    d.id,
    'Pharmaceutical supplies',
    700,
    95,
    v.odometer,
    CURRENT_TIMESTAMP - INTERVAL '7 days',
    15000,
    'CANCELLED',
    'Customer order cancelled',
    u.id
FROM vehicles v
JOIN drivers d ON d.employee_code = 'DRV001'
JOIN users u ON u.email = 'dispatcher@transitops.com'
WHERE v.registration_number = 'GJ18VN5005';

INSERT INTO maintenance_logs (
    vehicle_id,
    maintenance_type,
    description,
    start_date,
    expected_completion_date,
    service_provider,
    cost,
    odometer_at_service,
    status,
    notes,
    created_by
)
SELECT
    v.id,
    'Oil Change',
    'Engine oil and oil filter replacement',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_DATE + INTERVAL '1 day',
    'Surat Fleet Service Center',
    6500,
    v.odometer,
    'ACTIVE',
    'Routine maintenance',
    u.id
FROM vehicles v
JOIN users u ON u.email = 'fleet@transitops.com'
WHERE v.registration_number = 'GJ06BS3003';

INSERT INTO maintenance_logs (
    vehicle_id,
    maintenance_type,
    description,
    start_date,
    expected_completion_date,
    actual_completion_date,
    service_provider,
    cost,
    odometer_at_service,
    status,
    notes,
    created_by
)
SELECT
    v.id,
    'Brake Service',
    'Brake pad and brake fluid replacement',
    CURRENT_TIMESTAMP - INTERVAL '30 days',
    CURRENT_DATE - INTERVAL '28 days',
    CURRENT_DATE - INTERVAL '28 days',
    'Ahmedabad Auto Care',
    18500,
    44750,
    'COMPLETED',
    'Completed successfully',
    u.id
FROM vehicles v
JOIN users u ON u.email = 'fleet@transitops.com'
WHERE v.registration_number = 'GJ01AB1001';

INSERT INTO fuel_logs (
    vehicle_id,
    trip_id,
    fuel_date,
    liters,
    cost_per_liter,
    odometer,
    fuel_station,
    receipt_number,
    created_by
)
SELECT
    v.id,
    t.id,
    CURRENT_DATE - INTERVAL '3 days',
    38,
    94.50,
    82300,
    'Indian Oil, Surat Highway',
    'IOCL-10001',
    u.id
FROM vehicles v
JOIN trips t ON t.trip_number = 'TRP-1002'
JOIN users u ON u.email = 'finance@transitops.com'
WHERE v.registration_number = 'GJ05TR2002';

INSERT INTO fuel_logs (
    vehicle_id,
    trip_id,
    fuel_date,
    liters,
    cost_per_liter,
    odometer,
    fuel_station,
    receipt_number,
    created_by
)
SELECT
    v.id,
    NULL,
    CURRENT_DATE - INTERVAL '10 days',
    45,
    95.20,
    65000,
    'HP Petrol Pump, Ahmedabad',
    'HP-20002',
    u.id
FROM vehicles v
JOIN users u ON u.email = 'finance@transitops.com'
WHERE v.registration_number = 'GJ01TR4004';

INSERT INTO fuel_logs (
    vehicle_id,
    trip_id,
    fuel_date,
    liters,
    cost_per_liter,
    odometer,
    fuel_station,
    receipt_number,
    created_by
)
SELECT
    v.id,
    NULL,
    CURRENT_DATE - INTERVAL '5 days',
    32,
    95.00,
    45100,
    'BPCL, Ahmedabad',
    'BPCL-30003',
    u.id
FROM vehicles v
JOIN users u ON u.email = 'finance@transitops.com'
WHERE v.registration_number = 'GJ01AB1001';

INSERT INTO expenses (
    vehicle_id,
    trip_id,
    category,
    amount,
    expense_date,
    vendor,
    description,
    created_by
)
SELECT
    v.id,
    t.id,
    'TOLL',
    1250,
    CURRENT_DATE - INTERVAL '3 days',
    'National Highway Toll',
    'Vadodara to Surat toll charges',
    u.id
FROM vehicles v
JOIN trips t ON t.trip_number = 'TRP-1002'
JOIN users u ON u.email = 'finance@transitops.com'
WHERE v.registration_number = 'GJ05TR2002';

INSERT INTO expenses (
    vehicle_id,
    maintenance_id,
    category,
    amount,
    expense_date,
    vendor,
    description,
    created_by
)
SELECT
    v.id,
    m.id,
    'MAINTENANCE',
    6500,
    CURRENT_DATE,
    'Surat Fleet Service Center',
    'Oil change service charge',
    u.id
FROM vehicles v
JOIN maintenance_logs m ON m.vehicle_id = v.id
JOIN users u ON u.email = 'finance@transitops.com'
WHERE v.registration_number = 'GJ06BS3003'
  AND m.status = 'ACTIVE';

INSERT INTO expenses (
    vehicle_id,
    category,
    amount,
    expense_date,
    vendor,
    description,
    created_by
)
SELECT
    v.id,
    'INSURANCE',
    32000,
    CURRENT_DATE - INTERVAL '20 days',
    'ABC General Insurance',
    'Annual vehicle insurance premium',
    u.id
FROM vehicles v
JOIN users u ON u.email = 'finance@transitops.com'
WHERE v.registration_number = 'GJ01AB1001';


