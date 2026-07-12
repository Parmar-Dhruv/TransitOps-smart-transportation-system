CREATE INDEX idx_users_role_id
ON users(role_id);

CREATE INDEX idx_vehicles_status
ON vehicles(status);

CREATE INDEX idx_vehicles_region
ON vehicles(region);

CREATE INDEX idx_drivers_status
ON drivers(status);

CREATE INDEX idx_drivers_license_expiry
ON drivers(license_expiry_date);

CREATE INDEX idx_trips_status
ON trips(status);

CREATE INDEX idx_trips_vehicle_id
ON trips(vehicle_id);

CREATE INDEX idx_trips_driver_id
ON trips(driver_id);

CREATE INDEX idx_trips_created_at
ON trips(created_at);

CREATE INDEX idx_maintenance_vehicle_id
ON maintenance_logs(vehicle_id);

CREATE INDEX idx_maintenance_status
ON maintenance_logs(status);

CREATE INDEX idx_fuel_logs_vehicle_id
ON fuel_logs(vehicle_id);

CREATE INDEX idx_fuel_logs_trip_id
ON fuel_logs(trip_id);

CREATE INDEX idx_expenses_vehicle_id
ON expenses(vehicle_id);

CREATE INDEX idx_expenses_trip_id
ON expenses(trip_id);

CREATE INDEX idx_expenses_maintenance_id
ON expenses(maintenance_id);