const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const authService = {
  // Get stored token
  getToken() {
    return localStorage.getItem('neo_auth_token');
  },

  // Set stored token
  setToken(token) {
    if (token) {
      localStorage.setItem('neo_auth_token', token);
    } else {
      localStorage.removeItem('neo_auth_token');
    }
  },

  // Signup API
  async signup({ email, password, userName }) {
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userName })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '회원가입에 실패했습니다.');

      this.setToken(data.token);
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Login API
  async login({ email, password }) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '로그인에 실패했습니다.');

      this.setToken(data.token);
      return data;
    } catch (err) {
      throw err;
    }
  },

  // Logout
  logout() {
    this.setToken(null);
  },

  // Fetch Cloud Data from Server Database
  async fetchUserData() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE}/user-data`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          this.logout();
        }
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  // Sync / Update Cloud Data in Server Database
  async syncUserData(userData) {
    const token = this.getToken();
    if (!token) return false;

    try {
      const res = await fetch(`${API_BASE}/user-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ data: userData })
      });
      return res.ok;
    } catch {
      return false;
    }
  }
};
