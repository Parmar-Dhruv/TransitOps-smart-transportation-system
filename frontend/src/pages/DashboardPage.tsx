import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  AlertTriangle,
  Clock3,
  Gauge,
  Info,
  RefreshCw,
  Search,
  Siren,
  Truck
} from "lucide-react";
import { dashboardApi } from "../api/dashboard.api";
import { Button } from "../components/common/Button";
import { EmptyState } from "../components/common/EmptyState";
import { Skeleton } from "../components/common/Skeleton";
import { getAccessibleDashboardShortcuts, hasActionAccess } from "../config/permissions";
import { useAuth } from "../hooks/useAuth";
import type { Role } from "../types";

const ROLE_SECTION_ACCESS: Record<Role, string[]> = {
  ADMIN: ["kpis", "fleet", "trip", "revenue", "fuel", "maintenance", "expense", "activity", "alerts", "search", "quickActions"],
  FLEET_MANAGER: ["kpis", "fleet", "trip", "revenue", "fuel", "maintenance", "activity", "alerts", "search", "quickActions"],
  DISPATCHER: ["kpis", "fleet", "trip", "activity", "alerts", "search", "quickActions"],
  SAFETY_OFFICER: ["kpis", "fleet", "maintenance", "activity", "alerts", "search"],
  FINANCIAL_ANALYST: ["kpis", "revenue", "fuel", "expense", "activity", "alerts", "search", "quickActions"]
};

const PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#a855f7", "#ef4444", "#14b8a6", "#f97316"];

