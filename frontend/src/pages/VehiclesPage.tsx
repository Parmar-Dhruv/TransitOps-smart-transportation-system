import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Vehicle } from "../types";
import { vehiclesApi } from "../api/vehicles.api";
import { toast } from "sonner";

export default function VehiclesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await vehiclesApi.getVehicles();
      setData(res.data.data || []);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to load vehicles from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const filteredData = data.filter((v: any) => 
    v.registrationNumber.toLowerCase().includes(search.toLowerCase()) ||
    v.make.toLowerCase().includes(search.toLowerCase()) ||
    v.model.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { accessorKey: "registrationNumber", header: "Registration No." },
    { accessorKey: "make", header: "Make" },
    { accessorKey: "model", header: "Model" },
    { accessorKey: "capacity", header: "Cargo Capacity (kg)", cell: ({ row }: any) => `${row.original.capacity.toLocaleString()} kg` },
    { 
      accessorKey: "odometer", 
      header: "Odometer",
      cell: ({ row }: any) => `${row.original.odometer.toLocaleString()} km`
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />
    }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Vehicles" }]} />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your fleet, track specifications, and view operational status.</p>
        </div>
        <Button variant="premium" onClick={fetchVehicles}>
          Refresh Fleet
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-5 h-5 text-muted-foreground absolute ml-3" />
        <Input 
          placeholder="Search vehicles..." 
          className="pl-10" 
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
