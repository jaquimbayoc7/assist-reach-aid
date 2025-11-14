const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://hybridmodeldisability.onrender.com';

export interface LoginCredentials {
  username: string; // FastAPI OAuth2 uses 'username' field for email
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role: 'admin' | 'médico';
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  role: 'admin' | 'médico';
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Inicializar el token desde localStorage al crear la instancia
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      this.token = storedToken;
    }
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error de autenticación' }));
      throw new Error(error.detail || 'Error al iniciar sesión');
    }

    return response.json();
  }

  async registerDoctor(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/admin/admin/users/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error en el registro' }));
      throw new Error(error.detail || 'Error al registrar usuario');
    }

    return response.json();
  }

  async getUsers(skip: number = 0, limit: number = 100): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/admin/admin/users?skip=${skip}&limit=${limit}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Error al obtener usuarios');
    }

    return response.json();
  }

  async updateUserStatus(userId: number, isActive: boolean): Promise<User> {
    const url = `${API_BASE_URL}/admin/admin/users/${userId}/status`;
    const token = this.token || localStorage.getItem('authToken');
    
    console.log('=== UPDATE USER STATUS DEBUG ===');
    console.log('URL:', url);
    console.log('User ID:', userId);
    console.log('Is Active:', isActive);
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { detail: errorText || 'Error al actualizar estado' };
        }
        
        throw new Error(error.detail || 'Error al actualizar estado del usuario');
      }

      const data = await response.json();
      console.log('Success response:', data);
      return data;
    } catch (error) {
      console.error('=== FETCH ERROR ===');
      console.error('Error type:', error instanceof TypeError ? 'TypeError (Network/CORS issue)' : 'Other');
      console.error('Error message:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
