import { useState, useEffect } from "react";
import { OverviewChart } from "../components/dashboard/OverviewChart";
import { dashboardApi } from "../api/dashboard.api";
import { toast } from "sonner";
import { DollarSign, Shield, Truck, Zap } from "lucide-react";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<any>({});
  const [charts, setCharts] = useState<any>({});

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getOverview();
      // Overview returns { success: true, message: "...", data: { kpis, charts } }
      setKpis(res.data.data.kpis || {});
      setCharts(res.data.data.charts || {});
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val: number) => {
    return typeof val === "number" ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00";
  };

  const formatPercent = (val: number) => {
    return typeof val === "number" ? `${val.toFixed(1)}%` : "0.0%";
  };

  const metricCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(kpis.totalRevenue),
      desc: "Fleet operational earnings",
      icon: DollarSign,
      color: "text-emerald-500"
    },
    {
      title: "Operational Costs",
      value: formatCurrency(kpis.totalOperationalCost),
      desc: "Fuel + Maintenance + Expenses",
      icon: Shield,
      color: "text-rose-500"
    },
    {
      title: "Net Profit",
      value: formatCurrency(kpis.netProfit),
      desc: "Net returns after costs",
      icon: Zap,
      color: "text-indigo-500"
    },
    {
      title: "Fleet ROI",
      value: formatPercent(kpis.roi),
      desc: "Return on operational spend",
      icon: Truck,
      color: "text-cyan-500"
    }
  ];

  const chartData = (charts.monthlyCosts || []).map((item: any) => ({
    name: item.month, // e.g. "2026-07"
    total: item.totalCost
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <Button variant="premium" onClick={fetchDashboardData} disabled={loading}>
          Refresh Metrics
        </Button>
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
                {loading ? "..." : card.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 glass lg:col-span-4">
          <div className="mb-4 space-y-1">
            <h3 className="tracking-tight text-lg font-medium">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground">Monthly revenue projection and analytics.</p>
          </div>
          <OverviewChart data={chartData} />
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 glass lg:col-span-3">
          <div className="mb-4">
            <h3 className="tracking-tight text-lg font-medium">Operations Details</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-muted-foreground">Total Vehicles</span>
              <span className="text-sm font-semibold">{loading ? "..." : kpis.totalVehicles}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-muted-foreground">Active Vehicles</span>
              <span className="text-sm font-semibold text-emerald-500">{loading ? "..." : kpis.activeVehicles}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-muted-foreground">Vehicles in Shop</span>
              <span className="text-sm font-semibold text-amber-500">{loading ? "..." : kpis.inShop}</span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-sm text-muted-foreground">Fleet Utilization</span>
              <span className="text-sm font-semibold">{loading ? "..." : formatPercent(kpis.utilizationRate)}</span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-sm text-muted-foreground">Avg Fuel Efficiency</span>
              <span className="text-sm font-semibold">{loading ? "..." : `${kpis.averageFuelEfficiency || 0} km/L`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline fallback Button import to avoid import compile issue
function Button({ children, onClick, variant, disabled }: any) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4 ${
        variant === "premium"
          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-md shadow-indigo-500/20"
          : "border border-input hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {children}
    </button>
  );
}
