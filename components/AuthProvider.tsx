import { authClient } from "@/lib/auth-client";
import { BetterFetchError, SessionQueryParams } from "better-auth/client";
import { createContext, PropsWithChildren, useContext } from "react";

type AuthState = {
  data: {
    user: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      email: string;
      emailVerified: boolean;
      name: string;
      image?: string | null | undefined;
    };
    session: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      expiresAt: Date;
      token: string;
      ipAddress?: string | null | undefined;
      userAgent?: string | null | undefined;
    };
  } | null;
  isPending: boolean;
  isRefetching: boolean;
  error: BetterFetchError | null;
  refetch: (
    queryParams?:
      | {
          query?: SessionQueryParams;
        }
      | undefined,
  ) => Promise<void>;
};

export const AuthContext = createContext<AuthState>({
  data: null,
  isPending: false,
  isRefetching: false,
  error: null,
  refetch: async () => {},
});

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be wrapped in a <AuthProvider />");
  }

  return value;
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const value = authClient.useSession();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
