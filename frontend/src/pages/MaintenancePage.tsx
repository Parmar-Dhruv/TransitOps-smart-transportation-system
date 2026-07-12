import { useState, useEffect, useCallback } from "react";
import { Plus, Search, RefreshCw, Play, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Modal } from "../components/common/Modal";
import { maintenanceApi } from "../api/maintenance.api";
import { vehiclesApi } from "../api/vehicles.api";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: "Scheduled", IN_PROGRESS: "In Progress", COMPLETED: "Completed"
};

const emptyForm = {
  vehicleId: "", description: "", cost: 0, status: "SCHEDULED",
  startDate: new Date().toISOString().slice(0, 16), endDate: ""
};

export default function MaintenancePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await maintenanceApi.getMaintenanceLogs({ status: statusFilter || undefined, page, limit: pagination.limit });
      setData(res.data?.data?.maintenances || []);
      setPagination(res.data?.data?.pagination || pagination);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load maintenance logs");
    } finally { setLoading(false); }
  }, [statusFilter, pagination.limit]);

  useEffect(() => { fetchLogs(1); }, [statusFilter]);

  const loadVehicles = async () => {
    if (vehicles.length) return;
    try {
      const res = await vehiclesApi.getVehicles({ limit: 100 });
      setVehicles(res.data?.data?.vehicles || []);
    } catch { /* ignore */ }
  };

  const openAdd = async () => { setForm({ ...emptyForm }); await loadVehicles(); setShowModal(true); };

  const handleCreate = async () => {
    if (!form.vehicleId || !form.description || !form.startDate) {
      toast.error("Vehicle, description and start date are required"); return;
    }
    try {
      setSaving("create");
      await maintenanceApi.scheduleMaintenance({
        vehicleId: form.vehicleId, description: form.description,
        cost: Number(form.cost), status: form.status as any,
        startDate: new Date(form.startDate).toISOString(),
        endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined
      });
      toast.success("Maintenance log scheduled");
      setShowModal(false); fetchLogs(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create log");
    } finally { setSaving(null); }
  };

  const handleStart = async (id: string) => {
    try {
      setSaving(id);
      await maintenanceApi.startMaintenance(id);
      toast.success("Maintenance started");
      fetchLogs(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to start maintenance");
    } finally { setSaving(null); }
  };

  const handleComplete = async (id: string) => {
    try {
      setSaving(id);
      await maintenanceApi.completeMaintenance(id);
      toast.success("Maintenance completed");
      fetchLogs(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to complete maintenance");
    } finally { setSaving(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(deleteTarget.id);
      await maintenanceApi.deleteLog(deleteTarget.id);
      toast.success("Maintenance log removed");
      setDeleteTarget(null); fetchLogs(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally { setSaving(null); }
  };

  const filteredData = data.filter(m =>
    m.description?.toLowerCase().includes(search.toLowerCase()) ||
    m.vehicle?.registrationNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { accessorKey: "vehicle", header: "Vehicle", cell: ({ row }: any) => row.original.vehicle?.registrationNumber || row.original.vehicleId?.slice(0, 8) },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "cost", header: "Cost", cell: ({ row }: any) => `$${Number(row.original.cost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { accessorKey: "startDate", header: "Start Date", cell: ({ row }: any) => row.original.startDate ? new Date(row.original.startDate).toLocaleDateString() : "—" },
    { accessorKey: "status", header: "Status", cell: ({ row }: any) => <StatusBadge status={STATUS_LABELS[row.original.status] || row.original.status} /> },
    {
      id: "actions", header: "Actions",
      cell: ({ row }: any) => {
        const m = row.original; const isBusy = saving === m.id;
        return (
          <div className="flex gap-1.5">
            {m.status === "SCHEDULED" && (
              <button onClick={() => handleStart(m.id)} disabled={!!saving} title="Start" className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-500 disabled:opacity-50 transition-colors">
                {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            )}
            {m.status === "IN_PROGRESS" && (
              <button onClick={() => handleComplete(m.id)} disabled={!!saving} title="Complete" className="p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-500 disabled:opacity-50 transition-colors">
                {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              </button>
            )}
            <button onClick={() => setDeleteTarget(m)} disabled={!!saving} title="Delete" className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive disabled:opacity-50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      }
    }
  ];

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Maintenance" }]} />
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-muted-foreground mt-1 text-sm">Schedule and track vehicle service — {pagination.total} total logs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchLogs(pagination.page)} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
          <Button variant="premium" onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Record</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search logs..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Statuses</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable columns={columns} data={filteredData} loading={loading} />
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={pagination.page <= 1 || loading} onClick={() => fetchLogs(pagination.page - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => fetchLogs(pagination.page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Add Log Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Schedule Maintenance" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">Vehicle *</label>
            <select value={form.vehicleId} onChange={e => f("vehicleId", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select vehicle...</option>
              {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.make} {v.model}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">Description *</label>
            <Input value={form.description} onChange={e => f("description", e.target.value)} placeholder="e.g. Engine oil change and filter replacement" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Estimated Cost ($)</label>
            <Input type="number" value={form.cost} onChange={e => f("cost", e.target.value)} min={0} placeholder="e.g. 500" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Status</label>
            <select value={form.status} onChange={e => f("status", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Start Date *</label>
            <Input type="datetime-local" value={form.startDate} onChange={e => f("startDate", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">End Date (optional)</label>
            <Input type="datetime-local" value={form.endDate} onChange={e => f("endDate", e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="premium" isLoading={saving === "create"} onClick={handleCreate}>Schedule Maintenance</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Log" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete maintenance log for <span className="font-semibold text-foreground">{deleteTarget?.vehicle?.registrationNumber}</span>?</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" isLoading={saving === deleteTarget?.id} onClick={handleDelete}>Delete Log</Button>
        </div>
      </Modal>
    </div>
  );
}
