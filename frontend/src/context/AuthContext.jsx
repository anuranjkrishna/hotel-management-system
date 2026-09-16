import { createContext, useContext, useState, useCallback } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback(async (username, password) => {
    const { data } = await client.post("/auth/token/", { username, password });
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
    const userInfo = { id: data.id, username: data.username, role: data.role, name: data.name };
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
    return userInfo;
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
