import { User, LoginCredentials, RegisterData, AuthResponse } from './types';

const API_BASE_URL = '/api/auth';

class AuthAPI {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    
    // Store access token if provided (token mode)
    if (data.accessToken) {
      this.setAccessToken(data.accessToken);
    }

    return data;
  }

  async logout(): Promise<void> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/logout`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }

    // Clear access token
    this.setAccessToken(null);
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    const response = await fetch(`${API_BASE_URL}/refresh`, {
      method: 'POST',
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Token refresh failed');
    }

    const data = await response.json();
    
    // Update access token
    if (data.accessToken) {
      this.setAccessToken(data.accessToken);
    }

    return data;
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const response = await this.fetchWithAuth(`${API_BASE_URL}/me`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get current user');
    }

    return response.json();
  }
}

export const authAPI = new AuthAPI();