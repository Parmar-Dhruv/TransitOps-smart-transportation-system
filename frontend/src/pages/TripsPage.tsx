import { useState, useEffect, useCallback } from "react";
import { Plus, Search, RefreshCw, Play, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { DataTable } from "../components/common/DataTable";
import { StatusBadge } from "../components/common/StatusBadge";
import { Breadcrumb } from "../components/common/Breadcrumb";
import { Modal } from "../components/common/Modal";
import { tripsApi } from "../api/trips.api";
import { vehiclesApi } from "../api/vehicles.api";
import { driversApi } from "../api/drivers.api";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft", DISPATCHED: "In Transit", COMPLETED: "Completed", CANCELLED: "Cancelled"
};

const emptyForm = {
  vehicleId: "", driverId: "", routeDetails: "", cargoWeight: 0,
  startOdometer: 0, revenue: 0, startTime: new Date().toISOString().slice(0, 16)
};

export default function TripsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");

  const fetchTrips = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const res = await tripsApi.getTrips({ status: statusFilter || undefined, page, limit: pagination.limit });
      setData(res.data?.data?.trips || []);
      setPagination(res.data?.data?.pagination || pagination);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load trips");
    } finally { setLoading(false); }
  }, [statusFilter, pagination.limit]);

  useEffect(() => { fetchTrips(1); }, [statusFilter]);

  const loadDropdowns = async () => {
    try {
      const [vRes, dRes] = await Promise.all([
        vehiclesApi.getVehicles({ status: "AVAILABLE", limit: 100 }),
        driversApi.getDrivers({ status: "AVAILABLE", limit: 100 })
      ]);
      setVehicles(vRes.data?.data?.vehicles || []);
      setDrivers(dRes.data?.data?.drivers || []);
    } catch { /* silently ignore */ }
  };

  const openCreate = async () => {
    setForm({ ...emptyForm, startTime: new Date().toISOString().slice(0, 16) });
    await loadDropdowns();
    setShowModal(true);
  };

  const handleCreate = async () => {
    if (!form.vehicleId || !form.driverId || !form.routeDetails || !form.cargoWeight) {
      toast.error("Vehicle, driver, route and cargo weight are required"); return;
    }
    try {
      setSaving("create");
      await tripsApi.createTrip({
        vehicleId: form.vehicleId, driverId: form.driverId,
        routeDetails: form.routeDetails, cargoWeight: Number(form.cargoWeight),
        startOdometer: Number(form.startOdometer) || undefined,
        revenue: Number(form.revenue) || undefined,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined
      });
      toast.success("Trip created successfully");
      setShowModal(false); fetchTrips(1);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create trip");
    } finally { setSaving(null); }
  };

  const handleDispatch = async (id: string) => {
    try {
      setSaving(id);
      await tripsApi.dispatchTrip(id);
      toast.success("Trip dispatched");
      fetchTrips(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Dispatch failed");
    } finally { setSaving(null); }
  };

  const handleComplete = async (id: string) => {
    try {
      setSaving(id);
      await tripsApi.completeTrip(id);
      toast.success("Trip completed");
      fetchTrips(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Complete failed");
    } finally { setSaving(null); }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      setSaving(cancelTarget.id);
      await tripsApi.cancelTrip(cancelTarget.id, { cancelReason: cancelReason || "Cancelled by operator" });
      toast.success("Trip cancelled");
      setCancelTarget(null); setCancelReason(""); fetchTrips(pagination.page);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Cancel failed");
    } finally { setSaving(null); }
  };

  const filteredData = data.filter(t =>
    t.tripNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.routeDetails?.toLowerCase().includes(search.toLowerCase()) ||
    t.vehicle?.registrationNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.driver?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { accessorKey: "tripNumber", header: "Trip No." },
    { accessorKey: "routeDetails", header: "Route" },
    { accessorKey: "vehicle", header: "Vehicle", cell: ({ row }: any) => row.original.vehicle?.registrationNumber || "—" },
    { accessorKey: "driver", header: "Driver", cell: ({ row }: any) => row.original.driver?.name || "—" },
    { accessorKey: "cargoWeight", header: "Cargo (kg)", cell: ({ row }: any) => `${Number(row.original.cargoWeight || 0).toLocaleString()} kg` },
    { accessorKey: "revenue", header: "Revenue", cell: ({ row }: any) => row.original.revenue != null ? `$${Number(row.original.revenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : "—" },
    { accessorKey: "status", header: "Status", cell: ({ row }: any) => <StatusBadge status={STATUS_LABELS[row.original.status] || row.original.status} /> },
    {
      id: "actions", header: "Actions",
      cell: ({ row }: any) => {
        const trip = row.original;
        const isBusy = saving === trip.id;
        return (
          <div className="flex gap-1.5">
            {trip.status === "DRAFT" && (
              <button onClick={() => handleDispatch(trip.id)} disabled={!!saving} title="Dispatch" className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-500 disabled:opacity-50 transition-colors">
                {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            )}
            {trip.status === "DISPATCHED" && (
              <button onClick={() => handleComplete(trip.id)} disabled={!!saving} title="Complete" className="p-1.5 rounded-md hover:bg-emerald-500/10 text-emerald-500 disabled:opacity-50 transition-colors">
                {isBusy ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
              </button>
            )}
            {(trip.status === "DRAFT" || trip.status === "DISPATCHED") && (
              <button onClick={() => { setCancelTarget(trip); setCancelReason(""); }} disabled={!!saving} title="Cancel" className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive disabled:opacity-50 transition-colors">
                <XCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      }
    }
  ];

  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6 flex flex-col h-full">
      <Breadcrumb items={[{ label: "Trips" }]} />
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trips</h1>
          <p className="text-muted-foreground mt-1 text-sm">Dispatch and monitor fleet routes — {pagination.total} total trips.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchTrips(pagination.page)} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button>
          <Button variant="premium" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Create Trip</Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Search trips..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="DISPATCHED">In Transit</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="flex-1 min-h-0">
        <DataTable columns={columns} data={filteredData} loading={loading} />
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={pagination.page <= 1 || loading} onClick={() => fetchTrips(pagination.page - 1)}>Previous</Button>
            <Button size="sm" variant="outline" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => fetchTrips(pagination.page + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Create Trip Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Trip" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">Vehicle * (Available only)</label>
            <select value={form.vehicleId} onChange={e => f("vehicleId", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select vehicle...</option>
              {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.registrationNumber} — {v.make} {v.model}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">Driver * (Available only)</label>
            <select value={form.driverId} onChange={e => f("driverId", e.target.value)} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">Select driver...</option>
              {drivers.map((d: any) => <option key={d.id} value={d.id}>{d.name} — {d.licenseNumber}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium mb-1.5 block">Route Details *</label>
            <Input value={form.routeDetails} onChange={e => f("routeDetails", e.target.value)} placeholder="e.g. Mumbai Depot → Pune Warehouse" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Cargo Weight (kg) *</label>
            <Input type="number" value={form.cargoWeight} onChange={e => f("cargoWeight", e.target.value)} min={0} placeholder="e.g. 5000" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Revenue ($)</label>
            <Input type="number" value={form.revenue} onChange={e => f("revenue", e.target.value)} min={0} placeholder="e.g. 2500" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Start Odometer (km)</label>
            <Input type="number" value={form.startOdometer} onChange={e => f("startOdometer", e.target.value)} min={0} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Scheduled Start Time</label>
            <Input type="datetime-local" value={form.startTime} onChange={e => f("startTime", e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="premium" isLoading={saving === "create"} onClick={handleCreate}>Create Trip</Button>
        </div>
      </Modal>

      {/* Cancel Confirm Modal */}
      <Modal isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Trip" size="sm">
        <p className="text-sm text-muted-foreground mb-3">Cancelling trip <span className="font-semibold text-foreground">{cancelTarget?.tripNumber}</span>.</p>
        <div className="mb-4">
          <label className="text-sm font-medium mb-1.5 block">Cancellation Reason</label>
          <Input value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="e.g. Vehicle breakdown" />
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setCancelTarget(null)}>Back</Button>
          <Button variant="destructive" isLoading={saving === cancelTarget?.id} onClick={handleCancel}>Confirm Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
