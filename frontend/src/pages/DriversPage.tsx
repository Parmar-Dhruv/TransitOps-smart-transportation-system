import { useState, useEffect } from "react";
import { Search, RefreshCw, Users } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { EmptyState } from "../components/common/EmptyState";
import { driversApi } from "../api/drivers.api";
import { toast } from "sonner";

export default function DriversPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await driversApi.getDrivers();
      // Backend: { success, message, data: { drivers: [], pagination: {} } }
      setData(res.data?.data?.drivers || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to load drivers";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filteredData = data.filter((d: any) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase()) ||
    d.licenseNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const statusMap: Record<string, string> = {
    AVAILABLE: "Available",
    ON_TRIP: "On Trip",
    OFF_DUTY: "Off Duty",
    SUSPENDED: "Suspended"
  };

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "licenseNumber", header: "License No." },
    {
      accessorKey: "safetyScore",
      header: "Safety Score",
      cell: ({ row }: any) => `${row.original.safetyScore ?? "N/A"}/100`
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
      <Breadcrumb items={[{ label: "Drivers" }]} />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground mt-1 text-sm">Assign and monitor fleet drivers.</p>
        </div>
        <Button variant="premium" onClick={fetchDrivers} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Drivers
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search by name, email, or license..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 min-h-0">
        {!loading && filteredData.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No drivers found"
            description="No drivers have been registered yet, or your search returned no results."
            actionLabel="Refresh list"
            onAction={fetchDrivers}
          />
        ) : (
          <DataTable columns={columns} data={filteredData} loading={loading} />
        )}
      </div>
    </div>
  );
}
