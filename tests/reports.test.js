import test from 'node:test';
import assert from 'node:assert';
import { 
  startTestServer, 
  stopTestServer, 
  baseUrl, 
  getAdminHeaders 
} from './helper.js';

test.describe('Reports Module Integration Tests', () => {
  test.before(async () => {
    await startTestServer();
  });

  test.after(async () => {
    await stopTestServer();
  });

  test('Should fetch report JSON data and generate downloadable CSVs successfully', async () => {
    const adminHeaders = await getAdminHeaders();

    // 1. Fetch Fleet Report JSON
    const fleetRes = await fetch(`${baseUrl}/api/v1/reports/fleet`, { headers: adminHeaders });
    assert.strictEqual(fleetRes.status, 200);
    const fleetData = await fleetRes.json();
    assert.strictEqual(fleetData.success, true);
    assert.ok(fleetData.data.hasOwnProperty('utilizationRate'));

    // 2. Download Vehicles CSV
    const csvRes = await fetch(`${baseUrl}/api/v1/reports/export/vehicles`, { headers: adminHeaders });
    assert.strictEqual(csvRes.status, 200);
    assert.strictEqual(csvRes.headers.get('content-type'), 'text/csv; charset=utf-8');
    const csvContent = await csvRes.text();
    assert.ok(csvContent.includes('registrationNumber'));
  });
});
