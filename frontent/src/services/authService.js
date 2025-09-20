// Authentication Service for Blood Bridge
import apiService from './api';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
  }

  // Initialize authentication state
  init() {
    const token = apiService.getToken();
    if (token) {
      this.isAuthenticated = true;
      // Optionally verify token with backend
      this.verifyToken();
    }
  }

  // Verify token with backend
  async verifyToken() {
    try {
      const response = await apiService.getProfile();
      this.currentUser = response.data;
      this.isAuthenticated = true;
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await apiService.login(email, password);
      this.currentUser = response.data.user;
      this.isAuthenticated = true;
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Register user
  async register(userData) {
    try {
      const response = await apiService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Logout user
  logout() {
    this.currentUser = null;
    this.isAuthenticated = false;
    apiService.logout();
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is authenticated
  isLoggedIn() {
    return this.isAuthenticated && this.currentUser !== null;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.currentUser && this.currentUser.user_type === role;
  }

  // Check if user is admin
  isAdmin() {
    return this.hasRole('admin');
  }

  // Check if user is hospital
  isHospital() {
    return this.hasRole('hospital');
  }

  // Check if user is regular user
  isUser() {
    return this.hasRole('user');
  }

  // Get user type
  getUserType() {
    return this.currentUser ? this.currentUser.user_type : null;
  }

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await apiService.updateProfile(profileData);
      // Update current user data
      this.currentUser = { ...this.currentUser, ...profileData };
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  }

  // Get user profile from backend
  async refreshProfile() {
    try {
      const response = await apiService.getProfile();
      this.currentUser = response.data;
      return response;
    } catch (error) {
      throw error;
    }
  }
}

// Create and export auth service instance
const authService = new AuthService();
export default authService;
