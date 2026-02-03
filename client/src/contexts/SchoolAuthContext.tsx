import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { AuthUser } from "@shared/types";

interface SchoolAuthContextType {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const SchoolAuthContext = createContext<SchoolAuthContextType | undefined>(undefined);

export function SchoolAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Load user from sessionStorage on mount
    const storedUser = sessionStorage.getItem("schoolUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        sessionStorage.removeItem("schoolUser");
      }
    }
  }, []);

  const login = (user: AuthUser) => {
    setUser(user);
    sessionStorage.setItem("schoolUser", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("schoolUser");
  };

  return (
    <SchoolAuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </SchoolAuthContext.Provider>
  );
}

export function useSchoolAuth() {
  const context = useContext(SchoolAuthContext);
  if (!context) {
    throw new Error("useSchoolAuth must be used within SchoolAuthProvider");
  }
  return context;
}
