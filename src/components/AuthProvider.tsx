import { authClient } from "@/lib/auth-client";
import { createContext, PropsWithChildren, useContext } from "react";

type AuthState = ReturnType<typeof authClient.useSession>;

export const AuthContext = createContext<AuthState | undefined>(undefined);

export function useAuth() {
  const value = useContext(AuthContext);

  if (value === undefined) {
    throw new Error("useAuth must be wrapped in a <AuthProvider />");
  }

  return value;
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const value = authClient.useSession();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
