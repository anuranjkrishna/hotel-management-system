import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = {
  employee: [{ to: "/employee", label: "Take orders", icon: "🧾" }],
  kitchen: [{ to: "/kitchen", label: "Kitchen queue", icon: "🍳" }],
  reception: [{ to: "/reception", label: "Front desk", icon: "🧑‍💼" }],
  admin: [
    { to: "/admin", label: "Overview", icon: "📊" },
    { to: "/admin/menu", label: "Menu", icon: "📋" },
    { to: "/admin/tables", label: "Tables", icon: "🪑" },
  ],
};

const ROLE_LABEL = {
  employee: "Waitstaff",
  kitchen: "Kitchen",
  reception: "Reception",
  admin: "Admin",
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const items = NAV[user?.role] || [];

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col justify-between border-r border-taupe bg-ivory px-4 py-6">
      <div>
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="font-display text-2xl font-semibold text-ink">Tandoor</span>
        </div>
        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-ink text-ivory"
                    : "text-ink-soft hover:bg-ivory-dim hover:text-ink"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-taupe pt-4">
        <div className="px-2">
          <p className="text-sm font-semibold text-ink">{user?.name}</p>
          <p className="text-xs text-ink-soft">{ROLE_LABEL[user?.role] || user?.role}</p>
        </div>
        <button
          onClick={logout}
          className="mt-3 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-brick transition-colors hover:bg-brick-soft"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
