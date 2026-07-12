import { OverviewChart } from "../components/dashboard/OverviewChart";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Metric Cards will go here */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 glass">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium">Metric {i}</h3>
            </div>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 glass lg:col-span-4">
          <div className="mb-4 space-y-1">
            <h3 className="tracking-tight text-lg font-medium">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground">Monthly revenue projection and analytics.</p>
          </div>
          <OverviewChart />
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 glass lg:col-span-3">
          <div className="mb-4">
            <h3 className="tracking-tight text-lg font-medium">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="flex items-center">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center mr-4">
                  <span className="text-primary text-xs font-bold">DR</span>
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Trip completed</p>
                  <p className="text-sm text-muted-foreground">Route NY-LA finished successfully.</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {i}h ago
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
