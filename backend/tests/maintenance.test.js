import test from 'node:test';
import assert from 'node:assert';
import { 
  startTestServer, 
  stopTestServer, 
  baseUrl, 
  getAdminHeaders, 
  getDispatcherHeaders, 
  createMockVehicle 
} from './helper.js';

test.describe('Maintenance Module Integration Tests', () => {
  test.before(async () => {
    await startTestServer();
  });

  test.after(async () => {
    await stopTestServer();
  });

  test('Should schedule, start, and complete maintenance successfully (Admin)', async () => {
    const adminHeaders = await getAdminHeaders();
    const vehicle = await createMockVehicle();

    // 1. Schedule Maintenance
    const createRes = await fetch(`${baseUrl}/api/v1/maintenance`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        vehicleId: vehicle.id,
        description: 'Monthly scheduled service',
        cost: 200,
        status: 'SCHEDULED',
        startDate: new Date().toISOString()
      })
    });
    assert.strictEqual(createRes.status, 201);
    const createData = await createRes.json();
    assert.strictEqual(createData.success, true);
    const logId = createData.data.id;

    // 2. Start Maintenance (AVAILABLE -> IN_SHOP)
    const startRes = await fetch(`${baseUrl}/api/v1/maintenance/${logId}/start`, {
      method: 'POST',
      headers: adminHeaders
    });
    assert.strictEqual(startRes.status, 200);

    // Verify Vehicle status in DB is IN_SHOP
    const vRes = await fetch(`${baseUrl}/vehicles/${vehicle.id}`, { headers: adminHeaders });
    const vData = await vRes.json();
    assert.strictEqual(vData.data.status, 'IN_SHOP');

    // 3. Complete Maintenance (IN_SHOP -> AVAILABLE)
    const completeRes = await fetch(`${baseUrl}/api/v1/maintenance/${logId}/complete`, {
      method: 'POST',
      headers: adminHeaders
    });
    assert.strictEqual(completeRes.status, 200);

    // Verify Vehicle status in DB is AVAILABLE
    const vPostRes = await fetch(`${baseUrl}/vehicles/${vehicle.id}`, { headers: adminHeaders });
    const vPostData = await vPostRes.json();
    assert.strictEqual(vPostData.data.status, 'AVAILABLE');
  });

  test('Should block non-authorized dispatcher role from scheduling maintenance (RBAC)', async () => {
    const dispatcherHeaders = await getDispatcherHeaders();
    const vehicle = await createMockVehicle();

    const createRes = await fetch(`${baseUrl}/api/v1/maintenance`, {
      method: 'POST',
      headers: dispatcherHeaders,
      body: JSON.stringify({
        vehicleId: vehicle.id,
        description: 'Tire rotation',
        cost: 100,
        startDate: new Date().toISOString()
      })
    });
    assert.strictEqual(createRes.status, 403);
    const data = await createRes.json();
    assert.strictEqual(data.success, false);
    assert.match(data.message, /Access denied/);
  });

  test('Should return 400 Bad Request for validation failure (negative cost)', async () => {
    const adminHeaders = await getAdminHeaders();
    const vehicle = await createMockVehicle();

    const createRes = await fetch(`${baseUrl}/api/v1/maintenance`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        vehicleId: vehicle.id,
        description: 'Routine maintenance',
        cost: -50,
        startDate: new Date().toISOString()
      })
    });
    assert.strictEqual(createRes.status, 400);
    const data = await createRes.json();
    assert.strictEqual(data.success, false);
  });
});
