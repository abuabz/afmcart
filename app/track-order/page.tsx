"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, PackageCheck, Search } from "lucide-react";
import Header from "@/components/light-header";
import Footer from "@/components/footer";

interface TrackedOrder {
  orderNumber: string;
  status: string;
  statusHistory: Array<{ status: string; note: string; at: string }>;
  items: Array<{ name: string; quantity: number }>;
  total: number;
  createdAt: string;
  updatedAt: string;
}

const labels: Record<string, string> = {
  placed: "Order placed",
  confirmed: "Confirmed",
  packing: "Being prepared",
  shipped: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSearched(false);
    try {
      const response = await fetch("/api/v1/customer/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), pincode: pincode.replace(/\D/g, "") }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Could not look up orders");
      setOrders(payload.data);
      setSearched(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not look up orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7fcf7] text-slate-900">
      <Header />
      <main className="mx-auto min-h-[70vh] max-w-4xl px-5 pb-16 pt-32 sm:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-green-800 hover:text-green-950"><ArrowLeft className="h-4 w-4" /> Back to shop</Link>
        <div className="mt-8 grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
          <section>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-green-800">Afm cart</p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-slate-950">Track your order</h1>
            <p className="mt-4 leading-7 text-slate-600">Enter the mobile number and pincode used at checkout. No account needed.</p>
            <form onSubmit={submit} className="mt-7 space-y-4 rounded-lg border border-green-100 bg-white p-5 shadow-sm sm:p-6">
              <label className="block text-sm font-semibold text-slate-800" htmlFor="track-phone">Mobile number
                <input id="track-phone" autoComplete="tel" inputMode="numeric" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))} required minLength={10} maxLength={10} placeholder="10-digit mobile number" className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-base outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
              </label>
              <label className="block text-sm font-semibold text-slate-800" htmlFor="track-pincode">Delivery pincode
                <input id="track-pincode" autoComplete="postal-code" inputMode="numeric" value={pincode} onChange={(event) => setPincode(event.target.value.replace(/\D/g, "").slice(0, 6))} required minLength={6} maxLength={6} placeholder="6-digit pincode" className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-base outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/15" />
              </label>
              {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
              <button type="submit" disabled={loading || phone.length !== 10 || pincode.length !== 6} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-green-800 px-4 font-bold text-white hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Find my orders
              </button>
              <p className="text-xs leading-5 text-slate-500">Only order status and item summaries are shown. Your address is never displayed here.</p>
            </form>
          </section>

          <section aria-live="polite" className="space-y-4">
            {!searched && !loading && (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-green-200 bg-white/70 p-8 text-center">
                <PackageCheck className="h-9 w-9 text-green-700" />
                <h2 className="mt-3 text-lg font-bold text-slate-900">Your delivery updates</h2>
                <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">Order status appears here after you verify the checkout mobile and pincode.</p>
              </div>
            )}
            {searched && orders.length === 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-6">
                <h2 className="font-bold text-slate-900">No matching orders</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">Check the mobile number and pincode and try again.</p>
              </div>
            )}
            {orders.map((order) => (
              <article key={order.orderNumber} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Order</p><h2 className="mt-1 text-lg font-black text-slate-950">{order.orderNumber}</h2><p className="mt-1 text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p></div>
                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-bold capitalize text-green-900">{labels[order.status] || order.status}</span>
                </div>
                <ul className="space-y-2 py-4 text-sm text-slate-700">{order.items.map((item, index) => <li key={`${item.name}-${index}`} className="flex justify-between gap-4"><span>{item.name}</span><span className="shrink-0 text-slate-500">× {item.quantity}</span></li>)}</ul>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-sm"><span className="font-semibold text-slate-600">Order total</span><span className="font-black text-slate-950">₹{order.total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span></div>
                <ol className="mt-5 space-y-3 border-l border-green-200 pl-4">
                  {order.statusHistory.map((entry, index) => <li key={`${entry.status}-${entry.at}-${index}`} className="relative text-sm"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-green-700 ring-4 ring-white" /><p className="font-semibold text-slate-800">{labels[entry.status] || entry.status}</p><p className="mt-0.5 text-xs text-slate-500">{entry.note} · {new Date(entry.at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></li>)}
                </ol>
              </article>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}