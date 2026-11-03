"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageCircle, Settings2 } from "lucide-react";

export default function StoreSettingsPage() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/settings", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success) throw new Error(payload.message || "Could not load settings");
        if (active) setEnabled(payload.data.whatsappNotificationsEnabled);
      })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load settings"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const update = async (nextValue: boolean) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsappNotificationsEnabled: nextValue }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.message || "Could not save setting");
      setEnabled(nextValue);
      setNotice("Setting saved.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not save setting");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-800">Store controls</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Choose how new online orders notify your team.</p>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">{notice}</p>}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="flex items-start gap-4 border-b border-slate-100 p-5 sm:p-6">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-800"><Settings2 className="h-5 w-5" /></span>
          <div><h2 className="font-bold text-slate-950">Order handling</h2><p className="mt-1 text-sm leading-6 text-slate-600">Every checkout is saved in Orders. WhatsApp is an optional follow-up for your team, not the order database.</p></div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="mt-0.5 h-5 w-5 text-green-700" />
            <div><p className="font-semibold text-slate-900">Open WhatsApp after checkout</p><p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">When enabled, customers can send the saved order number to the store in WhatsApp.</p></div>
          </div>
          <button type="button" role="switch" aria-checked={enabled} aria-label="Toggle WhatsApp follow-up" disabled={loading || saving} onClick={() => update(!enabled)} className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${enabled ? "bg-green-700" : "bg-slate-300"}`}>
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
          </button>
        </div>
        {loading && <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading settings</div>}
        {saving && <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Saving</div>}
      </section>
    </div>
  );
}