const formatCurrency = (value: number) =>
  `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatPercent = (value: number) => `${Number(value || 0).toFixed(2)}%`;

const isSectionVisible = (role: Role | undefined, section: string) => {
  if (!role) return false;
  return ROLE_SECTION_ACCESS[role].includes(section);
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const dashboardQuery = useQuery({
    queryKey: ["dashboard", "command-center"],
    queryFn: async () => {
      const [dashboardRes, fleetRes, tripRes, revenueRes, fuelRes, maintenanceRes, expenseRes, activityRes, alertsRes] =
        await Promise.all([
          dashboardApi.getDashboard(),
          dashboardApi.getFleetAnalytics(),
          dashboardApi.getTripAnalytics(),
          dashboardApi.getRevenueAnalytics(),
          dashboardApi.getFuelAnalytics(),
          dashboardApi.getMaintenanceAnalytics(),
          dashboardApi.getExpenseBreakdown(),
          dashboardApi.getRecentActivity(),
          dashboardApi.getAlerts()
        ]);

      return {
        kpis: dashboardRes.data?.data?.kpis ?? {},
        fleet: fleetRes.data?.data ?? dashboardRes.data?.data?.fleet ?? {},
        trip: tripRes.data?.data ?? dashboardRes.data?.data?.trip ?? {},
        revenue: revenueRes.data?.data ?? dashboardRes.data?.data?.revenue ?? {},
        fuel: fuelRes.data?.data ?? dashboardRes.data?.data?.fuel ?? {},
        maintenance: maintenanceRes.data?.data ?? dashboardRes.data?.data?.maintenance ?? {},
        expense: expenseRes.data?.data ?? dashboardRes.data?.data?.expense ?? {},
        recentActivity: activityRes.data?.data ?? dashboardRes.data?.data?.recentActivity ?? {},
        alerts: alertsRes.data?.data ?? dashboardRes.data?.data?.alerts ?? {}
      };
    },
    staleTime: 60_000,
    refetchInterval: 30_000
  });

  const searchQuery = useQuery({
    queryKey: ["dashboard", "search", searchTerm],
    queryFn: async () => {
      const res = await dashboardApi.search(searchTerm);
      return res.data?.data ?? { vehicles: [], drivers: [], trips: [] };
    },
    enabled: searchTerm.trim().length >= 2,
    staleTime: 15_000
  });

  const shortcuts = getAccessibleDashboardShortcuts(user?.role);
  const data = dashboardQuery.data;
  const kpis = data?.kpis || {};

  const quickActions = useMemo(() => {
    const actions = [];
    if (hasActionAccess(user?.role, "vehicles", "create")) actions.push({ id: "add-vehicle", label: "Add Vehicle", path: "/vehicles" });
    if (hasActionAccess(user?.role, "drivers", "create")) actions.push({ id: "add-driver", label: "Add Driver", path: "/drivers" });
    if (hasActionAccess(user?.role, "trips", "create")) actions.push({ id: "create-trip", label: "Create Trip", path: "/trips" });
    if (hasActionAccess(user?.role, "trips", "dispatch")) actions.push({ id: "dispatch-trip", label: "Dispatch Trip", path: "/trips" });
    if (hasActionAccess(user?.role, "maintenance", "create")) actions.push({ id: "schedule-maintenance", label: "Schedule Maintenance", path: "/maintenance" });
    if (hasActionAccess(user?.role, "expenses", "create")) actions.push({ id: "add-expense", label: "Add Expense", path: "/expenses" });
    return actions;
  }, [user?.role]);

  const kpiCards = [
    { id: "totalVehicles", title: "Total Vehicles", value: kpis.totalVehicles, roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"] },
    { id: "availableVehicles", title: "Available Vehicles", value: kpis.availableVehicles, roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"] },
    { id: "vehiclesOnTrip", title: "Vehicles On Trip", value: kpis.vehiclesOnTrip, roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"] },
    { id: "vehiclesInMaintenance", title: "Vehicles In Maintenance", value: kpis.vehiclesInMaintenance, roles: ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER"] },
    { id: "retiredVehicles", title: "Retired Vehicles", value: kpis.retiredVehicles, roles: ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER"] },
    { id: "totalDrivers", title: "Total Drivers", value: kpis.totalDrivers, roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"] },
    { id: "driversAvailable", title: "Drivers Available", value: kpis.driversAvailable, roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"] },
    { id: "driversOnTrip", title: "Drivers On Trip", value: kpis.driversOnTrip, roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"] },
    { id: "activeTrips", title: "Active Trips", value: kpis.activeTrips, roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"] },
    { id: "completedTrips", title: "Completed Trips", value: kpis.completedTrips, roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"] },
    { id: "pendingTrips", title: "Pending Trips", value: kpis.pendingTrips, roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"] },
    { id: "cancelledTrips", title: "Cancelled Trips", value: kpis.cancelledTrips, roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER"] },
    { id: "fuelCostCurrentMonth", title: "Fuel Cost (Current Month)", value: formatCurrency(kpis.fuelCostCurrentMonth), roles: ["ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST"] },
    { id: "maintenanceCostCurrentMonth", title: "Maintenance Cost (Current Month)", value: formatCurrency(kpis.maintenanceCostCurrentMonth), roles: ["ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST"] },
    { id: "totalOperationalCost", title: "Total Operational Cost", value: formatCurrency(kpis.totalOperationalCost), roles: ["ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST"] },
    { id: "fleetUtilizationPercent", title: "Fleet Utilization %", value: formatPercent(kpis.fleetUtilizationPercent), roles: ["ADMIN", "FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER"] },
    { id: "averageFuelEfficiency", title: "Average Fuel Efficiency", value: `${Number(kpis.averageFuelEfficiency || 0).toFixed(2)} km/L`, roles: ["ADMIN", "FLEET_MANAGER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"] },
    { id: "revenue", title: "Revenue", value: formatCurrency(kpis.revenue), roles: ["ADMIN", "FINANCIAL_ANALYST"] },
    { id: "profit", title: "Profit", value: formatCurrency(kpis.profit), roles: ["ADMIN", "FINANCIAL_ANALYST"] },
    { id: "roiPercent", title: "ROI", value: formatPercent(kpis.roiPercent), roles: ["ADMIN", "FINANCIAL_ANALYST"] }
  ].filter((card) => !user?.role || card.roles.includes(user.role));

  if (dashboardQuery.isError) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <EmptyState
          icon={AlertTriangle}
          title="Unable to load dashboard"
          description="The dashboard API is currently unavailable."
          actionLabel="Retry"
          onAction={() => dashboardQuery.refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TransitOps Command Center</h1>
          <p className="text-sm text-muted-foreground">Live dashboard powered by operational backend aggregates.</p>
        </div>
        <Button variant="premium" onClick={() => dashboardQuery.refetch()} isLoading={dashboardQuery.isFetching}>
          {!dashboardQuery.isFetching && <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {isSectionVisible(user?.role, "search") && (
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Global Search</h2>
          </div>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search vehicles, drivers, or trips..."
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {searchTerm.trim().length >= 2 && (
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {[
                { title: "Vehicles", list: searchQuery.data?.vehicles || [], key: "registrationNumber" },
                { title: "Drivers", list: searchQuery.data?.drivers || [], key: "name" },
                { title: "Trips", list: searchQuery.data?.trips || [], key: "tripNumber" }
              ].map((group) => (
                <div key={group.title} className="rounded-lg border bg-background/50 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group.title}</p>
                  <div className="space-y-1.5">
                    {group.list.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No matches</p>
                    ) : (
                      group.list.map((item: any) => (
                        <p key={item.id} className="truncate text-sm">{item[group.key]}</p>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {isSectionVisible(user?.role, "quickActions") && quickActions.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Link key={action.id} to={action.path}>
                <Button size="sm" variant="outline">{action.label}</Button>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.id} to={item.path} className="rounded-xl border bg-card p-4 transition hover:border-primary/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                </div>
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </Link>
          );
        })}
      </div>

      {isSectionVisible(user?.role, "kpis") && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardQuery.isLoading
            ? Array.from({ length: 12 }).map((_, idx) => <Skeleton key={idx} className="h-24 w-full rounded-xl" />)
            : kpiCards.map((card) => (
                <div key={card.id} className="rounded-xl border bg-card p-4">
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  <p className="mt-2 text-xl font-semibold">{card.value ?? 0}</p>
                </div>
              ))}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {isSectionVisible(user?.role, "fleet") && (
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-1 text-lg font-semibold">Fleet Status</h3>
            <p className="mb-4 text-xs text-muted-foreground">Real-time vehicle status distribution.</p>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (data?.fleet?.distribution || []).length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data?.fleet?.distribution || []} dataKey="count" nameKey="status" outerRadius={95} label>
                    {(data?.fleet?.distribution || []).map((_: any, index: number) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Truck} title="No fleet data" description="No vehicle status data available yet." />
            )}
          </div>
        )}

        {isSectionVisible(user?.role, "trip") && (
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-1 text-lg font-semibold">Trip Analytics</h3>
            <p className="mb-4 text-xs text-muted-foreground">Trips per day, week, and month.</p>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <div className="space-y-4">
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.trip?.tripsPerDay || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Per Day" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.trip?.tripsPerWeek || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#22c55e" name="Per Week" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.trip?.tripsPerMonth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#a855f7" name="Per Month" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {isSectionVisible(user?.role, "revenue") && (
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-1 text-lg font-semibold">Revenue Analytics</h3>
            <p className="mb-4 text-xs text-muted-foreground">Monthly revenue, expenses, and profit.</p>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data?.revenue?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#16a34a" />
                  <Bar dataKey="expenses" fill="#ef4444" />
                  <Bar dataKey="profit" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {isSectionVisible(user?.role, "expense") && (
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-1 text-lg font-semibold">Expense Breakdown</h3>
            <p className="mb-4 text-xs text-muted-foreground">Fuel, maintenance, repairs, insurance, parking, toll, and misc.</p>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={data?.expense?.categories || []} dataKey="amount" nameKey="category" outerRadius={95} label>
                    {(data?.expense?.categories || []).map((_: any, index: number) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value || 0))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {isSectionVisible(user?.role, "fuel") && (
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-lg font-semibold">Fuel Analytics</h3>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-36 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Fuel Consumption</p><p className="mt-1 font-semibold">{Number(data?.fuel?.fuelConsumption || 0).toFixed(2)} L</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Fuel Cost</p><p className="mt-1 font-semibold">{formatCurrency(data?.fuel?.fuelCost || 0)}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Average Mileage</p><p className="mt-1 font-semibold">{Number(data?.fuel?.averageMileage || 0).toFixed(2)} km/L</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Cost per KM</p><p className="mt-1 font-semibold">{formatCurrency(data?.fuel?.costPerKm || 0)}</p></div>
              </div>
            )}
          </div>
        )}

        {isSectionVisible(user?.role, "maintenance") && (
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-lg font-semibold">Maintenance Analytics</h3>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-36 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Scheduled</p><p className="mt-1 font-semibold">{data?.maintenance?.scheduled || 0}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Ongoing</p><p className="mt-1 font-semibold">{data?.maintenance?.ongoing || 0}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Completed</p><p className="mt-1 font-semibold">{data?.maintenance?.completed || 0}</p></div>
                <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Vehicles in Shop</p><p className="mt-1 font-semibold">{data?.maintenance?.vehiclesInShop || 0}</p></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {isSectionVisible(user?.role, "activity") && (
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-lg font-semibold">Recent Activity</h3>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (data?.recentActivity?.items || []).length === 0 ? (
              <EmptyState icon={Clock3} title="No recent activity" description="Trips, maintenance, fuel, and expenses will appear here." />
            ) : (
              <div className="space-y-2">
                {(data?.recentActivity?.items || []).slice(0, 10).map((item: any) => (
                  <div key={`${item.entityType}-${item.id}`} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{item.entityType}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Vehicle: {item.vehicle} • Driver: {item.driver} • Status: {item.status} • User: {item.user?.name || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isSectionVisible(user?.role, "alerts") && (
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-3 text-lg font-semibold">Alerts</h3>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : (data?.alerts?.items || []).length === 0 ? (
              <EmptyState icon={Info} title="No active alerts" description="Operational alerts will be shown when thresholds are crossed." />
            ) : (
              <div className="space-y-2">
                {(data?.alerts?.items || []).map((alert: any) => (
                  <div key={alert.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{alert.title}</p>
                      <span
                        className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${
                          alert.severity === "CRITICAL"
                            ? "bg-red-500/20 text-red-400"
                            : alert.severity === "WARNING"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-cyan-500/20 text-cyan-400"
                        }`}
                      >
                        {alert.severity === "CRITICAL" ? <Siren className="h-3 w-3" /> : <Gauge className="h-3 w-3" />}
                        {alert.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
