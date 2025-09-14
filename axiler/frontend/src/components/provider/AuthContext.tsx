"use client";

import React, { createContext, useContext, type ReactNode } from "react";

// User type definition
export interface User {
  id: string;
  name: string;
  email: string;
}

// Auth context type definition
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for the AuthProvider
interface AuthProviderProps {
  children: ReactNode;
  user: User | null;
}

// AuthProvider component
export function AuthProvider({ children, user }: AuthProviderProps) {
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Please log in to access this page.</div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
