import { useState, useEffect } from "react";
import { Plus, Search, Wrench } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { EmptyState } from "../components/common/EmptyState";

export default function MaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setData([
        { id: "M-101", vehicle: "TRK-001", issue: "Oil Change", date: "2026-07-10", cost: "$150.00", status: "Completed" },
        { id: "M-102", vehicle: "TRK-002", issue: "Brake Replacement", date: "2026-07-15", cost: "$1,200.00", status: "Scheduled" },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const columns = [
    { accessorKey: "id", header: "Log ID" },
    { accessorKey: "vehicle", header: "Vehicle" },
    { accessorKey: "issue", header: "Issue" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "cost", header: "Cost" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />
    }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Maintenance" }]} />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground mt-1 text-sm">Schedule and track vehicle service logs.</p>
        </div>
        <Button variant="premium">
          <Plus className="mr-2 h-4 w-4" /> Add Record
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-5 h-5 text-muted-foreground absolute ml-3" />
        <Input placeholder="Search logs..." className="pl-10" />
      </div>

      <div className="flex-1 min-h-0">
        {data.length === 0 && !loading ? (
          <EmptyState icon={Wrench} title="No Maintenance Logs" description="Keep your fleet healthy by recording maintenance." />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} />
        )}
      </div>
    </div>
  );
}
