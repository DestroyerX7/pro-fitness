import { authClient } from "@/lib/auth-client";
import { createContext, PropsWithChildren, useContext } from "react";

type AuthenticatedAuthState = {
  user: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
  };
  session: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
};

const AuthenticatedAuthContext = createContext<
  AuthenticatedAuthState | undefined
>(undefined);

export function useAuthenticatedAuth() {
  const value = useContext(AuthenticatedAuthContext);

  if (!value) {
    throw new Error(
      "useAuthenticatedAuth must be used within an authenticated route (inside <AuthenticatedAuthProvider />)",
    );
  }

  return value;
}

export function AuthenticatedAuthProvider({ children }: PropsWithChildren) {
  const { data } = authClient.useSession();

  if (data === null) {
    // Should be unreachable in practice since Stack.Protected gates this,
    // but keeps the provider's contract honest at runtime too.
    throw new Error("AuthenticatedAuthProvider rendered without a session");
  }

  return (
    <AuthenticatedAuthContext.Provider value={data}>
      {children}
    </AuthenticatedAuthContext.Provider>
  );
}
