import { useState, useEffect, useCallback } from "react";
import { Plus, Search, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Modal } from "../components/common/Modal";
import { driversApi } from "../api/drivers.api";
import { toast } from "sonner";

const STATUS_OPTIONS = ["AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"];
const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available", ON_TRIP: "On Trip", OFF_DUTY: "Off Duty", SUSPENDED: "Suspended"
};

const emptyForm = {
  name: "", email: "", phone: "", licenseNumber: "",
  licenseExpiry: "", safetyScore: 100, status: "AVAILABLE"
};

export default function DriversPage() {
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

  const fetchDrivers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await driversApi.getDrivers({
        search: search || undefined, status: statusFilter || undefined,
        page, limit: pagination.limit
      });
      setData(res.data?.data?.drivers || []);
      setPagination(res.data?.data?.pagination || pagination);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load drivers");
    } finally { setLoading(false); }
  }, [search, statusFilter, pagination.limit]);

  useEffect(() => { fetchDrivers(1); }, [search, statusFilter]);

  const openAdd = () => { setForm({ ...emptyForm }); setEditRecord(null); setShowModal(true); };
  const openEdit = (d: any) => {
    setForm({
      name: d.name, email: d.email, phone: d.phone,
      licenseNumber: d.licenseNumber,
      licenseExpiry: d.licenseExpiry ? d.licenseExpiry.slice(0, 10) : "",
      safetyScore: d.safetyScore ?? 100, status: d.status
    });
    setEditRecord(d); setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.email || !form.phone || !form.licenseNumber || !form.licenseExpiry) {
      toast.error("All required fields must be filled"); return;
    }
    try {
      setSaving(true);
      // Convert date to ISO string
      const payload = { ...form, safetyScore: Number(form.safetyScore), licenseExpiry: new Date(form.licenseExpiry).toISOString() };
      if (editRecord) {
        await driversApi.updateDriver(editRecord.id, payload);
        toast.success("Driver updated successfully");
      } else {
        await driversApi.createDriver(payload);
        toast.success("Driver registered successfully");
      }
      setShowModal(false); fetchDrivers(1);
    } catch (err: any) {
      const msg = err.response?.data?.message || (err.response?.data?.data?.[0]?.message) || "Save failed";
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await driversApi.deleteDriver(deleteTarget.id);
      toast.success("Driver removed successfully");
      setDeleteTarget(null); fetchDrivers(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally { setSaving(false); }
  };

  const columns = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "licenseNumber", header: "License No." },
    { accessorKey: "safetyScore", header: "Safety Score", cell: ({ row }: any) => <span className={`font-semibold ${row.original.safetyScore >= 80 ? "text-emerald-500" : row.original.safetyScore >= 50 ? "text-amber-500" : "text-rose-500"}`}>{row.original.safetyScore ?? "—"}/100</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }: any) => <StatusBadge status={STATUS_LABELS[row.original.status] || row.original.status} /> },
    {
      id: "actions", header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row.original)} className="p-1.5 rounded-md hover:bg-muted transition-colors"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
          <button onClick={() => setDeleteTarget(row.original)} className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
        </div>
      )
    }
  ];

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Drivers" }]} />
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage fleet operators — {pagination.total} total drivers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchDrivers(pagination.page)} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
          <Button variant="premium" onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Driver</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search drivers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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
            <Button size="sm" variant="outline" disabled={pagination.page <= 1 || loading} onClick={() => fetchDrivers(pagination.page - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => fetchDrivers(pagination.page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editRecord ? "Edit Driver" : "Register Driver"} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">Full Name *</label>
            <Input value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. Rajesh Kumar" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email *</label>
            <Input type="email" value={form.email} onChange={e => f("email", e.target.value)} placeholder="e.g. rajesh@company.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Phone *</label>
            <Input value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="e.g. +91 98765 43210" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">License Number *</label>
            <Input value={form.licenseNumber} onChange={e => f("licenseNumber", e.target.value)} placeholder="e.g. DL-1234567890" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">License Expiry *</label>
            <Input type="date" value={form.licenseExpiry} onChange={e => f("licenseExpiry", e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Safety Score (0-100)</label>
            <Input type="number" value={form.safetyScore} onChange={e => f("safetyScore", e.target.value)} min={0} max={100} />
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
          <Button variant="premium" isLoading={saving} onClick={handleSave}>{editRecord ? "Save Changes" : "Register Driver"}</Button>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Remove Driver" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Are you sure you want to remove <span className="font-semibold text-foreground">{deleteTarget?.name}</span>?</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" isLoading={saving} onClick={handleDelete}>Remove Driver</Button>
        </div>
      </Modal>
    </div>
  );
}
