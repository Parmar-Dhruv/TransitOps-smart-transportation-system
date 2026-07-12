import { useState, useEffect, useCallback } from "react";
import { Plus, Search, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Modal } from "../components/common/Modal";
import { expensesApi, type ExpenseCategory } from "../api/expenses.api";
import { vehiclesApi } from "../api/vehicles.api";
import { toast } from "sonner";

const CATEGORIES: ExpenseCategory[] = [
  "TOLL", "PARKING", "DRIVER_ALLOWANCE", "REPAIR", "MAINTENANCE", "INSURANCE", "PERMIT", "FINE", "MISCELLANEOUS"
];

const CATEGORY_LABELS: Record<string, string> = {
  TOLL: "Toll", PARKING: "Parking", DRIVER_ALLOWANCE: "Driver Allowance",
  REPAIR: "Repair", MAINTENANCE: "Maintenance", INSURANCE: "Insurance",
  PERMIT: "Permit", FINE: "Fine", MISCELLANEOUS: "Miscellaneous"
};

const emptyForm = {
  amount: 0, category: "MISCELLANEOUS" as ExpenseCategory,
  date: new Date().toISOString().slice(0, 16), description: "", vehicleId: ""
};

export default function ExpensesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchExpenses = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await expensesApi.getExpenses({
        category: categoryFilter as ExpenseCategory || undefined,
        page, limit: pagination.limit
      });
      setData(res.data?.data?.expenses || []);
      setPagination(res.data?.data?.pagination || pagination);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load expenses");
    } finally { setLoading(false); }
  }, [categoryFilter, pagination.limit]);

  useEffect(() => { fetchExpenses(1); }, [categoryFilter]);

  const loadVehicles = async () => {
    if (vehicles.length) return;
    try {
      const res = await vehiclesApi.getVehicles({ limit: 100 });
      setVehicles(res.data?.data?.vehicles || []);
    } catch { /* ignore */ }
  };

  const openAdd = async () => { setForm({ ...emptyForm, date: new Date().toISOString().slice(0, 16) }); await loadVehicles(); setShowModal(true); };

  const handleCreate = async () => {
    if (!form.amount || !form.description || !form.date) {
      toast.error("Amount, description and date are required"); return;
    }
    try {
      setSaving("create");
      await expensesApi.createExpense({
        amount: Number(form.amount), category: form.category,
        date: new Date(form.date).toISOString(),
        description: form.description,
        vehicleId: form.vehicleId || null
      });
      toast.success("Expense logged successfully");
      setShowModal(false); fetchExpenses(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to log expense");
    } finally { setSaving(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(deleteTarget.id);
      await expensesApi.deleteExpense(deleteTarget.id);
      toast.success("Expense deleted");
      setDeleteTarget(null); fetchExpenses(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally { setSaving(null); }
  };

  const filteredData = data.filter(e =>
    e.description?.toLowerCase().includes(search.toLowerCase()) ||
    e.vehicle?.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
    CATEGORY_LABELS[e.category]?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { accessorKey: "description", header: "Description" },
    { accessorKey: "category", header: "Category", cell: ({ row }: any) => <StatusBadge status={CATEGORY_LABELS[row.original.category] || row.original.category} /> },
    { accessorKey: "amount", header: "Amount", cell: ({ row }: any) => `$${Number(row.original.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { accessorKey: "vehicle", header: "Vehicle", cell: ({ row }: any) => row.original.vehicle?.registrationNumber || "—" },
    { accessorKey: "driver", header: "Driver", cell: ({ row }: any) => row.original.driver?.name || "—" },
    { accessorKey: "date", header: "Date", cell: ({ row }: any) => row.original.date ? new Date(row.original.date).toLocaleDateString() : "—" },
    {
      id: "actions", header: "",
      cell: ({ row }: any) => (
        <button onClick={() => setDeleteTarget(row.original)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )
    }
  ];

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Expenses" }]} />
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track operational expenditures — {pagination.total} total records.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchExpenses(pagination.page)} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
          <Button variant="premium" onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Log Expense</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search expenses..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
        </select>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable columns={columns} data={filteredData} loading={loading} />
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={pagination.page <= 1 || loading} onClick={() => fetchExpenses(pagination.page - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => fetchExpenses(pagination.page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Expense" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">Description *</label>
            <Input value={form.description} onChange={e => f("description", e.target.value)} placeholder="e.g. Toll charges at Mumbai entry point" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Category *</label>
            <select value={form.category} onChange={e => f("category", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Amount ($) *</label>
            <Input type="number" value={form.amount} onChange={e => f("amount", e.target.value)} min={0} step={0.01} placeholder="e.g. 150" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Date *</label>
            <Input type="datetime-local" value={form.date} onChange={e => f("date", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Vehicle (optional)</label>
            <select value={form.vehicleId} onChange={e => f("vehicleId", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">No vehicle</option>
              {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.registrationNumber}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="premium" isLoading={saving === "create"} onClick={handleCreate}>Log Expense</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Expense" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete expense: <span className="font-semibold text-foreground">"{deleteTarget?.description}"</span> (${Number(deleteTarget?.amount || 0).toFixed(2)})?</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" isLoading={saving === deleteTarget?.id} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
