import test from 'node:test';
import assert from 'node:assert';
import { 
  startTestServer, 
  stopTestServer, 
  baseUrl, 
  getAdminHeaders, 
  createMockVehicle
} from './helper.js';

test.describe('Expenses Module Integration Tests', () => {
  test.before(async () => {
    await startTestServer();
  });

  test.after(async () => {
    await stopTestServer();
  });

  test('Should record a valid expense and catch duplicates on same calendar day', async () => {
    const adminHeaders = await getAdminHeaders();
    const vehicle = await createMockVehicle();

    const dateStr = new Date().toISOString();

    // 1. Success create
    const createRes = await fetch(`${baseUrl}/api/v1/expenses`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        vehicleId: vehicle.id,
        amount: 250,
        category: 'MAINTENANCE',
        date: dateStr,
        description: 'Brake inspection service'
      })
    });
    assert.strictEqual(createRes.status, 201);
    const createData = await createRes.json();
    assert.strictEqual(createData.success, true);

    // 2. Try creating duplicate maintenance expense on same day (Should Fail)
    const duplicateRes = await fetch(`${baseUrl}/api/v1/expenses`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        vehicleId: vehicle.id,
        amount: 250,
        category: 'MAINTENANCE',
        date: dateStr,
        description: 'Brake inspection duplicate'
      })
    });
    assert.strictEqual(duplicateRes.status, 400);
    const duplicateData = await duplicateRes.json();
    assert.strictEqual(duplicateData.success, false);
    assert.match(duplicateData.message, /duplicate/i);
  });

  test('Should reject expense with negative amount', async () => {
    const adminHeaders = await getAdminHeaders();
    const vehicle = await createMockVehicle();

    const res = await fetch(`${baseUrl}/api/v1/expenses`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        vehicleId: vehicle.id,
        amount: -50,
        category: 'TOLL',
        date: new Date().toISOString(),
        description: 'Highway toll fee'
      })
    });
    assert.strictEqual(res.status, 400);
  });
});
