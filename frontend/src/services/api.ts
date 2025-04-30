import axios, { AxiosInstance } from 'axios';
import {
  CreatePlanRequest,
  LoginRequest,
  LoginResponse,
  PaymentPlan,
  RegisterRequest,
  User
} from '../types/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
    });

    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("access");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle token refresh logic
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = localStorage.getItem('refresh');
            if (refreshToken) {
              const { data } = await axios.post('/api/token/refresh/', { refresh: refreshToken });
              localStorage.setItem('access', data.access);
              this.api.defaults.headers.common['Authorization'] = `Bearer ${data.access}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, log out the user
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await this.api.post<LoginResponse>('/token/', credentials);
    return data;
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
