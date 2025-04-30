import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useMemo
  } from "react";
  import { jwtDecode } from "jwt-decode";
  import api from "../services/api";

  interface JwtPayload {
    user_id: number;
    is_merchant: boolean;
    exp: number;
    iat: number;
  }

  // Add interface for transformed user data with camelCase property names
  interface UserData {
    userId: number;
    isMerchant: boolean;
    exp: number;
    iat: number;
  }

  interface Ctx {
    user: UserData | null;
    login(username: string, password: string): Promise<void>;
    logout(): void;
  }

  const AuthCtx = createContext<Ctx>(null as never);

  // Helper function to transform JWT payload to camelCase properties
  const transformUserData = (payload: JwtPayload): UserData => {
    return {
      userId: payload.user_id,
      isMerchant: payload.is_merchant,
      exp: payload.exp,
      iat: payload.iat
    };
  };

  export default function AuthProvider({ children }: { readonly children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(() => {
      const token = localStorage.getItem("access");
      if (token) {
        const payload = jwtDecode(token) as JwtPayload;
        return transformUserData(payload);
      }
      return null;
    });

    const login = useCallback(async (username: string, password: string) => {
      const { data } = await api.post("/token/", { username, password });
      localStorage.setItem("access", data.access);
      localStorage.setItem("refresh", data.refresh);
      const payload = jwtDecode(data.access) as JwtPayload;
      setUser(transformUserData(payload));
    }, []);

    const logout = useCallback(() => {
      localStorage.clear();
      setUser(null);
    }, []);

    const contextValue = useMemo(() => ({ user, login, logout }), [user, login, logout]);

    return (
      <AuthCtx.Provider value={contextValue}>
        {children}
      </AuthCtx.Provider>
    );
  }

  export function useAuth() {
    return useContext(AuthCtx);
  }
