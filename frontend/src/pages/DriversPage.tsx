import { useState, useEffect } from "react";
import { Plus, Search, Users } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { EmptyState } from "../components/common/EmptyState";
import { Driver } from "../types";
import { driversApi } from "../api/drivers.api";
import { toast } from "sonner";

export default function DriversPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await driversApi.getDrivers();
      setData(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to load drivers from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const filteredData = data.filter((d: any) => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase()) ||
    d.licenseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "licenseNumber", header: "License" },
    { accessorKey: "safetyScore", header: "Safety Score", cell: ({ row }: any) => `${row.original.safetyScore}/100` },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />
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
        <Button variant="premium" onClick={fetchDrivers}>
          Refresh Drivers
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-5 h-5 text-muted-foreground absolute ml-3" />
        <Input 
          placeholder="Search drivers by name..." 
          className="pl-10" 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 min-h-0">
        {!loading && filteredData.length === 0 ? (
          <EmptyState 
            icon={Users} 
            title="No drivers found" 
            description="You don't have any drivers registered yet."
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
