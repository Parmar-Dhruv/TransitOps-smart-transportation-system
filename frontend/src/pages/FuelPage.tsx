import { useState, useEffect, useCallback } from "react";
import { Plus, Search, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Modal } from "../components/common/Modal";
import { fuelApi } from "../api/fuel.api";
import { vehiclesApi } from "../api/vehicles.api";
import { driversApi } from "../api/drivers.api";
import { toast } from "sonner";

const emptyForm = {
  vehicleId: "", driverId: "", liters: 0, costPerLiter: 0,
  odometer: 0, refuelDate: new Date().toISOString().slice(0, 16)
};

export default function FuelPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const fetchLogs = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await fuelApi.getFuelLogs({ page, limit: pagination.limit });
      setData(res.data?.data?.fuelLogs || []);
      setPagination(res.data?.data?.pagination || pagination);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load fuel logs");
    } finally { setLoading(false); }
  }, [pagination.limit]);

  useEffect(() => { fetchLogs(1); }, []);

  const loadDropdowns = async () => {
    if (vehicles.length && drivers.length) return;
    try {
      const [vRes, dRes] = await Promise.all([
        vehiclesApi.getVehicles({ limit: 100 }),
        driversApi.getDrivers({ limit: 100 })
      ]);
      setVehicles(vRes.data?.data?.vehicles || []);
      setDrivers(dRes.data?.data?.drivers || []);
    } catch { /* ignore */ }
  };

  const openAdd = async () => { setForm({ ...emptyForm, refuelDate: new Date().toISOString().slice(0, 16) }); await loadDropdowns(); setShowModal(true); };

  const handleCreate = async () => {
    if (!form.vehicleId || !form.driverId || !form.liters || !form.costPerLiter || !form.refuelDate) {
      toast.error("All fields are required"); return;
    }
    try {
      setSaving("create");
      await fuelApi.createFuelLog({
        vehicleId: form.vehicleId, driverId: form.driverId,
        liters: Number(form.liters), costPerLiter: Number(form.costPerLiter),
        odometer: Number(form.odometer),
        refuelDate: new Date(form.refuelDate).toISOString()
      });
      toast.success("Fuel log added successfully");
      setShowModal(false); fetchLogs(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add fuel log");
    } finally { setSaving(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(deleteTarget.id);
      await fuelApi.deleteFuelLog(deleteTarget.id);
      toast.success("Fuel log deleted");
      setDeleteTarget(null); fetchLogs(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally { setSaving(null); }
  };

  const filteredData = data.filter(f =>
    f.vehicle?.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
    f.driver?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { accessorKey: "vehicle", header: "Vehicle", cell: ({ row }: any) => row.original.vehicle?.registrationNumber || "—" },
    { accessorKey: "driver", header: "Driver", cell: ({ row }: any) => row.original.driver?.name || "—" },
    { accessorKey: "liters", header: "Liters", cell: ({ row }: any) => `${Number(row.original.liters || 0).toLocaleString()} L` },
    { accessorKey: "costPerLiter", header: "Cost/L", cell: ({ row }: any) => `$${Number(row.original.costPerLiter || 0).toFixed(2)}` },
    { accessorKey: "totalCost", header: "Total Cost", cell: ({ row }: any) => `$${Number(row.original.totalCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` },
    { accessorKey: "odometer", header: "Odometer", cell: ({ row }: any) => `${Number(row.original.odometer || 0).toLocaleString()} km` },
    { accessorKey: "refuelDate", header: "Date", cell: ({ row }: any) => row.original.refuelDate ? new Date(row.original.refuelDate).toLocaleDateString() : "—" },
    {
      id: "actions", header: "",
      cell: ({ row }: any) => (
        <button onClick={() => setDeleteTarget(row.original)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )
    }
  ];

  const f2 = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Fuel Log" }]} />
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fuel Monitoring</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track fuel consumption across the fleet — {pagination.total} total entries.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchLogs(pagination.page)} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
          <Button variant="premium" onClick={openAdd}><Plus className="mr-2 h-4 w-4" />Add Entry</Button>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input placeholder="Search by vehicle or driver..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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

      {/* Add Fuel Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Fuel Entry" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">Vehicle *</label>
            <select value={form.vehicleId} onChange={e => f2("vehicleId", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select vehicle...</option>
              {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.make} {v.model}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">Driver *</label>
            <select value={form.driverId} onChange={e => f2("driverId", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select driver...</option>
              {drivers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Liters *</label>
            <Input type="number" value={form.liters} onChange={e => f2("liters", e.target.value)} min={0} step={0.1} placeholder="e.g. 80" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Cost per Liter ($) *</label>
            <Input type="number" value={form.costPerLiter} onChange={e => f2("costPerLiter", e.target.value)} min={0} step={0.01} placeholder="e.g. 1.50" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Odometer Reading (km)</label>
            <Input type="number" value={form.odometer} onChange={e => f2("odometer", e.target.value)} min={0} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Refuel Date *</label>
            <Input type="datetime-local" value={form.refuelDate} onChange={e => f2("refuelDate", e.target.value)} />
          </div>
        </div>
        {form.liters > 0 && form.costPerLiter > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-muted/40 text-sm">
            <span className="text-muted-foreground">Estimated total: </span>
            <span className="font-semibold text-emerald-500">${(Number(form.liters) * Number(form.costPerLiter)).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="premium" isLoading={saving === "create"} onClick={handleCreate}>Save Fuel Entry</Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Fuel Log" size="sm">
        <p className="text-sm text-muted-foreground mb-6">Delete fuel log for <span className="font-semibold text-foreground">{deleteTarget?.vehicle?.registrationNumber}</span> ({new Date(deleteTarget?.refuelDate || Date.now()).toLocaleDateString()})?</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="destructive" isLoading={saving === deleteTarget?.id} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
