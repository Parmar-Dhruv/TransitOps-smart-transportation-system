import { prisma } from '../config/db.js';

/**
 * Computes all fleet operational KPIs
 */
export const getKPIs = async () => {
  // 1. Vehicle counts grouping
  const vehicleStats = await prisma.vehicle.groupBy({
    by: ['status'],
    _count: true
  });
  
  const statusMap = { AVAILABLE: 0, ON_TRIP: 0, IN_SHOP: 0, RETIRED: 0 };
  vehicleStats.forEach(stat => {
    statusMap[stat.status] = stat._count;
  });

  const totalActiveFleet = statusMap.AVAILABLE + statusMap.ON_TRIP + statusMap.IN_SHOP;
  const fleetUtilization = totalActiveFleet > 0 
    ? (statusMap.ON_TRIP / totalActiveFleet) * 100 
    : 0;

  // 2. Driver counts grouping
  const driverStats = await prisma.driver.groupBy({
    by: ['status'],
    _count: true
  });

  const driverMap = { AVAILABLE: 0, ON_TRIP: 0, OFF_DUTY: 0, SUSPENDED: 0 };
  driverStats.forEach(stat => {
    driverMap[stat.status] = stat._count;
  });

  // 3. Trip counts grouping
  const tripStats = await prisma.trip.groupBy({
    by: ['status'],
    _count: true
  });

  const tripMap = { DRAFT: 0, DISPATCHED: 0, COMPLETED: 0, CANCELLED: 0 };
  tripStats.forEach(stat => {
    tripMap[stat.status] = stat._count;
  });

  const tripsTotal = await prisma.trip.count();
  const completedTrips = tripMap.COMPLETED;
  const pendingTrips = tripMap.DRAFT + tripMap.DISPATCHED;

  // 4. Financial sum aggregates
  const fuelAggregate = await prisma.fuelLog.aggregate({
    _sum: { totalCost: true }
  });
  const totalFuelCost = fuelAggregate._sum.totalCost || 0;

  const maintenanceAggregate = await prisma.maintenanceLog.aggregate({
    _sum: { cost: true },
    _count: true
  });
  const totalMaintenanceCost = maintenanceAggregate._sum.cost || 0;
  const maintenanceCount = maintenanceAggregate._count || 0;

  const expenseAggregate = await prisma.expense.aggregate({
    _sum: { amount: true }
  });
  const totalExpensesCost = expenseAggregate._sum.amount || 0;

  const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpensesCost;

  // 5. Trip Revenue aggregates
  const tripRevenueAggregate = await prisma.trip.aggregate({
    _sum: { revenue: true, fuelUsed: true }
  });
  const totalRevenue = tripRevenueAggregate._sum.revenue || 0;
  const totalFuelUsed = tripRevenueAggregate._sum.fuelUsed || 0;

  // 6. ROI calculation: ((Revenue - Operational Cost) / Operational Cost) * 100
  const fleetROI = totalOperationalCost > 0 
    ? ((totalRevenue - totalOperationalCost) / totalOperationalCost) * 100 
    : 0;

  // 7. Fuel Efficiency calculation (Distance in KM / fuelUsed in Liters)
  const completedTripsList = await prisma.trip.findMany({
    where: { status: 'COMPLETED' },
    select: { startOdometer: true, endOdometer: true }
  });

  let totalDistance = 0;
  completedTripsList.forEach(t => {
    if (t.endOdometer) {
      totalDistance += (t.endOdometer - t.startOdometer);
    }
  });

  const averageFuelEfficiency = totalFuelUsed > 0 
    ? (totalDistance / totalFuelUsed) 
    : 0;

  return {
    activeVehicles: statusMap.ON_TRIP,
    availableVehicles: statusMap.AVAILABLE,
    vehiclesInShop: statusMap.IN_SHOP,
    retiredVehicles: statusMap.RETIRED,
    driversAvailable: driverMap.AVAILABLE,
    driversOnTrip: driverMap.ON_TRIP,
    tripsTotal,
    completedTrips,
    pendingTrips,
    maintenanceCount,
    totalFuelCost: Math.round(totalFuelCost * 100) / 100,
    totalMaintenanceCost: Math.round(totalMaintenanceCost * 100) / 100,
    totalOperationalCost: Math.round(totalOperationalCost * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    fleetUtilization: Math.round(fleetUtilization * 100) / 100,
    fleetROI: Math.round(fleetROI * 100) / 100,
    fuelEfficiency: Math.round(averageFuelEfficiency * 100) / 100
  };
};

/**
 * Aggregates monthly cost metrics for chart display
 */
export const getChartData = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [fuelLogs, maintenanceLogs, expenses, vehicleStatusCounts] = await Promise.all([
    prisma.fuelLog.findMany({
      where: { refuelDate: { gte: sixMonthsAgo } },
      select: { totalCost: true, refuelDate: true }
    }),
    prisma.maintenanceLog.findMany({
      where: { startDate: { gte: sixMonthsAgo } },
      select: { cost: true, startDate: true }
    }),
    prisma.expense.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true }
    }),
    prisma.vehicle.groupBy({
      by: ['status'],
      _count: true
    })
  ]);

  const monthlyCostsMap = {};
  const getMonthKey = (date) => new Date(date).toISOString().slice(0, 7); // Format: YYYY-MM

  fuelLogs.forEach(log => {
    const key = getMonthKey(log.refuelDate);
    monthlyCostsMap[key] = (monthlyCostsMap[key] || 0) + log.totalCost;
  });

  maintenanceLogs.forEach(log => {
    const key = getMonthKey(log.startDate);
    monthlyCostsMap[key] = (monthlyCostsMap[key] || 0) + log.cost;
  });

  expenses.forEach(log => {
    const key = getMonthKey(log.date);
    monthlyCostsMap[key] = (monthlyCostsMap[key] || 0) + log.amount;
  });

  const chartMonthlyCosts = Object.keys(monthlyCostsMap).sort().map(month => ({
    month,
    operationalCost: Math.round(monthlyCostsMap[month] * 100) / 100
  }));

  const vehicleDistribution = vehicleStatusCounts.map(count => ({
    status: count.status,
    count: count._count
  }));

  return {
    monthlyCosts: chartMonthlyCosts,
    vehicleDistribution
  };
};
