CREATE OR REPLACE FUNCTION update_modified_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;





CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

CREATE TRIGGER trg_vehicles_updated_at
BEFORE UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

CREATE TRIGGER trg_drivers_updated_at
BEFORE UPDATE ON drivers
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

CREATE TRIGGER trg_trips_updated_at
BEFORE UPDATE ON trips
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();

CREATE TRIGGER trg_maintenance_updated_at
BEFORE UPDATE ON maintenance_logs
FOR EACH ROW
EXECUTE FUNCTION update_modified_timestamp();