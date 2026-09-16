import client from "../api/client";
import { usePolling } from "../hooks/usePolling";

const COLUMNS = [
  { status: "pending", title: "New tickets", action: "Start cooking", next: null, accent: "border-l-brick" },
  { status: "preparing", title: "On the fire", action: "Mark ready", next: null, accent: "border-l-gold" },
  { status: "ready", title: "Ready to serve", action: null, next: null, accent: "border-l-leaf" },
];

function timeAgo(iso) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  return `${mins} min ago`;
}

export default function KitchenDashboard() {
  const { data: orders, refresh } = usePolling(
    () => client.get("/orders/").then((r) => r.data),
    3500
  );

  async function advance(order) {
    await client.patch(`/orders/${order.id}/set_status/`, {});
    refresh();
  }

  const grouped = COLUMNS.map((col) => ({
    ...col,
    orders: (orders || []).filter((o) => o.status === col.status).sort((a, b) => a.id - b.id),
  }));

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Kitchen queue</h1>
        <p className="text-sm text-ink-soft">Tickets move left to right as food comes together.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {grouped.map((col) => (
          <div key={col.status} className="flex flex-col">
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="font-display text-lg font-semibold text-ink">{col.title}</h2>
              <span className="rounded-full bg-ivory-dim px-2 py-0.5 text-xs font-medium text-ink-soft">
                {col.orders.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {col.orders.length === 0 && (
                <div className="rounded-xl border border-dashed border-taupe p-6 text-center text-sm text-ink-soft">
                  Nothing here right now
                </div>
              )}
              {col.orders.map((order) => (
                <div
                  key={order.id}
                  className={`rounded-xl border border-taupe border-l-4 ${col.accent} bg-white p-4 shadow-sm`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-display text-lg font-semibold text-ink">Table {order.table_number}</p>
                    <p className="text-xs text-ink-soft">{timeAgo(order.created_at)}</p>
                  </div>
                  <ul className="mb-3 space-y-1">
                    {order.items.map((it) => (
                      <li key={it.id} className="flex items-baseline justify-between text-sm">
                        <span className="text-ink">{it.item_name}</span>
                        <span className="font-medium text-ink-soft">×{it.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  {order.notes && (
                    <p className="mb-3 rounded-md bg-ivory px-2 py-1 text-xs text-ink-soft">Note: {order.notes}</p>
                  )}
                  {col.status !== "ready" ? (
                    <button
                      onClick={() => advance(order)}
                      className="w-full rounded-lg bg-ink py-2 text-sm font-semibold text-ivory transition-opacity hover:opacity-90"
                    >
                      {col.action}
                    </button>
                  ) : (
                    <p className="text-center text-xs font-medium text-leaf">Waiting for pickup</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
