// API Service for Blood Bridge Backend Integration
const API_BASE_URL = 'http://localhost/backend/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication token
  getToken() {
    return this.token || localStorage.getItem('authToken');
  }

  // Make API request
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/${endpoint}`;
    const token = this.getToken();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication API
  async register(userData) {
    return this.request('auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(email, password) {
    const response = await this.request('auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.data && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getProfile() {
    return this.request('auth.php?action=profile');
  }

  async updateProfile(profileData) {
    return this.request('auth.php?action=profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(currentPassword, newPassword) {
    return this.request('auth.php?action=password', {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }

  // Admin API
  async getAdminOverview() {
    return this.request('admin.php?action=overview');
  }

  async getHospitals() {
    return this.request('admin.php?action=hospitals');
  }

  async getUsers() {
    return this.request('admin.php?action=users');
  }

  async getDonations() {
    return this.request('admin.php?action=donations');
  }

  async getCreditReports() {
    return this.request('admin.php?action=credits');
  }

  async getAnalytics() {
    return this.request('admin.php?action=analytics');
  }

  async verifyHospital(hospitalId, status) {
    return this.request('admin.php?action=verify_hospital', {
      method: 'POST',
      body: JSON.stringify({ hospital_id: hospitalId, status }),
    });
  }

  async adjustCredits(userId, amount, description) {
    return this.request('admin.php?action=adjust_credits', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, amount, description }),
    });
  }

  async sendNotification(notificationData) {
    return this.request('admin.php?action=send_notification', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async updateUserStatus(userId, status) {
    return this.request('admin.php?action=user_status', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, status }),
    });
  }

  // Hospital API
  async getHospitalOverview() {
    return this.request('hospital.php?action=overview');
  }

  async getBloodRequests() {
    return this.request('hospital.php?action=blood_requests');
  }

  async getAvailableDonors(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`hospital.php?action=donors&${params}`);
  }

  async getHospitalDonations() {
    return this.request('hospital.php?action=donations');
  }

  async getBloodInventory() {
    return this.request('hospital.php?action=inventory');
  }

  async getHospitalStatistics() {
    return this.request('hospital.php?action=statistics');
  }

  async createBloodRequest(requestData) {
    return this.request('hospital.php?action=create_request', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async recordDonation(donationData) {
    return this.request('hospital.php?action=record_donation', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async updateBloodInventory(inventoryData) {
    return this.request('hospital.php?action=update_inventory', {
      method: 'POST',
      body: JSON.stringify(inventoryData),
    });
  }

  async sendDonorNotification(notificationData) {
    return this.request('hospital.php?action=send_notification', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async updateBloodRequest(requestData) {
    return this.request('hospital.php?action=update_request', {
      method: 'PUT',
      body: JSON.stringify(requestData),
    });
  }

  // User API
  async getUserOverview() {
    return this.request('user.php?action=overview');
  }

  async getDonationHistory() {
    return this.request('user.php?action=donation_history');
  }

  async findHospitals(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`user.php?action=find_hospitals&${params}`);
  }

  async getUserProfile() {
    return this.request('user.php?action=profile');
  }

  async updateUserProfile(profileData) {
    return this.request('user.php?action=profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getAchievements() {
    return this.request('user.php?action=achievements');
  }

  async getNotifications() {
    return this.request('user.php?action=notifications');
  }

  async getCreditHistory() {
    return this.request('user.php?action=credit_history');
  }

  async checkEligibility() {
    return this.request('user.php?action=eligibility');
  }

  async getEmergencyAlerts() {
    return this.request('user.php?action=emergency_alerts');
  }

  async markNotificationRead(notificationId) {
    return this.request('user.php?action=mark_notification_read', {
      method: 'PUT',
      body: JSON.stringify({ notification_id: notificationId }),
    });
  }

  // Donations API (Public)
  async getAllDonations() {
    return this.request('donations.php?action=all');
  }

  async getDonationStatistics() {
    return this.request('donations.php?action=statistics');
  }

  async getBloodRequests(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`donations.php?action=blood_requests&${params}`);
  }

  async getEmergencyRequests() {
    return this.request('donations.php?action=emergency_requests');
  }

  async getDonationById(id) {
    return this.request(`donations.php?action=by_id&id=${id}`);
  }

  async searchDonations(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.request(`donations.php?action=search&${params}`);
  }

  async getBloodInventorySummary() {
    return this.request('donations.php?action=inventory_summary');
  }

  async getDonationAnalytics() {
    return this.request('donations.php?action=analytics');
  }

  async exportDonations(format = 'json', filters = {}) {
    const params = new URLSearchParams({ format, ...filters });
    return this.request(`donations.php?action=export&${params}`);
  }

  // Logout
  logout() {
    this.setToken(null);
  }
}

// Create and export API service instance
const apiService = new ApiService();
export default apiService;
