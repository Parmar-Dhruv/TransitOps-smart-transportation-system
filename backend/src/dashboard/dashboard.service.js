import { prisma } from '../config/db.js';

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;
const toNumber = (value) => Number(value || 0);

const getMonthRange = () => {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { monthStart, nextMonthStart };
};

const getStatusCountMap = (rows, keys) => {
  const result = {};
  keys.forEach((key) => {
    result[key] = 0;
  });
  rows.forEach((row) => {
    result[row.status] = toNumber(row._count?._all ?? row._count);
  });
  return result;
};

export const getKPIData = async () => {
  const { monthStart, nextMonthStart } = getMonthRange();

  const [
    vehicleStats,
    driverStats,
    tripStats,
    totalTrips,
    allFuelAgg,
    monthFuelAgg,
    allMaintenanceAgg,
    monthMaintenanceAgg,
    allExpenseAgg,
    allRevenueAgg,
    completedTripsForEfficiency
  ] = await Promise.all([
    prisma.vehicle.groupBy({ by: ['status'], _count: true }),
    prisma.driver.groupBy({ by: ['status'], _count: true }),
    prisma.trip.groupBy({ by: ['status'], _count: true }),
    prisma.trip.count(),
    prisma.fuelLog.aggregate({ _sum: { totalCost: true } }),
    prisma.fuelLog.aggregate({
      where: { refuelDate: { gte: monthStart, lt: nextMonthStart } },
      _sum: { totalCost: true }
    }),
    prisma.maintenanceLog.aggregate({ _sum: { cost: true } }),
    prisma.maintenanceLog.aggregate({
      where: { startDate: { gte: monthStart, lt: nextMonthStart } },
      _sum: { cost: true }
    }),
    prisma.expense.aggregate({ _sum: { amount: true } }),
    prisma.trip.aggregate({
      _sum: { revenue: true, fuelUsed: true },
      where: { status: 'COMPLETED' }
    }),
    prisma.trip.findMany({
      where: { status: 'COMPLETED', endOdometer: { not: null } },
      select: { startOdometer: true, endOdometer: true, fuelUsed: true }
    })
  ]);

  const vehicleMap = getStatusCountMap(vehicleStats, ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']);
  const driverMap = getStatusCountMap(driverStats, ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']);
  const tripMap = getStatusCountMap(tripStats, ['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED']);

  const totalVehicles = Object.values(vehicleMap).reduce((sum, count) => sum + count, 0);
  const totalDrivers = Object.values(driverMap).reduce((sum, count) => sum + count, 0);
  const activeFleetBase = vehicleMap.AVAILABLE + vehicleMap.ON_TRIP + vehicleMap.IN_SHOP;
  const fleetUtilization = activeFleetBase > 0 ? (vehicleMap.ON_TRIP / activeFleetBase) * 100 : 0;

  const fuelCostCurrentMonth = toNumber(monthFuelAgg._sum.totalCost);
  const maintenanceCostCurrentMonth = toNumber(monthMaintenanceAgg._sum.cost);

  const totalFuelCost = toNumber(allFuelAgg._sum.totalCost);
  const totalMaintenanceCost = toNumber(allMaintenanceAgg._sum.cost);
  const totalExpenses = toNumber(allExpenseAgg._sum.amount);
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenses;

  const revenue = toNumber(allRevenueAgg._sum.revenue);
  const profit = revenue - totalOperationalCost;
  const roi = totalOperationalCost > 0 ? (profit / totalOperationalCost) * 100 : 0;

  const efficiencyDistance = completedTripsForEfficiency.reduce((sum, trip) => {
    if (trip.endOdometer == null) return sum;
    return sum + Math.max(0, trip.endOdometer - trip.startOdometer);
  }, 0);
  const efficiencyFuelUsed = completedTripsForEfficiency.reduce((sum, trip) => {
    return sum + toNumber(trip.fuelUsed);
  }, 0);
  const averageFuelEfficiency = efficiencyFuelUsed > 0 ? efficiencyDistance / efficiencyFuelUsed : 0;

  return {
    totalVehicles,
    availableVehicles: vehicleMap.AVAILABLE,
    vehiclesOnTrip: vehicleMap.ON_TRIP,
    vehiclesInMaintenance: vehicleMap.IN_SHOP,
    retiredVehicles: vehicleMap.RETIRED,
    totalDrivers,
    driversAvailable: driverMap.AVAILABLE,
    driversOnTrip: driverMap.ON_TRIP,
    activeTrips: tripMap.DISPATCHED,
    completedTrips: tripMap.COMPLETED,
    pendingTrips: tripMap.DRAFT,
    cancelledTrips: tripMap.CANCELLED,
    totalTrips,
    fuelCostCurrentMonth: round2(fuelCostCurrentMonth),
    maintenanceCostCurrentMonth: round2(maintenanceCostCurrentMonth),
    totalOperationalCost: round2(totalOperationalCost),
    fleetUtilizationPercent: round2(fleetUtilization),
    averageFuelEfficiency: round2(averageFuelEfficiency),
    revenue: round2(revenue),
    profit: round2(profit),
    roiPercent: round2(roi)
  };
};

export const getFleetAnalytics = async () => {
  const stats = await prisma.vehicle.groupBy({
    by: ['status'],
    _count: true
  });
  const statusMap = getStatusCountMap(stats, ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']);
  const total = Object.values(statusMap).reduce((sum, value) => sum + value, 0);

  return {
    total,
    available: statusMap.AVAILABLE,
    onTrip: statusMap.ON_TRIP,
    maintenance: statusMap.IN_SHOP,
    retired: statusMap.RETIRED,
    distribution: [
      { status: 'AVAILABLE', count: statusMap.AVAILABLE },
      { status: 'ON_TRIP', count: statusMap.ON_TRIP },
      { status: 'IN_SHOP', count: statusMap.IN_SHOP },
      { status: 'RETIRED', count: statusMap.RETIRED }
    ]
  };
};

export const getTripAnalytics = async () => {
  const [dailyRows, weeklyRows, monthlyRows] = await Promise.all([
    prisma.$queryRaw`
      SELECT to_char(date_trunc('day', COALESCE("startTime", "createdAt")), 'YYYY-MM-DD') AS period, COUNT(*)::int AS count
      FROM "Trip"
      WHERE COALESCE("startTime", "createdAt") >= NOW() - INTERVAL '30 days'
      GROUP BY date_trunc('day', COALESCE("startTime", "createdAt"))
      ORDER BY date_trunc('day', COALESCE("startTime", "createdAt")) ASC
    `,
    prisma.$queryRaw`
      SELECT to_char(date_trunc('week', COALESCE("startTime", "createdAt")), 'IYYY-"W"IW') AS period, COUNT(*)::int AS count
      FROM "Trip"
      WHERE COALESCE("startTime", "createdAt") >= NOW() - INTERVAL '16 weeks'
      GROUP BY date_trunc('week', COALESCE("startTime", "createdAt"))
      ORDER BY date_trunc('week', COALESCE("startTime", "createdAt")) ASC
    `,
    prisma.$queryRaw`
      SELECT to_char(date_trunc('month', COALESCE("startTime", "createdAt")), 'YYYY-MM') AS period, COUNT(*)::int AS count
      FROM "Trip"
      WHERE COALESCE("startTime", "createdAt") >= NOW() - INTERVAL '12 months'
      GROUP BY date_trunc('month', COALESCE("startTime", "createdAt"))
      ORDER BY date_trunc('month', COALESCE("startTime", "createdAt")) ASC
    `
  ]);

  return {
    tripsPerDay: dailyRows.map((row) => ({ period: row.period, count: toNumber(row.count) })),
    tripsPerWeek: weeklyRows.map((row) => ({ period: row.period, count: toNumber(row.count) })),
    tripsPerMonth: monthlyRows.map((row) => ({ period: row.period, count: toNumber(row.count) }))
  };
};

export const getRevenueAnalytics = async () => {
  const [revenueRows, expenseRows, fuelRows, maintenanceRows] = await Promise.all([
    prisma.$queryRaw`
      SELECT to_char(date_trunc('month', COALESCE("endTime", "updatedAt", "createdAt")), 'YYYY-MM') AS month, COALESCE(SUM("revenue"), 0) AS value
      FROM "Trip"
      WHERE COALESCE("endTime", "updatedAt", "createdAt") >= NOW() - INTERVAL '12 months'
      GROUP BY date_trunc('month', COALESCE("endTime", "updatedAt", "createdAt"))
      ORDER BY date_trunc('month', COALESCE("endTime", "updatedAt", "createdAt")) ASC
    `,
    prisma.$queryRaw`
      SELECT to_char(date_trunc('month', "date"), 'YYYY-MM') AS month, COALESCE(SUM("amount"), 0) AS value
      FROM "Expense"
      WHERE "date" >= NOW() - INTERVAL '12 months'
      GROUP BY date_trunc('month', "date")
      ORDER BY date_trunc('month', "date") ASC
    `,
    prisma.$queryRaw`
      SELECT to_char(date_trunc('month', "refuelDate"), 'YYYY-MM') AS month, COALESCE(SUM("totalCost"), 0) AS value
      FROM "FuelLog"
      WHERE "refuelDate" >= NOW() - INTERVAL '12 months'
      GROUP BY date_trunc('month', "refuelDate")
      ORDER BY date_trunc('month', "refuelDate") ASC
    `,
    prisma.$queryRaw`
      SELECT to_char(date_trunc('month', "startDate"), 'YYYY-MM') AS month, COALESCE(SUM("cost"), 0) AS value
      FROM "MaintenanceLog"
      WHERE "startDate" >= NOW() - INTERVAL '12 months'
      GROUP BY date_trunc('month', "startDate")
      ORDER BY date_trunc('month', "startDate") ASC
    `
  ]);

  const monthMap = new Map();
  const ensureMonth = (month) => {
    if (!monthMap.has(month)) {
      monthMap.set(month, { month, revenue: 0, expenses: 0, profit: 0 });
    }
    return monthMap.get(month);
  };

  revenueRows.forEach((row) => {
    const bucket = ensureMonth(row.month);
    bucket.revenue = round2(row.value);
  });

  expenseRows.forEach((row) => {
    const bucket = ensureMonth(row.month);
    bucket.expenses += round2(row.value);
  });
  fuelRows.forEach((row) => {
    const bucket = ensureMonth(row.month);
    bucket.expenses += round2(row.value);
  });
  maintenanceRows.forEach((row) => {
    const bucket = ensureMonth(row.month);
    bucket.expenses += round2(row.value);
  });

  const series = Array.from(monthMap.values())
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => ({
      ...item,
      expenses: round2(item.expenses),
      profit: round2(item.revenue - item.expenses)
    }));

  return {
    monthly: series
  };
};

export const getFuelAnalytics = async () => {
  const { monthStart, nextMonthStart } = getMonthRange();

  const [monthFuelAgg, completedTrips] = await Promise.all([
    prisma.fuelLog.aggregate({
      where: { refuelDate: { gte: monthStart, lt: nextMonthStart } },
      _sum: { liters: true, totalCost: true },
      _avg: { costPerLiter: true }
    }),
    prisma.trip.findMany({
      where: {
        status: 'COMPLETED',
        endOdometer: { not: null },
        endTime: { gte: monthStart, lt: nextMonthStart }
      },
      select: {
        startOdometer: true,
        endOdometer: true,
        fuelUsed: true
      }
    })
  ]);

  const totalFuelConsumption = toNumber(monthFuelAgg._sum.liters);
  const totalFuelCost = toNumber(monthFuelAgg._sum.totalCost);

  const totalDistance = completedTrips.reduce((sum, trip) => {
    if (trip.endOdometer == null) return sum;
    return sum + Math.max(0, trip.endOdometer - trip.startOdometer);
  }, 0);

  const avgMileage = totalFuelConsumption > 0 ? totalDistance / totalFuelConsumption : 0;
  const costPerKm = totalDistance > 0 ? totalFuelCost / totalDistance : 0;

  return {
    fuelConsumption: round2(totalFuelConsumption),
    fuelCost: round2(totalFuelCost),
    averageMileage: round2(avgMileage),
    costPerKm: round2(costPerKm),
    averageCostPerLiter: round2(monthFuelAgg._avg.costPerLiter)
  };
};

export const getMaintenanceAnalytics = async () => {
  const [statusStats, vehiclesInShop] = await Promise.all([
    prisma.maintenanceLog.groupBy({
      by: ['status'],
      _count: true
    }),
    prisma.vehicle.count({
      where: { status: 'IN_SHOP' }
    })
  ]);

  const statusMap = getStatusCountMap(statusStats, ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']);

  return {
    scheduled: statusMap.SCHEDULED,
    ongoing: statusMap.IN_PROGRESS,
    completed: statusMap.COMPLETED,
    vehiclesInShop
  };
};

export const getExpenseBreakdown = async () => {
  const [expenseByCategory, fuelAgg, maintenanceAgg] = await Promise.all([
    prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true }
    }),
    prisma.fuelLog.aggregate({ _sum: { totalCost: true } }),
    prisma.maintenanceLog.aggregate({ _sum: { cost: true } })
  ]);

  const breakdown = {
    FUEL: toNumber(fuelAgg._sum.totalCost),
    MAINTENANCE: toNumber(maintenanceAgg._sum.cost),
    REPAIRS: 0,
    INSURANCE: 0,
    PARKING: 0,
    TOLL: 0,
    MISCELLANEOUS: 0
  };

  expenseByCategory.forEach((entry) => {
    const value = toNumber(entry._sum.amount);
    switch (entry.category) {
      case 'REPAIR':
        breakdown.REPAIRS += value;
        break;
      case 'INSURANCE':
        breakdown.INSURANCE += value;
        break;
      case 'PARKING':
        breakdown.PARKING += value;
        break;
      case 'TOLL':
        breakdown.TOLL += value;
        break;
      case 'MAINTENANCE':
        breakdown.MAINTENANCE += value;
        break;
      default:
        breakdown.MISCELLANEOUS += value;
    }
  });

  const categories = Object.entries(breakdown).map(([category, amount]) => ({
    category,
    amount: round2(amount)
  }));

  return {
    categories
  };
};

