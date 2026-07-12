import { User } from "../types";

// Helper to simulate a database using LocalStorage
const getDB = () => {
  const users = localStorage.getItem("mock_db_users");
  return users ? JSON.parse(users) : [];
};

const saveDB = (users: any[]) => {
  localStorage.setItem("mock_db_users", JSON.stringify(users));
};

export const authApi = {
  login: async (credentials: any) => {
    return new Promise<{ data: { token: string; refreshToken: string; user: User } }>((resolve, reject) => 
      setTimeout(() => {
        // Special case for mock Admin
        if (credentials.email === "admin@transitops.com" && credentials.password === "password123") {
          return resolve({ 
            data: { 
              token: "mock-jwt-token-admin", 
              refreshToken: "mock-refresh-token",
              user: { id: "1", name: "Admin", email: "admin@transitops.com", role: "Admin" } as User 
            } 
          });
        }
        
        const users = getDB();
        const user = users.find((u: any) => u.email === credentials.email && u.password === credentials.password);
        
        if (user) {
          resolve({
            data: {
              token: `mock-jwt-token-${user.id}`,
              refreshToken: `mock-refresh-token-${user.id}`,
              user: {
                id: user.id || Date.now().toString(),
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                role: "Fleet Manager", // Mock role
              } as User
            }
          });
        } else {
          reject(new Error("Invalid credentials. Please check your email and password."));
        }
      }, 1000)
    );
  },

  register: async (data: any) => {
    return new Promise<{ data: { message: string } }>((resolve, reject) => 
      setTimeout(() => {
        const users = getDB();
        if (users.find((u: any) => u.email === data.email)) {
          return reject(new Error("User with this email already exists"));
        }
        users.push({ ...data, id: Date.now().toString() });
        saveDB(users);
        resolve({ data: { message: "Account created successfully" } });
      }, 1000)
    );
  },

  googleLogin: async (token?: string) => {
    return new Promise<{ data: { token: string; refreshToken: string; user: User } }>((resolve) => 
      setTimeout(() => resolve({ 
        data: { 
          token: "mock-google-jwt-token", 
          refreshToken: "mock-google-refresh",
          user: { id: "G1", name: "Google User", email: "user@google.com", role: "Dispatcher" } as User 
        } 
      }), 1500)
    );
  },
  
  forgotPassword: async (email: string) => {
    return new Promise<{ data: { message: string } }>((resolve, reject) => 
      setTimeout(() => {
        if (!email) return reject(new Error("Email is required"));
        resolve({ data: { message: "Reset link sent" } })
      }, 800)
    );
  },

  resetPassword: async (data: any) => {
    return new Promise<{ data: { message: string } }>((resolve) => 
      setTimeout(() => resolve({ data: { message: "Password updated successfully" } }), 800)
    );
  },

  logout: async () => {
    return Promise.resolve();
  },

  refreshToken: async (token: string) => {
    return { data: { token: "new-jwt-token" } };
  },

  me: async () => {
    return { data: { id: "1", name: "Admin", email: "admin@transitops.com", role: "Admin" } as User };
  }
};
