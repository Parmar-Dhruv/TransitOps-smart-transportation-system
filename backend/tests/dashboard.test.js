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

  test('Should fetch full dashboard module endpoints successfully', async () => {
    const adminHeaders = await getAdminHeaders();

    const endpoints = [
      '/api/v1/dashboard',
      '/api/v1/dashboard/kpis',
      '/api/v1/dashboard/fleet-analytics',
      '/api/v1/dashboard/trip-analytics',
      '/api/v1/dashboard/revenue-analytics',
      '/api/v1/dashboard/fuel-analytics',
      '/api/v1/dashboard/maintenance-analytics',
      '/api/v1/dashboard/expense-breakdown',
      '/api/v1/dashboard/recent-activity',
      '/api/v1/dashboard/alerts'
    ];

    for (const endpoint of endpoints) {
      const response = await fetch(`${baseUrl}${endpoint}`, { headers: adminHeaders });
      assert.strictEqual(response.status, 200);
      const body = await response.json();
      assert.strictEqual(body.success, true);
      assert.ok(body.data && typeof body.data === 'object');
    }

    const overviewRes = await fetch(`${baseUrl}/api/v1/dashboard`, { headers: adminHeaders });
    const overview = await overviewRes.json();
    assert.ok(overview.data.kpis.hasOwnProperty('totalVehicles'));
    assert.ok(overview.data.kpis.hasOwnProperty('roiPercent'));
    assert.ok(Array.isArray(overview.data.revenue.monthly));
    assert.ok(Array.isArray(overview.data.fleet.distribution));

    const searchRes = await fetch(`${baseUrl}/api/v1/dashboard/search?q=test`, { headers: adminHeaders });
    assert.strictEqual(searchRes.status, 200);
    const searchBody = await searchRes.json();
    assert.strictEqual(searchBody.success, true);
    assert.ok(Array.isArray(searchBody.data.vehicles));
    assert.ok(Array.isArray(searchBody.data.drivers));
    assert.ok(Array.isArray(searchBody.data.trips));
  });
});
