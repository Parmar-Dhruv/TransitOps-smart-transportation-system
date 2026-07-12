import test from 'node:test';
import assert from 'node:assert';
import { 
  startTestServer, 
  stopTestServer, 
  baseUrl, 
  getAdminHeaders 
} from './helper.js';

test.describe('Dashboard Module Integration Tests', () => {
  test.before(async () => {
    await startTestServer();
  });

  test.after(async () => {
    await stopTestServer();
  });

  test('Should fetch dashboard KPIs and charts successfully', async () => {
    const adminHeaders = await getAdminHeaders();

    // 1. Fetch KPIs
    const kpisRes = await fetch(`${baseUrl}/api/v1/dashboard/kpis`, { headers: adminHeaders });
    assert.strictEqual(kpisRes.status, 200);
    const kpisData = await kpisRes.json();
    assert.strictEqual(kpisData.success, true);
    assert.ok(kpisData.data.hasOwnProperty('activeVehicles'));
    assert.ok(kpisData.data.hasOwnProperty('totalOperationalCost'));

    // 2. Fetch Charts
    const chartsRes = await fetch(`${baseUrl}/api/v1/dashboard/charts`, { headers: adminHeaders });
    assert.strictEqual(chartsRes.status, 200);
    const chartsData = await chartsRes.json();
    assert.strictEqual(chartsData.success, true);
    assert.ok(Array.isArray(chartsData.data.monthlyCosts));
    assert.ok(Array.isArray(chartsData.data.vehicleDistribution));
  });
});
