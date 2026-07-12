import { useState, useEffect } from "react";
import { Plus, Search, Fuel } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { EmptyState } from "../components/common/EmptyState";

export default function FuelPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setData([
        { id: "F-1", vehicle: "TRK-001", gallons: 110.5, price: 3.49, total: "$385.64", date: "2026-07-11" },
        { id: "F-2", vehicle: "TRK-003", gallons: 85.0, price: 3.59, total: "$305.15", date: "2026-07-12" },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const columns = [
    { accessorKey: "id", header: "Log ID" },
    { accessorKey: "vehicle", header: "Vehicle" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "gallons", header: "Gallons" },
    { accessorKey: "price", header: "Price/Gal", cell: ({row}: any) => `$${row.original.price}` },
    { accessorKey: "total", header: "Total Cost" }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Fuel Log" }]} />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Monitoring</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track fuel consumption across the fleet.</p>
        </div>
        <Button variant="premium">
          <Plus className="mr-2 h-4 w-4" /> Add Entry
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-5 h-5 text-muted-foreground absolute ml-3" />
        <Input placeholder="Search records..." className="pl-10" />
      </div>

      <div className="flex-1 min-h-0">
        {data.length === 0 && !loading ? (
          <EmptyState icon={Fuel} title="No Fuel Logs" description="Start logging fuel purchases." />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} />
        )}
      </div>
    </div>
  );
}
