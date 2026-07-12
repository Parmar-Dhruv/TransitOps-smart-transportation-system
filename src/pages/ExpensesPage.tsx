import { useState, useEffect } from "react";
import { Plus, Search, Receipt } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setData([
        { id: "E-829", description: "Tolls - I-95", category: "Tolls", amount: "$45.00", date: "2026-07-09", status: "Approved" },
        { id: "E-830", description: "Scale Ticket", category: "Fees", amount: "$15.00", date: "2026-07-10", status: "Pending" },
      ]);
      setLoading(false);
    }, 600);
  }, []);

  const columns = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "category", header: "Category" },
    { accessorKey: "amount", header: "Amount" },
    { accessorKey: "date", header: "Date" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status.toLowerCase() === "pending" ? "maintenance" : "active"} />
    }
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Expenses" }]} />
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground mt-1 text-sm">Approve or reject additional trip expenses.</p>
        </div>
        <Button variant="premium">
          <Plus className="mr-2 h-4 w-4" /> Log Expense
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-5 h-5 text-muted-foreground absolute ml-3" />
        <Input placeholder="Search expenses..." className="pl-10" />
      </div>

      <div className="flex-1 min-h-0">
        {data.length === 0 && !loading ? (
          <EmptyState icon={Receipt} title="No Expenses" description="No out-of-pocket expenses submitted." />
        ) : (
          <DataTable columns={columns} data={data} loading={loading} />
        )}
      </div>
    </div>
  );
}
