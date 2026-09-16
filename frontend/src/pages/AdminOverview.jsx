import { useMemo } from "react";
import client from "../api/client";
import { usePolling } from "../hooks/usePolling";
import StatusBadge from "../components/StatusBadge";

export default function AdminOverview() {
  const { data: orders } = usePolling(() => client.get("/orders/").then((r) => r.data), 5000);

  const stats = useMemo(() => {
    const list = orders || [];
    const today = new Date().toDateString();
    const todays = list.filter((o) => new Date(o.created_at).toDateString() === today);
    const revenue = todays.filter((o) => o.is_paid).reduce((sum, o) => sum + Number(o.total), 0);
    const active = list.filter((o) => !["paid", "cancelled"].includes(o.status));
    return {
      ordersToday: todays.length,
      revenueToday: revenue,
      active: active.length,
      pendingKitchen: list.filter((o) => ["pending", "preparing"].includes(o.status)).length,
    };
  }, [orders]);

  const recent = (orders || []).slice(0, 10);

  const cards = [
    { label: "Orders today", value: stats.ordersToday },
    { label: "Revenue today", value: `₹${stats.revenueToday.toFixed(0)}` },
    { label: "Active tickets", value: stats.active },
    { label: "With the kitchen", value: stats.pendingKitchen },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Overview</h1>
        <p className="text-sm text-ink-soft">How the floor is running right now.</p>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-taupe bg-white p-5">
            <p className="text-xs font-medium text-ink-soft">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-semibold text-ink">{c.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-lg font-semibold text-ink">Recent orders</h2>
      <div className="overflow-hidden rounded-xl border border-taupe bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-taupe bg-ivory text-left text-ink-soft">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Table</th>
              <th className="px-4 py-3 font-medium">Waiter</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-b border-taupe last:border-0">
                <td className="px-4 py-3 font-medium text-ink">#{o.id}</td>
                <td className="px-4 py-3 text-ink-soft">Table {o.table_number}</td>
                <td className="px-4 py-3 text-ink-soft">{o.created_by_name}</td>
                <td className="px-4 py-3 font-medium text-ink">₹{o.total}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-ink-soft">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
