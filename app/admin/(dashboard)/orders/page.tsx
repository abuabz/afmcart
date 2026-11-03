"use client";

import { useEffect, useState } from "react";
import { Loader2, PackageCheck, Search } from "lucide-react";

const statuses = ["placed", "confirmed", "packing", "shipped", "delivered", "cancelled"] as const;
type OrderStatus = typeof statuses[number];

interface OrderRow {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  customer: { name: string; phone: string; place: string; district: string; pincode: string };
  items: Array<{ name: string; quantity: number }>;
  total: number;
  createdAt: string;
}

const statusClass: Record<OrderStatus, string> = {
  placed: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-sky-50 text-sky-800 border-sky-200",
  packing: "bg-indigo-50 text-indigo-800 border-indigo-200",
  shipped: "bg-violet-50 text-violet-800 border-violet-200",
  delivered: "bg-green-50 text-green-800 border-green-200",
  cancelled: "bg-red-50 text-red-800 border-red-200",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<OrderRow | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ status, q: search.trim() });
      try {
        const response = await fetch(`/api/admin/orders?${params}`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.message || "Could not load orders");
        setOrders(payload.data);
      } catch (requestError) {
        if (!controller.signal.aborted) setError(requestError instanceof Error ? requestError.message : "Could not load orders");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [status, search]);

  const updateStatus = async (order: OrderRow, nextStatus: OrderStatus) => {
    setSavingId(order._id);
    setError("");
    try {
      const response = await fetch(`/api/admin/orders/${order._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Could not update order");
      setOrders((current) => current.map((item) => item._id === order._id ? { ...item, status: nextStatus } : item));
      setSelected((current) => current?._id === order._id ? { ...current, status: nextStatus } : current);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update order");
    } finally {
      setSavingId("");
    }
  };

  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Storefront</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Orders</h1>
          <p className="mt-1 text-sm text-slate-500">Review customer purchases and keep delivery status current.</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
          <PackageCheck className="h-5 w-5 text-green-700" />
          <div><p className="text-xs text-slate-500">Open in this view</p><p className="font-bold text-slate-900">{activeOrders}</p></div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search order, customer, or mobile" className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
        </label>
        <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" aria-label="Filter by order status">
          <option value="all">All statuses</option>
          {statuses.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}
        </select>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Items</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Placed</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-500"><Loader2 className="mr-2 inline h-5 w-5 animate-spin text-green-700" />Loading orders</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-slate-500">No customer orders found.</td></tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="align-top hover:bg-green-50/30">
                  <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-900">{order.orderNumber}</td>
                  <td className="px-4 py-4"><p className="font-semibold text-slate-900">{order.customer.name}</p><a href={`tel:${order.customer.phone}`} className="mt-1 block text-xs text-slate-500 hover:text-green-800">{order.customer.phone}</a><p className="mt-1 text-xs text-slate-500">{order.customer.place}, {order.customer.district} {order.customer.pincode}</p></td>
                  <td className="max-w-[240px] px-4 py-4 text-slate-600">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items · {order.items.slice(0, 2).map((item) => item.name).join(", ")}{order.items.length > 2 ? "…" : ""}</td>
                  <td className="whitespace-nowrap px-4 py-4 font-bold text-slate-900">₹{order.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-500">{new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                  <td className="px-4 py-4"><select value={order.status} disabled={savingId === order._id || ["delivered", "cancelled"].includes(order.status)} onChange={(event) => updateStatus(order, event.target.value as OrderStatus)} className={`h-9 rounded-md border px-2 text-xs font-bold capitalize outline-none disabled:cursor-not-allowed disabled:opacity-70 ${statusClass[order.status]}`} aria-label={`Update status for ${order.orderNumber}`}>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></td>
                  <td className="px-4 py-4 text-right"><button onClick={() => setSelected(order)} className="text-sm font-bold text-green-800 hover:text-green-950">Details</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/35" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl sm:p-7" aria-label={`Order ${selected.orderNumber} details`}>
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div><p className="text-xs font-bold uppercase tracking-wide text-green-800">Order details</p><h2 className="mt-1 text-2xl font-black text-slate-950">{selected.orderNumber}</h2></div>
              <button onClick={() => setSelected(null)} className="rounded-md p-2 text-slate-500 hover:bg-slate-100" aria-label="Close order details">×</button>
            </div>
            <div className="space-y-6 py-5">
              <section><h3 className="text-sm font-bold text-slate-900">Customer</h3><p className="mt-2 text-sm text-slate-700">{selected.customer.name} · {selected.customer.phone}</p><p className="mt-1 text-sm text-slate-500">{selected.customer.place}, {selected.customer.district} {selected.customer.pincode}</p></section>
              <section><h3 className="text-sm font-bold text-slate-900">Items</h3><ul className="mt-2 divide-y divide-slate-100">{selected.items.map((item, index) => <li key={`${item.name}-${index}`} className="flex justify-between gap-4 py-3 text-sm"><span className="text-slate-700">{item.name} × {item.quantity}</span></li>)}</ul><p className="mt-3 text-right font-black text-slate-950">Total ₹{selected.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</p></section>
              <section><h3 className="text-sm font-bold text-slate-900">Update status</h3><select value={selected.status} disabled={["delivered", "cancelled"].includes(selected.status)} onChange={(event) => updateStatus(selected, event.target.value as OrderStatus)} className={`mt-2 h-10 rounded-md border px-3 text-sm font-bold capitalize ${statusClass[selected.status]}`}>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></section>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}