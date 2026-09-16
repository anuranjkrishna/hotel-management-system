import { useEffect, useMemo, useState } from "react";
import client from "../api/client";
import { usePolling } from "../hooks/usePolling";
import StatusBadge from "../components/StatusBadge";

export default function EmployeeDashboard() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [cart, setCart] = useState({}); // menuItemId -> { item, qty }
  const [placing, setPlacing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    client.get("/menu/categories/").then(({ data }) => {
      setCategories(data);
      if (data.length) setActiveCategory(data[0].id);
    });
    client.get("/tables/").then(({ data }) => setTables(data));
  }, []);

  const { data: myOrders, refresh } = usePolling(
    () => client.get("/orders/").then((r) => r.data),
    4000
  );

  const activeItems = useMemo(
    () => categories.find((c) => c.id === activeCategory)?.items || [],
    [categories, activeCategory]
  );

  const cartList = Object.values(cart);
  const cartTotal = cartList.reduce((sum, c) => sum + c.item.price * c.qty, 0);

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev[item.id];
      return { ...prev, [item.id]: { item, qty: (existing?.qty || 0) + 1 } };
    });
  }

  function changeQty(itemId, delta) {
    setCart((prev) => {
      const existing = prev[itemId];
      if (!existing) return prev;
      const qty = existing.qty + delta;
      if (qty <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { ...existing, qty } };
    });
  }

  async function placeOrder() {
    if (!selectedTable || cartList.length === 0) return;
    setPlacing(true);
    try {
      await client.post("/orders/", {
        table: selectedTable,
        items: cartList.map((c) => ({ menu_item: c.item.id, quantity: c.qty })),
      });
      setCart({});
      setToast("Order sent to the kitchen.");
      refresh();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast("Couldn't place the order. Try again.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">Take an order</h1>
            <p className="text-sm text-ink-soft">Pick a table, then build the order from the menu.</p>
          </div>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="rounded-lg border border-taupe bg-white px-4 py-2.5 text-sm font-medium text-ink outline-none focus:border-gold"
          >
            <option value="">Select table</option>
            {tables.map((t) => (
              <option key={t.id} value={t.id}>
                Table {t.number} {t.is_occupied ? "· occupied" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? "bg-ink text-ivory"
                  : "bg-white text-ink-soft border border-taupe hover:text-ink"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {activeItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.is_available && addToCart(item)}
              disabled={!item.is_available}
              className={`flex items-start justify-between rounded-xl border border-taupe bg-white p-4 text-left transition-shadow hover:shadow-md ${
                !item.is_available ? "opacity-40" : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-sm border ${
                      item.is_veg ? "border-leaf" : "border-brick"
                    }`}
                  >
                    <span
                      className={`block h-1.5 w-1.5 rounded-full m-auto mt-[1px] ${
                        item.is_veg ? "bg-leaf" : "bg-brick"
                      }`}
                    />
                  </span>
                  <p className="font-medium text-ink">{item.name}</p>
                </div>
                {item.description && <p className="mt-1 text-xs text-ink-soft">{item.description}</p>}
                {!item.is_available && <p className="mt-1 text-xs text-brick">Currently unavailable</p>}
              </div>
              <p className="shrink-0 font-display text-base font-semibold text-ink">₹{item.price}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex w-80 shrink-0 flex-col border-l border-taupe bg-white">
        <div className="border-b border-taupe p-5">
          <h2 className="font-display text-lg font-semibold text-ink">Current order</h2>
          <p className="text-xs text-ink-soft">
            {selectedTable ? `Table ${tables.find((t) => t.id === Number(selectedTable))?.number}` : "No table selected"}
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {cartList.length === 0 && <p className="text-sm text-ink-soft">Tap a menu item to add it here.</p>}
          <div className="space-y-3">
            {cartList.map(({ item, qty }) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-ink-soft">₹{item.price} each</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeQty(item.id, -1)}
                    className="h-6 w-6 rounded-full border border-taupe text-sm text-ink-soft hover:border-gold hover:text-ink"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-sm font-medium">{qty}</span>
                  <button
                    onClick={() => changeQty(item.id, 1)}
                    className="h-6 w-6 rounded-full border border-taupe text-sm text-ink-soft hover:border-gold hover:text-ink"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-taupe p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-ink-soft">Total</span>
            <span className="font-display text-lg font-semibold text-ink">₹{cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={placeOrder}
            disabled={!selectedTable || cartList.length === 0 || placing}
            className="w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-ivory transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {placing ? "Sending…" : "Send to kitchen"}
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto border-t border-taupe p-4">
          <p className="mb-2 text-xs font-medium text-ink-soft">Your recent orders</p>
          <div className="space-y-2">
            {(myOrders || []).slice(0, 8).map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg bg-ivory px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-ink">Table {o.table_number} · #{o.id}</p>
                  <p className="text-xs text-ink-soft">₹{o.total}</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-ink px-4 py-2.5 text-sm text-ivory shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
