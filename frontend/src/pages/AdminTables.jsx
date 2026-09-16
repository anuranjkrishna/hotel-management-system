import { useEffect, useState } from "react";
import client from "../api/client";

export default function AdminTables() {
  const [tables, setTables] = useState([]);
  const [number, setNumber] = useState("");
  const [capacity, setCapacity] = useState(4);

  function load() {
    client.get("/tables/").then(({ data }) => setTables(data));
  }

  useEffect(() => { load(); }, []);

  async function addTable(e) {
    e.preventDefault();
    if (!number) return;
    await client.post("/tables/", { number: Number(number), capacity: Number(capacity) });
    setNumber("");
    load();
  }

  async function removeTable(table) {
    if (!confirm(`Remove table ${table.number}?`)) return;
    await client.delete(`/tables/${table.id}/`);
    load();
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Tables</h1>
        <p className="text-sm text-ink-soft">Set up the floor plan waitstaff will order against.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {tables.map((t) => (
              <div
                key={t.id}
                className={`rounded-xl border p-4 text-center ${
                  t.is_occupied ? "border-brick/30 bg-brick-soft" : "border-taupe bg-white"
                }`}
              >
                <p className="font-display text-2xl font-semibold text-ink">{t.number}</p>
                <p className="text-xs text-ink-soft">Seats {t.capacity}</p>
                <p className={`mt-1 text-xs font-medium ${t.is_occupied ? "text-brick" : "text-leaf"}`}>
                  {t.is_occupied ? "Occupied" : "Free"}
                </p>
                <button
                  onClick={() => removeTable(t)}
                  className="mt-2 text-xs font-medium text-ink-soft hover:text-brick"
                >
                  Remove
                </button>
              </div>
            ))}
            {tables.length === 0 && <p className="col-span-full text-sm text-ink-soft">No tables yet — add one to get started.</p>}
          </div>
        </div>

        <form onSubmit={addTable} className="h-fit rounded-xl border border-taupe bg-white p-4">
          <h3 className="mb-3 font-display text-base font-semibold text-ink">Add table</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Table number</label>
              <input
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                className="w-full rounded-lg border border-taupe px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Seats</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full rounded-lg border border-taupe px-3 py-2 text-sm outline-none focus:border-gold"
              />
            </div>
            <button className="w-full rounded-lg bg-ink py-2 text-sm font-semibold text-ivory hover:opacity-90">
              Add table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
