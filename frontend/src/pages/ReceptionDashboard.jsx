import { useState } from "react";
import client from "../api/client";
import { usePolling } from "../hooks/usePolling";
import StatusBadge from "../components/StatusBadge";

const METHODS = [
  { id: "cash", label: "Cash", icon: "💵" },
  { id: "card", label: "Card", icon: "💳" },
  { id: "qr", label: "QR / UPI", icon: "📱" },
];

export default function ReceptionDashboard() {
  const { data: orders, refresh } = usePolling(
    () => client.get("/orders/").then((r) => r.data),
    3500
  );
  const [billing, setBilling] = useState(null); // order being billed
  const [method, setMethod] = useState("cash");
  const [saving, setSaving] = useState(false);

  const pending = (orders || []).filter((o) => ["ready", "served"].includes(o.status));
  const settled = (orders || []).filter((o) => o.status === "paid").slice(0, 6);

  async function markServed(order) {
    await client.patch(`/orders/${order.id}/set_status/`, {});
    refresh();
  }

  async function confirmPayment() {
    if (!billing) return;
    setSaving(true);
    try {
      await client.patch(`/orders/${billing.id}/set_payment/`, {
        payment_method: method,
        is_paid: true,
      });
      setBilling(null);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Front desk</h1>
        <p className="text-sm text-ink-soft">Serve ready orders and settle the bill.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Awaiting payment</h2>
          <div className="overflow-hidden rounded-xl border border-taupe bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-taupe bg-ivory text-left text-ink-soft">
                  <th className="px-4 py-3 font-medium">Table</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {pending.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-ink-soft">
                      No orders waiting right now.
                    </td>
                  </tr>
                )}
                {pending.map((order) => (
                  <tr key={order.id} className="border-b border-taupe last:border-0">
                    <td className="px-4 py-3 font-medium text-ink">#{order.id} · Table {order.table_number}</td>
                    <td className="px-4 py-3 text-ink-soft">
                      {order.items.map((it) => `${it.item_name} ×${it.quantity}`).join(", ")}
                    </td>
                    <td className="px-4 py-3 font-display font-semibold text-ink">₹{order.total}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-right">
                      {order.status === "ready" ? (
                        <button
                          onClick={() => markServed(order)}
                          className="rounded-lg border border-taupe px-3 py-1.5 text-xs font-medium text-ink hover:border-gold"
                        >
                          Mark served
                        </button>
                      ) : (
                        <button
                          onClick={() => { setBilling(order); setMethod("cash"); }}
                          className="rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-ivory hover:opacity-90"
                        >
                          Take payment
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="mb-3 font-display text-lg font-semibold text-ink">Recently settled</h2>
          <div className="space-y-2">
            {settled.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border border-taupe bg-white px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink">Table {o.table_number} · #{o.id}</p>
                  <p className="text-xs text-ink-soft capitalize">{o.payment_method}</p>
                </div>
                <p className="font-display text-sm font-semibold text-ink">₹{o.total}</p>
              </div>
            ))}
            {settled.length === 0 && <p className="text-sm text-ink-soft">Nothing settled yet today.</p>}
          </div>
        </div>
      </div>

      {billing && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-xl font-semibold text-ink">Table {billing.table_number} · #{billing.id}</h3>
            <div className="my-4 space-y-1.5 border-y border-taupe py-4">
              {billing.items.map((it) => (
                <div key={it.id} className="flex justify-between text-sm">
                  <span className="text-ink-soft">{it.item_name} ×{it.quantity}</span>
                  <span className="text-ink">₹{it.subtotal}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-base font-semibold text-ink">
                <span>Total</span>
                <span>₹{billing.total}</span>
              </div>
            </div>
            <p className="mb-2 text-sm font-medium text-ink">Payment method</p>
            <div className="mb-5 grid grid-cols-3 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`rounded-lg border py-2.5 text-center text-xs font-medium transition-colors ${
                    method === m.id ? "border-gold bg-[#FCF1DA] text-gold-deep" : "border-taupe text-ink-soft"
                  }`}
                >
                  <span className="mb-1 block text-lg">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setBilling(null)}
                className="flex-1 rounded-lg border border-taupe py-2.5 text-sm font-medium text-ink-soft"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                disabled={saving}
                className="flex-1 rounded-lg bg-ink py-2.5 text-sm font-semibold text-ivory hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Confirming…" : "Confirm payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
