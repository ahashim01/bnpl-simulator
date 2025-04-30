import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import tokenManager from './tokenManager';
import {
  CreatePlanRequest,
  LoginRequest,
  LoginResponse,
  PaymentPlan,
  RegisterRequest,
  User
} from '../types/api';

class ApiService {
  private readonly api: AxiosInstance;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: any) => void;
    config: AxiosRequestConfig;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
      withCredentials: true, // Allow sending cookies
    });

    this.api.interceptors.request.use((config) => {
      const token = tokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle token refresh logic
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject, config: originalRequest });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Call refresh endpoint (in production with httpOnly cookies)
            const { data } = await this.refreshToken();

            // Store the new access token
            if (data.access) {
              tokenManager.setTokens(data);
              this.api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;

              // Process the queue
              this.processQueue(null, data.access);

              // Retry the original request
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            tokenManager.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(promise => {
      if (error) {
        promise.reject(error);
      } else if (token) {
        promise.config.headers ??= {};
        promise.config.headers.Authorization = `Bearer ${token}`;
        promise.resolve(this.api(promise.config));
      }
    });

    this.failedQueue = [];
  }

  private async refreshToken() {
    if (process.env.NODE_ENV === 'development') {
      // In development, use localStorage for refresh token
      const refreshToken = localStorage.getItem('bnpl_refresh_token');
      return this.api.post<LoginResponse>('/token/refresh/', { refresh: refreshToken });
    } else {
      // In production, the refresh token is in httpOnly cookie
      // and will be sent automatically with the request
      return this.api.post<LoginResponse>('/token/refresh/');
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await this.api.post<LoginResponse>('/token/', credentials);
    tokenManager.setTokens(data);
    return data;
  }

  async logout(): Promise<void> {
    // In production, would have an endpoint to clear cookies
    tokenManager.clearTokens();
  }

  async register(userData: RegisterRequest): Promise<void> {
    await this.api.post('/register/', userData);
  }

  // Payment Plans
  async getPlans(): Promise<PaymentPlan[]> {
    const { data } = await this.api.get<PaymentPlan[]>('/plans/');
    return data;
  }

  async createPlan(planData: CreatePlanRequest): Promise<PaymentPlan> {
    const { data } = await this.api.post<PaymentPlan>('/plans/', planData);
    return data;
  }

  // Installments
  async payInstallment(installmentId: number): Promise<void> {
    await this.api.post(`/installments/${installmentId}/pay/`);
  }

  // Customers
  async getCustomers(): Promise<User[]> {
    const { data } = await this.api.get<User[]>('/customers/');
    return data;
  }
}

export default new ApiService();
