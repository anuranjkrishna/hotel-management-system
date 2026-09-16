import { useEffect, useState } from "react";
import client from "../api/client";

const emptyForm = { name: "", category: "", price: "", description: "", is_veg: true };

export default function AdminMenu() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  function load() {
    client.get("/menu/categories/").then(({ data }) => {
      setCategories(data);
      if (!form.category && data.length) setForm((f) => ({ ...f, category: data[0].id }));
    });
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  async function addCategory(e) {
    e.preventDefault();
    if (!newCategory.trim()) return;
    await client.post("/menu/categories/", { name: newCategory, order: categories.length });
    setNewCategory("");
    load();
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description || "",
      is_veg: item.is_veg,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, category: categories[0]?.id || "" });
  }

  async function submitItem(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price) };
      if (editingId) {
        await client.patch(`/menu/items/${editingId}/`, payload);
      } else {
        await client.post("/menu/items/", payload);
      }
      resetForm();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailable(item) {
    await client.patch(`/menu/items/${item.id}/`, { is_available: !item.is_available });
    load();
  }

  async function removeItem(item) {
    if (!confirm(`Remove ${item.name} from the menu?`)) return;
    await client.delete(`/menu/items/${item.id}/`);
    load();
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Menu</h1>
        <p className="text-sm text-ink-soft">Add categories and dishes, or update prices and availability.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {categories.map((cat) => (
            <div key={cat.id} className="overflow-hidden rounded-xl border border-taupe bg-white">
              <div className="border-b border-taupe bg-ivory px-4 py-2.5">
                <h2 className="font-display text-base font-semibold text-ink">{cat.name}</h2>
              </div>
              <table className="w-full text-sm">
                <tbody>
                  {cat.items.map((item) => (
                    <tr key={item.id} className="border-b border-taupe last:border-0">
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-ink">{item.name}</p>
                        {item.description && <p className="text-xs text-ink-soft">{item.description}</p>}
                      </td>
                      <td className="px-4 py-2.5 text-ink-soft">₹{item.price}</td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => toggleAvailable(item)}
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            item.is_available ? "bg-leaf-soft text-leaf" : "bg-ivory-dim text-ink-soft"
                          }`}
                        >
                          {item.is_available ? "Available" : "Unavailable"}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => startEdit(item)} className="mr-2 text-xs font-medium text-ink-soft hover:text-ink">
                          Edit
                        </button>
                        <button onClick={() => removeItem(item)} className="text-xs font-medium text-brick hover:opacity-80">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {cat.items.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-4 text-center text-xs text-ink-soft">No dishes yet in this category.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <form onSubmit={addCategory} className="rounded-xl border border-taupe bg-white p-4">
            <h3 className="mb-3 font-display text-base font-semibold text-ink">New category</h3>
            <div className="flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="e.g. Chef specials"
                className="flex-1 rounded-lg border border-taupe px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <button className="rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-ivory hover:opacity-90">Add</button>
            </div>
          </form>

          <form onSubmit={submitItem} className="rounded-xl border border-taupe bg-white p-4">
            <h3 className="mb-3 font-display text-base font-semibold text-ink">
              {editingId ? "Edit dish" : "New dish"}
            </h3>
            <div className="space-y-3">
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Dish name"
                required
                className="w-full rounded-lg border border-taupe px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                className="w-full rounded-lg border border-taupe px-3 py-2 text-sm outline-none focus:border-gold"
              >
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Price (₹)"
                required
                className="w-full rounded-lg border border-taupe px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short description (optional)"
                className="w-full rounded-lg border border-taupe px-3 py-2 text-sm outline-none focus:border-gold"
              />
              <label className="flex items-center gap-2 text-sm text-ink-soft">
                <input
                  type="checkbox"
                  checked={form.is_veg}
                  onChange={(e) => setForm({ ...form, is_veg: e.target.checked })}
                />
                Vegetarian
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-ink py-2 text-sm font-semibold text-ivory hover:opacity-90 disabled:opacity-60"
                >
                  {editingId ? "Save changes" : "Add dish"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="rounded-lg border border-taupe px-3 py-2 text-sm text-ink-soft">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
