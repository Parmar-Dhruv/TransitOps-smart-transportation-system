import { createContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "../api/auth.api";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string) => Promise<User>;
  register: () => void;
  googleLogin: () => void;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const clearSession = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const response = await authApi.getProfile();
      const currentUser = response.data.data as User;
      setUser(currentUser);
      localStorage.setItem("user", JSON.stringify(currentUser));
      return currentUser;
    } catch {
      clearSession();
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        await refreshUser();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (token: string, refreshToken: string) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.removeItem("user");
    const currentUser = await refreshUser();

    if (!currentUser) {
      throw new Error("Unable to load the authenticated user profile.");
    }

    return currentUser;
  };

  const googleLogin = () => {
    const mockUser: User = {
      id: "G1",
      name: "Google User",
      email: "google@transitops.com",
      role: "FLEET_MANAGER"
    };

    localStorage.setItem("access_token", "mock-g-token");
    localStorage.setItem("refresh_token", "mock-g-refresh");
    localStorage.setItem("user", JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const register = () => {
    // No-op for context, forms handle API mapping.
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, googleLogin, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
