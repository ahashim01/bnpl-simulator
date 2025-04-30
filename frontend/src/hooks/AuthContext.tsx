import {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
    useMemo,
    useEffect
  } from "react";
  import { jwtDecode } from "jwt-decode";
  import api from "../services/api";

  interface JwtPayload {
    user_id: number;
    is_merchant: boolean;
    username?: string;
    exp: number;
    iat: number;
  }

  // Add interface for transformed user data with camelCase property names
  interface UserData {
    userId: number;
    isMerchant: boolean;
    username?: string;
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
    // Ensure is_merchant is correctly interpreted as a boolean
    const isMerchant = payload.is_merchant === true ||
                      payload.is_merchant === "true" ||
                      payload.is_merchant === 1;

    console.log("JWT payload:", payload);
    console.log("is_merchant value:", payload.is_merchant, "type:", typeof payload.is_merchant);

    return {
      userId: payload.user_id,
      isMerchant: isMerchant,
      username: payload.username,
      exp: payload.exp,
      iat: payload.iat
    };
  };

  export default function AuthProvider({ children }: { readonly children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(() => {
      const token = localStorage.getItem("access");
      if (token) {
        try {
          const payload = jwtDecode(token) as JwtPayload;
          return transformUserData(payload);
        } catch (error) {
          console.error("Error decoding token:", error);
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          return null;
        }
      }
      return null;
    });

    const login = useCallback(async (username: string, password: string) => {
      try {
        const { data } = await api.post("/token/", { username, password });
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);

        const payload = jwtDecode(data.access) as JwtPayload;
        const userData = transformUserData(payload);
        console.log("Logging in user:", userData);
        setUser(userData);
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    }, []);

    const logout = useCallback(() => {
      localStorage.clear();
      setUser(null);
    }, []);

    // This effect will help debug auth issues
    useEffect(() => {
      if (user) {
        console.log("Current authenticated user:", user);
      }
    }, [user]);

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