const getAuditUserMap = async (entityName, entityIds) => {
  if (!entityIds.length) {
    return new Map();
  }

  const logs = await prisma.auditLog.findMany({
    where: {
      entityName,
      entityId: { in: entityIds }
    },
    orderBy: { timestamp: 'desc' },
    select: {
      entityId: true,
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  const byEntity = new Map();
  logs.forEach((log) => {
    if (log.entityId && !byEntity.has(log.entityId)) {
      byEntity.set(log.entityId, log.user || null);
    }
  });
  return byEntity;
};

export const getRecentActivity = async () => {
  const [trips, maintenances, fuels, expenses] = await Promise.all([
    prisma.trip.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        vehicle: { select: { registrationNumber: true } },
        driver: { select: { name: true } },
        dispatcher: { select: { id: true, name: true, email: true } }
      }
    }),
    prisma.maintenanceLog.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        vehicle: { select: { registrationNumber: true } }
      }
    }),
    prisma.fuelLog.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        vehicle: { select: { registrationNumber: true } },
        driver: { select: { name: true } }
      }
    }),
    prisma.expense.findMany({
      take: 10,
      orderBy: { updatedAt: 'desc' },
      include: {
        vehicle: { select: { registrationNumber: true } },
        driver: { select: { name: true } }
      }
    })
  ]);

  const [tripUsers, maintenanceUsers, fuelUsers, expenseUsers] = await Promise.all([
    getAuditUserMap('Trip', trips.map((item) => item.id)),
    getAuditUserMap('MaintenanceLog', maintenances.map((item) => item.id)),
    getAuditUserMap('FuelLog', fuels.map((item) => item.id)),
    getAuditUserMap('Expense', expenses.map((item) => item.id))
  ]);

  const merged = [
    ...trips.map((item) => ({
      id: item.id,
      entityType: 'TRIP',
      timestamp: item.updatedAt,
      vehicle: item.vehicle?.registrationNumber || '—',
      driver: item.driver?.name || '—',
      status: item.status,
      user: tripUsers.get(item.id) || item.dispatcher || null
    })),
    ...maintenances.map((item) => ({
      id: item.id,
      entityType: 'MAINTENANCE',
      timestamp: item.updatedAt,
      vehicle: item.vehicle?.registrationNumber || '—',
      driver: '—',
      status: item.status,
      user: maintenanceUsers.get(item.id) || null
    })),
    ...fuels.map((item) => ({
      id: item.id,
      entityType: 'FUEL',
      timestamp: item.updatedAt,
      vehicle: item.vehicle?.registrationNumber || '—',
      driver: item.driver?.name || '—',
      status: 'RECORDED',
      user: fuelUsers.get(item.id) || null
    })),
    ...expenses.map((item) => ({
      id: item.id,
      entityType: 'EXPENSE',
      timestamp: item.updatedAt,
      vehicle: item.vehicle?.registrationNumber || '—',
      driver: item.driver?.name || '—',
      status: item.category,
      user: expenseUsers.get(item.id) || null
    }))
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)
    .map((item) => ({
      ...item,
      timestamp: item.timestamp.toISOString()
    }));

  return {
    items: merged
  };
};

