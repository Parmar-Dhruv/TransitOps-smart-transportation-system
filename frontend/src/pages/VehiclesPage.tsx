import { useState, useEffect } from "react";
import { Search, RefreshCw } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { vehiclesApi } from "../api/vehicles.api";
import { toast } from "sonner";

export default function VehiclesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehiclesApi.getVehicles();
      // Backend: { success, message, data: { vehicles: [], pagination: {} } }
      setData(res.data?.data?.vehicles || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load vehicles";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredData = data.filter((v: any) =>
    v.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
    v.make?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase())
  );

  const statusMap: Record<string, string> = {
    AVAILABLE: "Available",
    ON_TRIP: "On Trip",
    IN_SHOP: "In Shop",
    RETIRED: "Retired"
  };

  const columns = [
    { accessorKey: "registrationNumber", header: "Registration No." },
    { accessorKey: "make", header: "Make" },
    { accessorKey: "model", header: "Model" },
    { accessorKey: "year", header: "Year" },
    {
      accessorKey: "capacity",
      header: "Capacity (kg)",
      cell: ({ row }: any) => `${(row.original.capacity || 0).toLocaleString()} kg`
    },
    {
      accessorKey: "odometer",
      header: "Odometer",
      cell: ({ row }: any) => `${(row.original.odometer || 0).toLocaleString()} km`
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
      <Breadcrumb items={[{ label: "Vehicles" }]} />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your fleet, track specifications, and view operational status.
          </p>
        </div>
        <Button variant="premium" onClick={fetchVehicles} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Fleet
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search by registration, make, or model..."
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
