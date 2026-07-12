import test from 'node:test';
import assert from 'node:assert';
import { 
  startTestServer, 
  stopTestServer, 
  baseUrl, 
  getAdminHeaders, 
  createMockVehicle,
  createMockDriver
} from './helper.js';

test.describe('Fuel Module Integration Tests', () => {
  test.before(async () => {
    await startTestServer();
  });

  test.after(async () => {
    await stopTestServer();
  });

  test('Should log a valid fuel refill and automatically compute total cost', async () => {
    const adminHeaders = await getAdminHeaders();
    const vehicle = await createMockVehicle();
    const driver = await createMockDriver();

    const createRes = await fetch(`${baseUrl}/api/v1/fuel`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        vehicleId: vehicle.id,
        driverId: driver.id,
        liters: 100,
        costPerLiter: 1.8,
        odometer: vehicle.odometer + 50,
        refuelDate: new Date().toISOString()
      })
    });

    assert.strictEqual(createRes.status, 201);
    const data = await createRes.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.totalCost, 180); // 100 * 1.8

    // Verify Vehicle Odometer is updated to vehicle.odometer + 50
    const vRes = await fetch(`${baseUrl}/vehicles/${vehicle.id}`, { headers: adminHeaders });
    const vData = await vRes.json();
    assert.strictEqual(vData.data.odometer, vehicle.odometer + 50);
  });

  test('Should throw 400 Bad Request for odometer reading less than vehicle current odometer', async () => {
    const adminHeaders = await getAdminHeaders();
    const vehicle = await createMockVehicle();
    const driver = await createMockDriver();

    const createRes = await fetch(`${baseUrl}/api/v1/fuel`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        vehicleId: vehicle.id,
        driverId: driver.id,
        liters: 50,
        costPerLiter: 1.5,
        odometer: vehicle.odometer - 100, // Invalid: less than vehicle current odometer
        refuelDate: new Date().toISOString()
      })
    });

    assert.strictEqual(createRes.status, 400);
    const data = await createRes.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /odometer/i);
  });
});
