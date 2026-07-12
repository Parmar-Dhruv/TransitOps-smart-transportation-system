import { useState, useEffect } from "react";
import { BarChart3, Download, Filter } from "lucide-react";
import { Button } from "../components/common/Button";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/common/Card";
import { EmptyState } from "../components/common/EmptyState";

const generateData = () => {
  return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    name: day,
    fuel: Math.floor(Math.random() * 500) + 200,
    maintenance: Math.floor(Math.random() * 300) + 50,
  }));
};

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setData(generateData());
      setLoading(false);
    }, 600);
  }, []);

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Reports & Analytics" }]} />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground mt-1 text-sm">Visualize operational costs and performance.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button variant="premium">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {!loading && data.length === 0 ? (
        <EmptyState icon={BarChart3} title="No Data Available" description="Accumulate data to generate reports." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Fleet Expenditure (Weekly)</CardTitle>
              <CardDescription>Comparison between fuel costs and maintenance fees over the last 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-[350px] w-full animate-pulse bg-white/5 rounded-xl" />
              ) : (
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                        cursor={{fill: 'hsl(var(--muted))', opacity: 0.2}}
                      />
                      <Legend wrapperStyle={{ paddingTop: "20px" }} />
                      <Bar dataKey="fuel" name="Fuel ($)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="maintenance" name="Maintenance ($)" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
