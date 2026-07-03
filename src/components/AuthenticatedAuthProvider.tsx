import { authClient } from "@/lib/auth-client";
import { createContext, PropsWithChildren, useContext } from "react";

type UseSessionResult = ReturnType<typeof authClient.useSession>;
type AuthenticatedAuthState = NonNullable<UseSessionResult["data"]>;

const AuthenticatedAuthContext = createContext<
  AuthenticatedAuthState | undefined
>(undefined);

export function useAuthenticatedAuth() {
  const value = useContext(AuthenticatedAuthContext);

  if (value === undefined) {
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
