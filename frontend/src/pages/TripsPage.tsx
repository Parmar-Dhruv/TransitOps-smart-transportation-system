import { useState, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { tripsApi } from "../api/trips.api";
import { toast } from "sonner";

export default function TripsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await tripsApi.getTrips();
      // Backend: { success, message, data: { trips: [], pagination: {} } }
      setData(res.data?.data?.trips || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load trips";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const filteredData = data.filter((t: any) =>
    t.tripNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.routeDetails?.toLowerCase().includes(search.toLowerCase()) ||
    t.vehicle?.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.driver?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const statusMap: Record<string, string> = {
    DRAFT: "Draft",
    DISPATCHED: "In Transit",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled"
  };

  const columns = [
    { accessorKey: "tripNumber", header: "Trip No." },
    { accessorKey: "routeDetails", header: "Route" },
    {
      accessorKey: "vehicle",
      header: "Vehicle",
      cell: ({ row }: any) => row.original.vehicle?.registrationNumber || "—"
    },
    {
      accessorKey: "driver",
      header: "Driver",
      cell: ({ row }: any) => row.original.driver?.name || "—"
    },
    {
      accessorKey: "cargoWeight",
      header: "Cargo (kg)",
      cell: ({ row }: any) => `${(row.original.cargoWeight || 0).toLocaleString()} kg`
    },
    {
      accessorKey: "revenue",
      header: "Revenue",
      cell: ({ row }: any) =>
        row.original.revenue != null
          ? `$${Number(row.original.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          : "—"
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <StatusBadge status={statusMap[row.original.status] || row.original.status} />
      )
    }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Trips" }]} />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Trips</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Dispatch and monitor ongoing fleet routes.
          </p>
        </div>
        <Button variant="premium" onClick={fetchTrips} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Trips
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search by trip no., route, vehicle, or driver..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 min-h-0">
        <DataTable columns={columns} data={filteredData} loading={loading} />
      </div>
    </div>
  );
}
