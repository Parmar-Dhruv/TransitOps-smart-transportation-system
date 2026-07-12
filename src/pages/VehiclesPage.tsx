import { useState, useEffect } from "react";
import { Plus, Search, Truck } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Vehicle } from "../types";

export default function VehiclesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Vehicle[]>([]);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setData([
        { id: "1", make: "Volvo", model: "VNL 860", year: 2023, licensePlate: "TRK-001", status: "Active", currentOdometer: 125000 },
        { id: "2", make: "Freightliner", model: "Cascadia", year: 2022, licensePlate: "TRK-002", status: "Maintenance", currentOdometer: 210400 },
        { id: "3", make: "Peterbilt", model: "579", year: 2024, licensePlate: "TRK-003", status: "Out of Service", currentOdometer: 45000 },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "make", header: "Make" },
    { accessorKey: "model", header: "Model" },
    { accessorKey: "licensePlate", header: "License Plate" },
    { 
      accessorKey: "currentOdometer", 
      header: "Odometer",
      cell: ({ row }: any) => `${row.original.currentOdometer.toLocaleString()} mi`
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
          <p className="text-muted-foreground mt-1 text-sm">Manage your fleet, track specs, and view operational status.</p>
        </div>
        <Button variant="premium">
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-5 h-5 text-muted-foreground absolute ml-3" />
        <Input placeholder="Search vehicles..." className="pl-10" />
      </div>

      <div className="flex-1 min-h-0">
        <DataTable columns={columns} data={data} loading={loading} />
      </div>
    </div>
  );
}
