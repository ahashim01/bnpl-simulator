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
import apiService from "../services/api";
import tokenManager from "../services/tokenManager";
import { LoginRequest, User } from "../types/api";

interface JwtPayload {
  user_id: number;
  is_merchant: boolean;
  username?: string;
  exp: number;
  iat: number;
}

interface AuthContextType {
  user: User | null;
  login(username: string, password: string): Promise<void>;
  logout(): void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>(null as never);

// Helper function to transform JWT payload to User object
const transformUserData = (payload: JwtPayload): User => {
  return {
    id: payload.user_id,
    username: payload.username ?? '',
    email: '',  // Email is not included in the token
    isMerchant: payload.is_merchant === true,
  };
};

export default function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize user from token
  useEffect(() => {
    const initializeAuth = () => {
      const token = tokenManager.getAccessToken();
      if (token) {
        try {
          const payload = jwtDecode<JwtPayload>(token);

          // Check if token is expired
          const currentTime = Date.now() / 1000;
          if (payload.exp < currentTime) {
            tokenManager.clearTokens();
            return null;
          }

          setUser(transformUserData(payload));
        } catch (error) {
          console.error("Error decoding token:", error);
          tokenManager.clearTokens();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const loginRequest: LoginRequest = { username, password };
      const { access } = await apiService.login(loginRequest);
      const payload = jwtDecode<JwtPayload>(access);
      const userData = transformUserData(payload);

      setUser(userData);
    } catch (error: any) {
      console.error("Login error:", error);
      setError(error.response?.data?.detail || "Authentication failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    apiService.logout();
    setUser(null);
  }, []);

  const contextValue = useMemo(
    () => ({ user, login, logout, isLoading, error }),
    [user, login, logout, isLoading, error]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
