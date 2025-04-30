interface TokenResponse {
    access: string;
    refresh: string;
  }

  class TokenManager {
    private readonly ACCESS_TOKEN_KEY = 'bnpl_access_token';
    private readonly REFRESH_TOKEN_KEY = 'bnpl_refresh_token';

    // In-memory storage for access token
    private accessToken: string | null = null;

    // Initialize from localStorage (only during development)
    constructor() {
      if (process.env.NODE_ENV === 'development') {
        this.accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      }
    }

    // Set tokens (access token in memory, refresh token in cookies)
    setTokens(tokens: TokenResponse): void {
      this.accessToken = tokens.access;

      // In development, back up to localStorage
      if (process.env.NODE_ENV === 'development') {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.access);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refresh);
      }

      // In production, would set HttpOnly cookies via API call
      // This requires a specific endpoint on the backend to set cookies
    }

    // Get the access token
    getAccessToken(): string | null {
      return this.accessToken;
    }

    // Clear all tokens
    clearTokens(): void {
      this.accessToken = null;

      if (process.env.NODE_ENV === 'development') {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      }

      // In production, would clear cookies via API call
    }
  }

  export default new TokenManager();
