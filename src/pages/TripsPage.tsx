import { useState, useEffect } from "react";
import { Plus, Search, Map } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";

export default function TripsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setData([
        { id: "T-1029", origin: "New York, NY", destination: "Los Angeles, CA", driver: "John Doe", vehicle: "TRK-001", status: "In Transit" },
        { id: "T-1030", origin: "Seattle, WA", destination: "Portland, OR", driver: "Jane Smith", vehicle: "TRK-002", status: "Completed" },
      ]);
      setLoading(false);
    }, 700);
  }, []);

  const columns = [
    { accessorKey: "id", header: "Trip ID" },
    { accessorKey: "origin", header: "Origin" },
    { accessorKey: "destination", header: "Destination" },
    { accessorKey: "driver", header: "Driver" },
    { accessorKey: "vehicle", header: "Vehicle" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />
    }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Trips" }]} />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Trips</h1>
          <p className="text-muted-foreground mt-1 text-sm">Dispatch and monitor ongoing fleet routes.</p>
        </div>
        <Button variant="premium">
          <Plus className="mr-2 h-4 w-4" /> Dispatch Trip
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-5 h-5 text-muted-foreground absolute ml-3" />
        <Input placeholder="Search trips..." className="pl-10" />
      </div>

      <div className="flex-1 min-h-0">
        <DataTable columns={columns} data={data} loading={loading} />
      </div>
    </div>
  );
}
