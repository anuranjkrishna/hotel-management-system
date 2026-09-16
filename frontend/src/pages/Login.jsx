import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME = {
  employee: "/employee",
  kitchen: "/kitchen",
  reception: "/reception",
  admin: "/admin",
};

const DEMO_ACCOUNTS = [
  { role: "Waitstaff", username: "employee1", password: "employee123" },
  { role: "Kitchen", username: "kitchen1", password: "kitchen123" },
  { role: "Reception", username: "reception1", password: "reception123" },
  { role: "Admin", username: "admin", password: "admin123" },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username, password);
      navigate(ROLE_HOME[user.role] || "/employee");
    } catch (err) {
      setError("That username or password doesn't match our records.");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(account) {
    setUsername(account.username);
    setPassword(account.password);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-taupe bg-white shadow-[0_20px_60px_-25px_rgba(42,33,24,0.35)] md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-ink p-10 text-ivory md:flex">
          <div>
            <span className="font-display text-3xl font-semibold">Grand Hotel</span>
            <p className="mt-2 text-sm text-ivory/70">Order desk for the whole floor</p>
          </div>
          <div className="space-y-5">
            <p className="font-display text-xl leading-snug text-ivory/90">
              One ticket, three stations &mdash; waiter, kitchen and the front desk, always in step.
            </p>
            <div className="flex gap-6 text-sm text-ivory/60">
              <div>
                <p className="font-display text-2xl text-gold">3</p>
                <p>stations in sync</p>
              </div>
              <div>
                <p className="font-display text-2xl text-gold">Live</p>
                <p>order status</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10">
          <h1 className="font-display text-2xl font-semibold text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-ink-soft">Use your staff account to open your station.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-taupe bg-ivory px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                placeholder="employee1"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-taupe bg-ivory px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-gold focus:ring-2 focus:ring-gold/20"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-sm text-brick">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-ivory transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 border-t border-taupe pt-4">
            <p className="mb-2 text-xs font-medium text-ink-soft">Demo accounts, for trying the app</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => fillDemo(acc)}
                  type="button"
                  className="rounded-lg border border-taupe px-3 py-2 text-left text-xs text-ink-soft transition-colors hover:border-gold hover:text-ink"
                >
                  <span className="block font-semibold text-ink">{acc.role}</span>
                  {acc.username}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
