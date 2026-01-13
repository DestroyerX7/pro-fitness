import { authClient } from "@/lib/auth-client";
import { createContext, PropsWithChildren, useContext } from "react";

export const AuthContext = createContext<{
  data: {
    user: {
      id: string;
      // createdAt: Date;
      // updatedAt: Date;
      email: string;
      // emailVerified: boolean;
      name: string;
      image?: string | null | undefined;
    };
    session: {
      id: string;
      // createdAt: Date;
      // updatedAt: Date;
      userId: string;
      expiresAt: Date;
      token: string;
      // ipAddress?: string | null | undefined;
      // userAgent?: string | null | undefined;
    };
  } | null;
  isPending: boolean;
}>({ data: null, isPending: false });

export function useYo() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useYo must be wrapped in a <AuthProvider />");
  }

  return value;
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const val = authClient.useSession();

  return <AuthContext.Provider value={val}>{children}</AuthContext.Provider>;
}

// (property) useSession: () => {
//     data: {
//         user: {
//             id: string;
//             createdAt: Date;
//             updatedAt: Date;
//             email: string;
//             emailVerified: boolean;
//             name: string;
//             image?: string | null | undefined;
//         };
//         session: {
//             id: string;
//             createdAt: Date;
//             updatedAt: Date;
//             userId: string;
//             expiresAt: Date;
//             token: string;
//             ipAddress?: string | null | undefined;
//             userAgent?: string | null | undefined;
//         };
//     } | null;
//     isPending: boolean;
//     isRefetching: boolean;
//     error: {
//         status: number;
//         statusText: string;
//         error: any;
//         name: string;
//         message: string;
//         stack?: string | undefined;
//         cause?: unknown;
//     } | null;
//     refetch: (queryParams?: {
//         query?: {
//             disableCookieCache?: boolean | undefined;
//             disableRefresh?: boolean | undefined;
//         } | undefined;
//     } | undefined) => Promise<...>;
// }