export const getAlerts = async () => {
  const now = new Date();
  const thirtyDaysLater = new Date(now);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const sevenDaysLater = new Date(now);
  sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { monthStart, nextMonthStart } = getMonthRange();
  const prevMonthStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1));

  const [
    overdueMaintenance,
    soonExpiringLicenses,
    criticalExpiringLicenses,
    inactiveVehicleCount,
    currentMonthExpenses,
    previousMonthExpenses,
    vehicleStats,
    highConsumptionVehicles
  ] = await Promise.all([
    prisma.maintenanceLog.count({
      where: {
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        startDate: { lt: sevenDaysAgo }
      }
    }),
    prisma.driver.count({
      where: { licenseExpiry: { gte: now, lte: thirtyDaysLater } }
    }),
    prisma.driver.count({
      where: { licenseExpiry: { gte: now, lte: sevenDaysLater } }
    }),
    prisma.vehicle.count({
      where: {
        status: { not: 'RETIRED' },
        trips: {
          none: {
            OR: [
              { endTime: { gte: fourteenDaysAgo } },
              { startTime: { gte: fourteenDaysAgo } },
              { createdAt: { gte: fourteenDaysAgo } }
            ]
          }
        }
      }
    }),
    prisma.expense.aggregate({
      where: { date: { gte: monthStart, lt: nextMonthStart } },
      _sum: { amount: true }
    }),
    prisma.expense.aggregate({
      where: { date: { gte: prevMonthStart, lt: monthStart } },
      _sum: { amount: true }
    }),
    prisma.vehicle.groupBy({ by: ['status'], _count: true }),
    prisma.$queryRaw`
      SELECT
        t."vehicleId" AS "vehicleId",
        COALESCE(SUM(f."liters"), 0) AS liters,
        COALESCE(SUM(t."endOdometer" - t."startOdometer"), 0) AS distance
      FROM "Trip" t
      LEFT JOIN "FuelLog" f ON f."vehicleId" = t."vehicleId" AND f."refuelDate" >= ${monthStart} AND f."refuelDate" < ${nextMonthStart}
      WHERE t."status" = 'COMPLETED'
        AND t."endOdometer" IS NOT NULL
        AND COALESCE(t."endTime", t."updatedAt", t."createdAt") >= ${monthStart}
        AND COALESCE(t."endTime", t."updatedAt", t."createdAt") < ${nextMonthStart}
      GROUP BY t."vehicleId"
      HAVING COALESCE(SUM(t."endOdometer" - t."startOdometer"), 0) > 0
    `
  ]);

  const vehicleMap = getStatusCountMap(vehicleStats, ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']);
  const activeFleet = vehicleMap.AVAILABLE + vehicleMap.ON_TRIP + vehicleMap.IN_SHOP;
  const availabilityPct = activeFleet > 0 ? (vehicleMap.AVAILABLE / activeFleet) * 100 : 0;

  const current = toNumber(currentMonthExpenses._sum.amount);
  const previous = toNumber(previousMonthExpenses._sum.amount);

  const highConsumptionCount = highConsumptionVehicles.filter((row) => {
    const liters = toNumber(row.liters);
    const distance = toNumber(row.distance);
    if (liters <= 0 || distance <= 0) return false;
    const litersPer100Km = (liters / distance) * 100;
    return litersPer100Km > 25;
  }).length;

  const alerts = [];

  if (overdueMaintenance > 0) {
    alerts.push({
      id: 'maintenance-overdue',
      severity: overdueMaintenance > 5 ? 'CRITICAL' : 'WARNING',
      title: 'Vehicle overdue for maintenance',
      message: `${overdueMaintenance} maintenance job(s) are past due.`,
      metric: overdueMaintenance
    });
  }

  if (soonExpiringLicenses > 0) {
    alerts.push({
      id: 'driver-license-expiry',
      severity: criticalExpiringLicenses > 0 ? 'CRITICAL' : 'WARNING',
      title: 'Driver license expiring soon',
      message: `${soonExpiringLicenses} driver license(s) expire within 30 days.`,
      metric: soonExpiringLicenses
    });
  }

  if (inactiveVehicleCount > 0) {
    alerts.push({
      id: 'vehicle-inactive',
      severity: inactiveVehicleCount > 3 ? 'WARNING' : 'INFO',
      title: 'Vehicle inactive for many days',
      message: `${inactiveVehicleCount} non-retired vehicle(s) have no trip activity in the last 14 days.`,
      metric: inactiveVehicleCount
    });
  }

  if (highConsumptionCount > 0) {
    alerts.push({
      id: 'high-fuel-consumption',
      severity: highConsumptionCount > 2 ? 'WARNING' : 'INFO',
      title: 'High fuel consumption detected',
      message: `${highConsumptionCount} vehicle(s) crossed high fuel consumption thresholds this month.`,
      metric: highConsumptionCount
    });
  }

  if (previous > 0 && current > previous * 1.25) {
    alerts.push({
      id: 'excessive-expenses',
      severity: current > previous * 1.5 ? 'CRITICAL' : 'WARNING',
      title: 'Excessive expenses',
      message: `Current month expenses are ${round2(((current - previous) / previous) * 100)}% higher than last month.`,
      metric: round2(current - previous)
    });
  }

  if (availabilityPct < 30) {
    alerts.push({
      id: 'low-fleet-availability',
      severity: availabilityPct < 20 ? 'CRITICAL' : 'WARNING',
      title: 'Low fleet availability',
      message: `Only ${round2(availabilityPct)}% of active fleet is available.`,
      metric: round2(availabilityPct)
    });
  }

  return {
    items: alerts
  };
};

