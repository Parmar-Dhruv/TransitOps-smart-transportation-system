import app from '../src/app.js';
import { prisma } from '../src/config/db.js';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';

let server;
export let baseUrl;

/**
 * Boots the Express server for the duration of the test suite
 */
export const startTestServer = () => {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
};

/**
 * Shuts down the test server and disconnects Prisma
 */
export const stopTestServer = async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await prisma.$disconnect();
};

/**
 * Generates authentication headers for ADMIN role
 */
export const getAdminHeaders = async () => {
  let admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'testadmin@transitops.com',
        password: 'hashedpassword',
        name: 'Test Admin',
        role: 'ADMIN'
      }
    });
  }

  const token = jwt.sign(
    { id: admin.id, email: admin.email, role: admin.role },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Generates authentication headers for DISPATCHER role
 */
export const getDispatcherHeaders = async () => {
  let dispatcher = await prisma.user.findFirst({
    where: { role: 'DISPATCHER' }
  });
  
  if (!dispatcher) {
    dispatcher = await prisma.user.create({
      data: {
        email: 'testdispatcher@transitops.com',
        password: 'hashedpassword',
        name: 'Test Dispatcher',
        role: 'DISPATCHER'
      }
    });
  }

  const token = jwt.sign(
    { id: dispatcher.id, email: dispatcher.email, role: dispatcher.role },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Creates a unique mock vehicle in the DB
 */
export const createMockVehicle = async () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return await prisma.vehicle.create({
    data: {
      registrationNumber: `TST-MH-${rand}`,
      make: 'Volvo',
      model: 'FMX',
      year: 2024,
      capacity: 35000,
      odometer: 1000
    }
  });
};

/**
 * Creates a unique mock driver in the DB
 */
export const createMockDriver = async () => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return await prisma.driver.create({
    data: {
      name: 'Safe Driver Sam',
      email: `driver_${rand}@testing.com`,
      phone: '+15550999',
      licenseNumber: `DL-TEST-${rand}`,
      licenseExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year future
      safetyScore: 95
    }
  });
};
