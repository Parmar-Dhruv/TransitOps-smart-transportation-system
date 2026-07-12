import { useState, useEffect } from "react";
import { RefreshCw, Download, TrendingUp, TrendingDown, Truck, Users, Map, Wrench } from "lucide-react";
import { Button } from "../components/common/Button";
import { Breadcrumb } from "../components/common/Breadcrumb";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card";
import { reportsApi } from "../api/reports.api";
import { toast } from "sonner";
import { hasActionAccess } from "../config/permissions";
import { useAuth } from "../hooks/useAuth";

const COLORS = ["#6d28d9", "#dc2626", "#059669", "#d97706", "#0891b2"];

const fmt = (n: number) => `$${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtK = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`;

export default function ReportsPage() {
  const { user } = useAuth();
  const canExportReports = hasActionAccess(user?.role, "reports", "export");
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<string | null>(null);
  const [fleet, setFleet] = useState<any>({});
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [fleetRes, vehiclesRes, driversRes] = await Promise.all([
        reportsApi.getFleetReport(),
        reportsApi.getVehiclesReport(),
        reportsApi.getDriversReport()
      ]);
      setFleet(fleetRes.data?.data || {});
      setVehicles(vehiclesRes.data?.data || []);
      setDrivers(driversRes.data?.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load reports");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const downloadCSV = async (type: "vehicles" | "drivers" | "trips") => {
    try {
      setExporting(type);
      const fn = type === "vehicles" ? reportsApi.exportVehiclesCSV : type === "drivers" ? reportsApi.exportDriversCSV : reportsApi.exportTripsCSV;
      const res = await fn();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a"); a.href = url; a.download = `${type}_report.csv`; a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${type} report exported`);
    } catch { toast.error("Export failed"); } finally { setExporting(null); }
  };

  // Vehicle cost breakdown for chart
  const vehicleChartData = vehicles.slice(0, 10).map((v: any) => ({
    name: v.registrationNumber,
    fuel: v.totalFuelCost,
    maintenance: v.totalMaintenanceCost,
    expenses: v.totalExpenses,
    revenue: v.totalRevenue
  }));

  // Status breakdown for pie
  const vehicleStatusData = [
    { name: "Available", value: fleet.availableVehicles || 0 },
    { name: "On Trip", value: fleet.activeVehicles || 0 },
    { name: "In Shop", value: fleet.inShop || 0 }
  ].filter(d => d.value > 0);

  const kpiCards = [
    { title: "Total Vehicles", value: fleet.totalVehicles ?? "—", icon: Truck, color: "text-violet-500", sub: `${fleet.availableVehicles ?? 0} available` },
    { title: "Total Drivers", value: fleet.totalDrivers ?? "—", icon: Users, color: "text-blue-500", sub: `${fleet.activeDrivers ?? 0} active` },
    { title: "Total Revenue", value: loading ? "..." : fmt(fleet.totalRevenue), icon: TrendingUp, color: "text-emerald-500", sub: "All completed trips" },
    { title: "Total Op. Cost", value: loading ? "..." : fmt(fleet.totalOperationalCost), icon: TrendingDown, color: "text-rose-500", sub: "Fuel + Maintenance + Expenses" },
    { title: "Net Profit", value: loading ? "..." : fmt(fleet.netProfit), icon: Map, color: fleet.netProfit >= 0 ? "text-emerald-500" : "text-rose-500", sub: `ROI: ${Number(fleet.roi || 0).toFixed(1)}%` },
    { title: "Fleet Utilization", value: loading ? "..." : `${Number(fleet.utilizationRate || 0).toFixed(1)}%`, icon: Wrench, color: "text-amber-500", sub: `Avg fuel eff. ${Number(fleet.averageFuelEfficiency || 0).toFixed(2)} km/L` }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Reports & Analytics" }]} />
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">Live operational insights from your fleet database.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchAll} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
          {canExportReports && <Button variant="outline" size="sm" isLoading={exporting === "vehicles"} onClick={() => downloadCSV("vehicles")}><Download className="mr-2 h-4 w-4" />Vehicles CSV</Button>}
          {canExportReports && <Button variant="outline" size="sm" isLoading={exporting === "drivers"} onClick={() => downloadCSV("drivers")}><Download className="mr-2 h-4 w-4" />Drivers CSV</Button>}
          {canExportReports && <Button variant="premium" size="sm" isLoading={exporting === "trips"} onClick={() => downloadCSV("trips")}><Download className="mr-2 h-4 w-4" />Trips CSV</Button>}
        </div>
      </div>

      {/* Fleet KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="rounded-xl border bg-card p-4 glass">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-muted-foreground">{card.title}</p>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <p className="text-xl font-bold">{loading ? <span className="animate-pulse">...</span> : card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle Cost Breakdown Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Vehicle Cost vs Revenue</CardTitle>
            <CardDescription>Top 10 vehicles — fuel, maintenance, expenses, and revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[350px] w-full animate-pulse bg-white/5 rounded-xl" />
            ) : vehicleChartData.length === 0 ? (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">No vehicle data available</div>
            ) : (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vehicleChartData} margin={{ top: 10, right: 20, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={fmtK} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(v: any) => fmt(v)} />
                    <Legend wrapperStyle={{ paddingTop: "10px" }} />
                    <Bar dataKey="fuel" name="Fuel ($)" fill="#6d28d9" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="maintenance" name="Maintenance ($)" fill="#dc2626" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses ($)" fill="#d97706" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="revenue" name="Revenue ($)" fill="#059669" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fleet Status Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Fleet Status</CardTitle>
            <CardDescription>Current vehicle status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] animate-pulse bg-white/5 rounded-xl" />
            ) : vehicleStatusData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No data</div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={vehicleStatusData} cx="50%" cy="45%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={true}>
                      {vehicleStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${v} vehicles`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Drivers Table */}
      {!loading && drivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Performance</CardTitle>
            <CardDescription>Safety score and trip completion statistics per driver</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Name", "License", "Trips", "Revenue", "Fuel Cost", "Safety Score", "Status"].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {drivers.slice(0, 8).map((d: any) => (
                    <tr key={d.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 font-medium">{d.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.licenseNumber}</td>
                      <td className="px-4 py-3">{d.totalTrips ?? 0}</td>
                      <td className="px-4 py-3 text-emerald-500">{fmt(d.totalRevenue)}</td>
                      <td className="px-4 py-3 text-rose-500">{fmt(d.totalFuelCost)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${(d.safetyScore ?? 0) >= 80 ? "text-emerald-500" : (d.safetyScore ?? 0) >= 50 ? "text-amber-500" : "text-rose-500"}`}>
                          {d.safetyScore ?? "—"}/100
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${d.status === "AVAILABLE" ? "bg-emerald-500/20 text-emerald-400" : d.status === "ON_TRIP" ? "bg-blue-500/20 text-blue-400" : "bg-muted text-muted-foreground"}`}>
                          {d.status?.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
