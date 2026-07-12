import { useState, useEffect } from "react";
import { Plus, Search, Users } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { EmptyState } from "../components/common/EmptyState";
import { Driver } from "../types";

export default function DriversPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Driver[]>([]);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setData([
        { id: "D1", name: "John Doe", email: "john@transitops.com", phone: "(555) 123-4567", licenseNumber: "LIC-8829", status: "On Trip" },
        { id: "D2", name: "Jane Smith", email: "jane@transitops.com", phone: "(555) 987-6543", licenseNumber: "LIC-1122", status: "Available" },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "licenseNumber", header: "License" },
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
        <Button variant="premium">
          <Plus className="mr-2 h-4 w-4" /> Add Driver
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-5 h-5 text-muted-foreground absolute ml-3" />
        <Input placeholder="Search drivers by name..." className="pl-10" />
      </div>

      <div className="flex-1 min-h-0">
        {!loading && data.length === 0 ? (
          <EmptyState 
            icon={Users} 
            title="No drivers found" 
            description="You don't have any drivers registered yet."
            actionLabel="Add Driver"
            onAction={() => {}}
          />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} />
        )}
      </div>
    </div>
  );
}
