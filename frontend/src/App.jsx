import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./components/AppLayout";
import RequireRole from "./components/RequireRole";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import KitchenDashboard from "./pages/KitchenDashboard";
import ReceptionDashboard from "./pages/ReceptionDashboard";
import AdminOverview from "./pages/AdminOverview";
import AdminMenu from "./pages/AdminMenu";
import AdminTables from "./pages/AdminTables";

const ROLE_HOME = {
  employee: "/employee",
  kitchen: "/kitchen",
  reception: "/reception",
  admin: "/admin",
};

function Home() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />

          <Route element={<AppLayout />}>
            <Route
              path="/employee"
              element={
                <RequireRole roles={["employee", "admin"]}>
                  <EmployeeDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/kitchen"
              element={
                <RequireRole roles={["kitchen", "admin"]}>
                  <KitchenDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/reception"
              element={
                <RequireRole roles={["reception", "admin"]}>
                  <ReceptionDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/admin"
              element={
                <RequireRole roles={["admin"]}>
                  <AdminOverview />
                </RequireRole>
              }
            />
            <Route
              path="/admin/menu"
              element={
                <RequireRole roles={["admin"]}>
                  <AdminMenu />
                </RequireRole>
              }
            />
            <Route
              path="/admin/tables"
              element={
                <RequireRole roles={["admin"]}>
                  <AdminTables />
                </RequireRole>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
