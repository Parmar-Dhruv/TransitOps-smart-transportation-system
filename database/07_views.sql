CREATE OR REPLACE VIEW vehicle_operational_summary AS
SELECT
    v.id AS vehicle_id,
    v.registration_number,
    v.vehicle_name,
    v.vehicle_type,
    v.status,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'COMPLETED') AS completed_trips,
    COALESCE(SUM(DISTINCT t.actual_distance), 0) AS total_distance,
    COALESCE(SUM(DISTINCT t.revenue), 0) AS total_revenue,
    COALESCE(SUM(DISTINCT f.total_cost), 0) AS total_fuel_cost,
    COALESCE(SUM(DISTINCT m.cost) FILTER (WHERE m.status = 'COMPLETED'), 0)
        AS maintenance_cost
FROM vehicles v
LEFT JOIN trips t ON t.vehicle_id = v.id
LEFT JOIN fuel_logs f ON f.vehicle_id = v.id
LEFT JOIN maintenance_logs m ON m.vehicle_id = v.id
GROUP BY
    v.id,
    v.registration_number,
    v.vehicle_name,
    v.vehicle_type,
    v.status;





CREATE OR REPLACE VIEW driver_compliance_summary AS
SELECT
    id,
    employee_code,
    full_name,
    license_number,
    license_category,
    license_expiry_date,
    safety_score,
    status,
    CASE
        WHEN license_expiry_date < CURRENT_DATE THEN 'EXPIRED'
        WHEN license_expiry_date <= CURRENT_DATE + INTERVAL '7 days'
            THEN 'CRITICAL'
        WHEN license_expiry_date <= CURRENT_DATE + INTERVAL '30 days'
            THEN 'WARNING'
        ELSE 'VALID'
    END AS license_status
FROM drivers;