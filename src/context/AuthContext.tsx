import { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  register: () => void; // Usually just redirect
  googleLogin: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user");
      
      if (token && storedUser) {
        // Here you would validate token via axios or hit /me endpoint
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    handleAuth();
  }, []);

  const login = (token: string, refreshToken: string, newUser: User) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const googleLogin = () => {
    // Simulated Google OAuth Flow
    const mockUser: User = { id: "G1", name: "Google User", email: "google@transitops.com", role: "Fleet Manager" };
    login("mock-g-token", "mock-g-refresh", mockUser);
  };

  const register = () => {
    // No-op for context, forms handle API mapping.
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
