import { prisma } from '../config/db.js';

/**
 * Generates report data summarizing vehicle metrics, ROI, and maintenance overheads
 */
export const getVehiclesReport = async () => {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      trips: { select: { revenue: true, fuelUsed: true } },
      maintenanceLogs: { select: { cost: true } },
      fuelLogs: { select: { totalCost: true } },
      expenses: { select: { amount: true } }
    }
  });

  return vehicles.map(v => {
    const totalTrips = v.trips.length;
    const totalRevenue = v.trips.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const totalFuelCost = v.fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
    const totalMaintenanceCost = v.maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const totalExpenses = v.expenses.reduce((sum, e) => sum + e.amount, 0);
    const operationalCost = totalFuelCost + totalMaintenanceCost + totalExpenses;
    const netProfit = totalRevenue - operationalCost;
    const roi = operationalCost > 0 ? (netProfit / operationalCost) * 100 : 0;

    return {
      id: v.id,
      registrationNumber: v.registrationNumber,
      make: v.make,
      model: v.model,
      capacity: v.capacity,
      odometer: v.odometer,
      status: v.status,
      totalTrips,
      totalFuelCost: Math.round(totalFuelCost * 100) / 100,
      totalMaintenanceCost: Math.round(totalMaintenanceCost * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalOperationalCost: Math.round(operationalCost * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      roi: Math.round(roi * 100) / 100
    };
  });
};

/**
 * Generates report data summarizing driver scores, total routes, and operational costs
 */
export const getDriversReport = async () => {
  const drivers = await prisma.driver.findMany({
    include: {
      trips: { select: { revenue: true } },
      fuelLogs: { select: { totalCost: true } },
      expenses: { select: { amount: true } }
    }
  });

  return drivers.map(d => {
    const totalTrips = d.trips.length;
    const totalRevenue = d.trips.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const totalFuelCost = d.fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
    const totalExpenses = d.expenses.reduce((sum, e) => sum + e.amount, 0);
    const operationalCost = totalFuelCost + totalExpenses;
    const netProfit = totalRevenue - operationalCost;

    return {
      id: d.id,
      name: d.name,
      email: d.email,
      licenseNumber: d.licenseNumber,
      licenseExpiry: d.licenseExpiry.toISOString().split('T')[0],
      safetyScore: d.safetyScore,
      status: d.status,
      totalTrips,
      totalFuelCost: Math.round(totalFuelCost * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100
    };
  });
};

/**
 * Generates summary details of all dispatched, completed, or cancelled trips
 */
export const getTripsReport = async () => {
  const trips = await prisma.trip.findMany({
    include: {
      vehicle: { select: { registrationNumber: true } },
      driver: { select: { name: true } },
      expenses: { select: { amount: true } }
    }
  });

  return trips.map(t => {
    const distance = t.endOdometer ? (t.endOdometer - t.startOdometer) : 0;
    const tripExpenses = t.expenses.reduce((sum, e) => sum + e.amount, 0);
    const operationalCost = tripExpenses;
    const revenue = t.revenue || 0;
    const netProfit = revenue - operationalCost;
    const roi = operationalCost > 0 ? (netProfit / operationalCost) * 100 : 0;

    return {
      tripNumber: t.tripNumber,
      status: t.status,
      vehicleRegistration: t.vehicle?.registrationNumber || 'N/A',
      driverName: t.driver?.name || 'N/A',
      cargoWeight: t.cargoWeight,
      distance: Math.round(distance * 100) / 100,
      startTime: t.startTime ? t.startTime.toISOString() : '',
      endTime: t.endTime ? t.endTime.toISOString() : '',
      fuelUsed: t.fuelUsed || 0,
      revenue: Math.round(revenue * 100) / 100,
      operationalCost: Math.round(operationalCost * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      roi: Math.round(roi * 100) / 100
    };
  });
};

/**
 * Generates a high-level fleet operational costs and asset utilization summary
 */
export const getFleetReport = async () => {
  const [vehicles, drivers, trips, fuelLogs, maintenanceLogs, expenses] = await Promise.all([
    prisma.vehicle.findMany(),
    prisma.driver.findMany(),
    prisma.trip.findMany(),
    prisma.fuelLog.findMany(),
    prisma.maintenanceLog.findMany(),
    prisma.expense.findMany()
  ]);

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'ON_TRIP').length;
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const inShop = vehicles.filter(v => v.status === 'IN_SHOP').length;

  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === 'ON_TRIP').length;

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
  const totalMaintenanceCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalOperationalCost = totalFuelCost + totalMaintenanceCost + totalExpenses;

  const totalRevenue = trips.reduce((sum, t) => sum + (t.revenue || 0), 0);
  const netProfit = totalRevenue - totalOperationalCost;
  const roi = totalOperationalCost > 0 ? (netProfit / totalOperationalCost) * 100 : 0;

  const utilizationRate = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

  // Calculate average fuel efficiency
  const completedTrips = trips.filter(t => t.status === 'COMPLETED');
  const totalDistance = completedTrips.reduce((sum, t) => sum + ((t.endOdometer || 0) - t.startOdometer), 0);
  const totalFuelUsed = completedTrips.reduce((sum, t) => sum + (t.fuelUsed || 0), 0);
  const averageFuelEfficiency = totalFuelUsed > 0 ? (totalDistance / totalFuelUsed) : 0;

  return {
    totalVehicles,
    activeVehicles,
    availableVehicles,
    inShop,
    utilizationRate: Math.round(utilizationRate * 100) / 100,
    totalDrivers,
    activeDrivers,
    totalFuelCost: Math.round(totalFuelCost * 100) / 100,
    totalMaintenanceCost: Math.round(totalMaintenanceCost * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    totalOperationalCost: Math.round(totalOperationalCost * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    roi: Math.round(roi * 100) / 100,
    averageFuelEfficiency: Math.round(averageFuelEfficiency * 100) / 100
  };
};
