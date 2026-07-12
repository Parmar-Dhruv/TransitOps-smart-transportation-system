import { useState, useEffect, useCallback } from "react";
import { Plus, Search, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Modal } from "../components/common/Modal";
import { vehiclesApi } from "../api/vehicles.api";
import { toast } from "sonner";

const STATUS_OPTIONS = ["AVAILABLE", "ON_TRIP", "IN_SHOP", "RETIRED"];
const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available", ON_TRIP: "On Trip", IN_SHOP: "In Shop", RETIRED: "Retired"
};

const emptyForm = {
  registrationNumber: "", make: "", model: "",
  year: new Date().getFullYear(), capacity: 0, odometer: 0, status: "AVAILABLE"
};

export default function VehiclesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchVehicles = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await vehiclesApi.getVehicles({
        search: search || undefined,
        status: statusFilter || undefined,
        page, limit: pagination.limit
      });
      setData(res.data?.data?.vehicles || []);
      setPagination(res.data?.data?.pagination || pagination);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load vehicles");
    } finally { setLoading(false); }
  }, [search, statusFilter, pagination.limit]);

  useEffect(() => { fetchVehicles(1); }, [search, statusFilter]);

  const openAdd = () => { setForm({ ...emptyForm }); setEditRecord(null); setShowModal(true); };
  const openEdit = (v: any) => {
    setForm({ registrationNumber: v.registrationNumber, make: v.make, model: v.model, year: v.year, capacity: v.capacity, odometer: v.odometer, status: v.status });
    setEditRecord(v); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.registrationNumber || !form.make || !form.model) {
      toast.error("Registration number, make and model are required"); return;
    }
    try {
      setSaving(true);
      if (editRecord) {
        await vehiclesApi.updateVehicle(editRecord.id, { ...form, year: Number(form.year), capacity: Number(form.capacity), odometer: Number(form.odometer) });
        toast.success("Vehicle updated successfully");
      } else {
        await vehiclesApi.createVehicle({ ...form, year: Number(form.year), capacity: Number(form.capacity), odometer: Number(form.odometer) });
        toast.success("Vehicle registered successfully");
      }
      setShowModal(false); fetchVehicles(1);
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.data?.data?.[0]?.message) || "Save failed";
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await vehiclesApi.deleteVehicle(deleteTarget.id);
      toast.success("Vehicle retired successfully");
      setDeleteTarget(null); fetchVehicles(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally { setSaving(false); }
  };

  const columns = [
    { accessorKey: "registrationNumber", header: "Reg. No." },
    { accessorKey: "make", header: "Make" },
    { accessorKey: "model", header: "Model" },
    { accessorKey: "year", header: "Year" },
    { accessorKey: "capacity", header: "Capacity (kg)", cell: ({ row }: any) => `${Number(row.original.capacity).toLocaleString()} kg` },
    { accessorKey: "odometer", header: "Odometer", cell: ({ row }: any) => `${Number(row.original.odometer).toLocaleString()} km` },
    { accessorKey: "status", header: "Status", cell: ({ row }: any) => <StatusBadge status={STATUS_LABELS[row.original.status] || row.original.status} /> },
    {
      id: "actions", header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row.original)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
          <button onClick={() => setDeleteTarget(row.original)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
        </div>
      )
    }
  ];

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Vehicles" }]} />
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your fleet assets — {pagination.total} total vehicles.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchVehicles(pagination.page)} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="premium" onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Vehicle</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search vehicles..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable columns={columns} data={data} loading={loading} />
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={pagination.page <= 1 || loading} onClick={() => fetchVehicles(pagination.page - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => fetchVehicles(pagination.page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editRecord ? "Edit Vehicle" : "Register Vehicle"} description="Enter vehicle details below." size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">Registration Number *</label>
            <Input value={form.registrationNumber} onChange={e => f("registrationNumber", e.target.value)} placeholder="e.g. MH-12-AB-1234" disabled={!!editRecord} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Make *</label>
            <Input value={form.make} onChange={e => f("make", e.target.value)} placeholder="e.g. Tata" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Model *</label>
            <Input value={form.model} onChange={e => f("model", e.target.value)} placeholder="e.g. Prima 5530" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Year *</label>
            <Input type="number" value={form.year} onChange={e => f("year", e.target.value)} min={1990} max={new Date().getFullYear() + 2} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Capacity (kg) *</label>
            <Input type="number" value={form.capacity} onChange={e => f("capacity", e.target.value)} placeholder="e.g. 35000" min={0} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Odometer (km)</label>
            <Input type="number" value={form.odometer} onChange={e => f("odometer", e.target.value)} placeholder="e.g. 0" min={0} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Status</label>
            <select value={form.status} onChange={e => f("status", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="premium" isLoading={saving} onClick={handleSave}>{editRecord ? "Save Changes" : "Register Vehicle"}</Button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Retire Vehicle" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to retire <span className="font-semibold text-foreground">{deleteTarget?.registrationNumber}</span>? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" isLoading={saving} onClick={handleDelete}>Retire Vehicle</Button>
        </div>
      </Modal>
    </div>
  );
}
