import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { OverviewChart } from "../components/dashboard/OverviewChart";
import { Button } from "../components/common/Button";
import { dashboardApi } from "../api/dashboard.api";
import { toast } from "sonner";
import { DollarSign, Shield, Truck, Zap, RefreshCw } from "lucide-react";
import { getAccessibleDashboardShortcuts } from "../config/permissions";
import { useAuth } from "../hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>({});
  const [charts, setCharts] = useState<any>({});

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getOverview();
      setKpis(res.data?.data?.kpis || {});
      setCharts(res.data?.data?.charts || {});
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const formatCurrency = (val: number) =>
    typeof val === "number" ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00";

  const formatPercent = (val: number) =>
    typeof val === "number" ? `${val.toFixed(1)}%` : "0.0%";

  const shortcuts = getAccessibleDashboardShortcuts(user?.role);

  const metricCards = [
    { title: "Total Revenue", value: formatCurrency(kpis.totalRevenue), desc: "Fleet operational earnings", icon: DollarSign, color: "text-emerald-500" },
    { title: "Operational Costs", value: formatCurrency(kpis.totalOperationalCost), desc: "Fuel + Maintenance + Expenses", icon: Shield, color: "text-rose-500" },
    { title: "Net Profit", value: formatCurrency(kpis.netProfit), desc: "Net returns after costs", icon: Zap, color: "text-indigo-500" },
    { title: "Fleet ROI", value: formatPercent(kpis.roi), desc: "Return on operational spend", icon: Truck, color: "text-cyan-500" }
  ];

  const chartData = (charts.monthlyCosts || []).map((item: any) => ({
    name: item.month,
    total: item.totalCost
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <Button variant="premium" onClick={fetchDashboardData} isLoading={loading}>
          {!loading && <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh Metrics
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Quick Access</h2>
          <p className="text-sm text-muted-foreground">Only modules available to your role are shown here.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                to={item.path}
                className="rounded-xl border bg-card p-4 glass transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex items-center justify-between gap-3">
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 glass">
              <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">{card.title}</h3>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-2xl font-bold mt-1">
                {loading ? <span className="animate-pulse text-muted-foreground">—</span> : card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 glass lg:col-span-4">
          <div className="mb-4 space-y-1">
            <h3 className="tracking-tight text-lg font-medium">Monthly Cost Trend</h3>
            <p className="text-sm text-muted-foreground">Operational cost breakdown by month.</p>
          </div>
          <OverviewChart data={chartData} />
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 glass lg:col-span-3">
          <div className="mb-4">
            <h3 className="tracking-tight text-lg font-medium">Fleet Snapshot</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Total Vehicles", value: kpis.totalVehicles, color: "" },
              { label: "Active (On Trip)", value: kpis.activeVehicles, color: "text-blue-400" },
              { label: "Available", value: kpis.availableVehicles, color: "text-emerald-400" },
              { label: "In Maintenance", value: kpis.inShop, color: "text-amber-400" },
              { label: "Fleet Utilization", value: formatPercent(kpis.utilizationRate), color: "" },
              { label: "Avg Fuel Efficiency", value: `${kpis.averageFuelEfficiency || 0} km/L`, color: "" }
            ].map(({ label, value, color }, i) => (
              <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                <span className="text-sm text-muted-foreground">{label}</span>
                <span className={`text-sm font-semibold ${color}`}>{loading ? "..." : value ?? "—"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