export const searchDashboardEntities = async (query) => {
  const trimmed = query.trim();
  if (!trimmed) {
    return { vehicles: [], drivers: [], trips: [] };
  }

  const [vehicles, drivers, trips] = await Promise.all([
    prisma.vehicle.findMany({
      where: {
        OR: [
          { registrationNumber: { contains: trimmed.toUpperCase() } },
          { make: { contains: trimmed, mode: 'insensitive' } },
          { model: { contains: trimmed, mode: 'insensitive' } }
        ]
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        registrationNumber: true,
        make: true,
        model: true,
        status: true
      }
    }),
    prisma.driver.findMany({
      where: {
        OR: [
          { name: { contains: trimmed, mode: 'insensitive' } },
          { licenseNumber: { contains: trimmed.toUpperCase() } },
          { email: { contains: trimmed, mode: 'insensitive' } }
        ]
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        licenseNumber: true,
        status: true
      }
    }),
    prisma.trip.findMany({
      where: {
        OR: [
          { tripNumber: { contains: trimmed, mode: 'insensitive' } },
          { routeDetails: { contains: trimmed, mode: 'insensitive' } }
        ]
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        vehicle: { select: { registrationNumber: true } },
        driver: { select: { name: true } }
      }
    })
  ]);

  return {
    vehicles,
    drivers,
    trips
  };
};

export const getDashboardOverview = async () => {
  const [kpis, fleet, trip, revenue, fuel, maintenance, expense, recentActivity, alerts] = await Promise.all([
    getKPIData(),
    getFleetAnalytics(),
    getTripAnalytics(),
    getRevenueAnalytics(),
    getFuelAnalytics(),
    getMaintenanceAnalytics(),
    getExpenseBreakdown(),
    getRecentActivity(),
    getAlerts()
  ]);

  return {
    kpis,
    fleet,
    trip,
    revenue,
    fuel,
    maintenance,
    expense,
    recentActivity,
    alerts
  };
};

// Backward compatibility for existing tests/routes.
export const getKPIs = getKPIData;
export const getChartData = async () => {
  const [revenue, fleet] = await Promise.all([getRevenueAnalytics(), getFleetAnalytics()]);
  return {
    monthlyCosts: revenue.monthly.map((item) => ({
      month: item.month,
      operationalCost: item.expenses
    })),
    vehicleDistribution: fleet.distribution.map((item) => ({
      status: item.status,
      count: item.count
    }))
  };
};
