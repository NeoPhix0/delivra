import AsyncStorage from '@react-native-async-storage/async-storage';
import { httpClient } from './httpClient';
import { adaptKeys } from '@utils/formatters';

export const CURRENCY = 'DA';

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// AUTH
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const authService = {
  async login(email: string, password: string) {
    const data: any = await httpClient.post('/auth/login', { email, password });
    const adapted = data.user ? { ...data, user: adaptKeys(data.user) } : data;
    await AsyncStorage.setItem('authToken', adapted.token);
    await AsyncStorage.setItem('authUser', JSON.stringify(adapted.user));
    return adapted;
  },
  async register(userData: any) {
    const data: any = await httpClient.post('/auth/register', userData);
    const adapted = data.user ? { ...data, user: adaptKeys(data.user) } : data;
    await AsyncStorage.setItem('authToken', adapted.token);
    await AsyncStorage.setItem('authUser', JSON.stringify(adapted.user));
    return adapted;
  },
  async logout() {
    try { await httpClient.post('/auth/logout'); } catch (e) {}
    await AsyncStorage.multiRemove(['authToken', 'authUser']);
  },
  async getMe() {
    return adaptKeys(await httpClient.get('/auth/me'));
  },
  async forgotPassword(email: string) {
    return await httpClient.post('/auth/forgot-password', { email });
  },
  async resetPassword(token: string, password: string) {
    return await httpClient.post('/auth/reset-password', { token, password });
  },
  async verifyEmail(token: string) {
    return await httpClient.post('/auth/verify-email', { token });
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// DELIVERY
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const deliveryService = {
  async getClientDeliveries() {
    const data = await httpClient.get('/client/deliveries');
    if (Array.isArray(data)) return adaptKeys(data);
    if (data.deliveries) {
      data.deliveries = adaptKeys(data.deliveries);
    }
    return adaptKeys(data);
  },
  async getDeliveryById(id: string) {
    const data = await httpClient.get(`/deliveries/${id}`);
    const adapted = adaptKeys(data);
    return adapted;
  },
  async createDelivery(data: any) {
    const body = JSON.stringify(data);
    const response = await httpClient.post('/deliveries', JSON.parse(body));
    return adaptKeys(response);
  },
  async cancelDelivery(id: string) {
    const response = await httpClient.patch(`/deliveries/${id}/cancel`);
    return adaptKeys(response);
  },
  async updateDelivery(id: string, data: any) {
    const response = await httpClient.patch(`/deliveries/${id}`, data);
    return adaptKeys(response);
  },
  async getAvailableDrivers(params?: any) {
    const data = await httpClient.get('/drivers/available', { params });
    if (Array.isArray(data)) return adaptKeys(data);
    if (data.drivers) {
      data.drivers = adaptKeys(data.drivers);
    }
    return adaptKeys(data);
  },
  async getDriverById(id: string) {
    const data = await httpClient.get(`/drivers/${id}`);
    return adaptKeys(data);
  },
  async getDeliveryHistory(params?: { status?: string }) {
    const data = await httpClient.get('/deliveries/history', { params });
    if (data.deliveries) {
      data.deliveries = adaptKeys(data.deliveries);
    }
    return adaptKeys(data);
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// DRIVER
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const driverService = {
  async getAvailableDeliveries() {
    const data = await httpClient.get('/driver/available-deliveries');
    if (Array.isArray(data)) return adaptKeys(data);
    if (data.deliveries) {
      data.deliveries = adaptKeys(data.deliveries);
    }
    return adaptKeys(data);
  },
  async acceptDelivery(id: string) {
    const data = await httpClient.post(`/driver/deliveries/${id}/accept`);
    return adaptKeys(data);
  },
  async rejectDelivery(id: string) {
    const data = await httpClient.post(`/driver/deliveries/${id}/reject`);
    return adaptKeys(data);
  },
  async getDeliveries(params?: any) {
    const data = await httpClient.get('/driver/deliveries', { params });
    if (data.deliveries) {
      data.deliveries = adaptKeys(data.deliveries);
    }
    return adaptKeys(data);
  },
  async updateDeliveryStatus(id: string, status: string) {
    const data = await httpClient.patch(`/deliveries/${id}/status`, { status });
    return adaptKeys(data);
  },
  async getProfile() {
    const data = await httpClient.get('/driver/profile');
    return adaptKeys(data);
  },
  async updateProfile(data: any) {
    const response = await httpClient.put('/driver/profile', data);
    return adaptKeys(response);
  },
  async updateOnlineStatus(isOnline: boolean) {
    return await httpClient.put('/driver/online-status', { is_online: isOnline });
  },
  async updateLocation(lat: number, lng: number) {
    return await httpClient.put('/driver/location', { lat, lng });
  },
  async getEarnings(period?: string) {
    const data = await httpClient.get('/driver/earnings', { params: { period } });
    return adaptKeys(data);
  },
  async getEarningsStats() {
    const data = await httpClient.get('/driver/earnings/stats');
    return adaptKeys(data);
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// CATEGORY
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const categoryService = {
  async getAllCategories() {
    const data = await httpClient.get('/categories');
    if (Array.isArray(data)) return adaptKeys(data);
    if (data.categories) {
      data.categories = adaptKeys(data.categories);
    }
    return adaptKeys(data);
  },
  async getCategoryById(id: string) {
    const data = await httpClient.get(`/categories/${id}`);
    return adaptKeys(data);
  },
  async getPopularCategories() {
    const data = await httpClient.get('/categories/popular');
    if (Array.isArray(data)) return adaptKeys(data);
    if (data.categories) {
      data.categories = adaptKeys(data.categories);
    }
    return adaptKeys(data);
  },
  async createCategory(data: any) {
    const response = await httpClient.post('/categories', data);
    return adaptKeys(response);
  },
  async updateCategory(id: string, data: any) {
    const response = await httpClient.put(`/categories/${id}`, data);
    return adaptKeys(response);
  },
  async deleteCategory(id: string) {
    return await httpClient.delete(`/categories/${id}`);
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// NOTIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const notificationService = {
  async getNotifications() {
    const data = await httpClient.get('/notifications');
    if (Array.isArray(data)) return adaptKeys(data);
    if (data.notifications) {
      data.notifications = adaptKeys(data.notifications);
    }
    return adaptKeys(data);
  },
  async markAsRead(id: string) {
    const data = await httpClient.patch(`/notifications/${id}/read`);
    return adaptKeys(data);
  },
  async markAllAsRead() {
    const data = await httpClient.patch('/notifications/read-all');
    return adaptKeys(data);
  },
  async deleteNotification(id: string) {
    return await httpClient.delete(`/notifications/${id}`);
  },
  async getUnreadCount() {
    return await httpClient.get('/notifications/unread-count');
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// USER
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const userService = {
  async getProfile() {
    const data = await httpClient.get('/users/profile');
    return adaptKeys(data);
  },
  async updateProfile(data: any) {
    const response = await httpClient.put('/users/profile', data);
    return adaptKeys(response);
  },
  async changePassword(currentPassword: string, newPassword: string) {
    return await httpClient.put('/users/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
  async deleteAccount() {
    return await httpClient.delete('/users/account');
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// STATS
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const statsService = {
  async getUserStats() {
    const data = await httpClient.get('/stats/user');
    return adaptKeys(data);
  },
  async getDriverStats() {
    const data = await httpClient.get('/stats/driver');
    return adaptKeys(data);
  },
  async getAdminStats() {
    const data = await httpClient.get('/stats/admin');
    return adaptKeys(data);
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// ADMIN
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const adminService = {
  async getDashboard() {
    const data = await httpClient.get('/admin/dashboard');
    return adaptKeys(data);
  },
  async getUsers(params?: any) {
    const data = await httpClient.get('/admin/users', { params });
    if (data.users) {
      data.users = adaptKeys(data.users);
    }
    return adaptKeys(data);
  },
  async blockUser(id: string) {
    return await httpClient.post(`/admin/users/${id}/block`);
  },
  async unblockUser(id: string) {
    return await httpClient.post(`/admin/users/${id}/unblock`);
  },
  async deleteUser(id: string) {
    return await httpClient.delete(`/admin/users/${id}`);
  },
  async getOrders(params?: any) {
    const data = await httpClient.get('/admin/orders', { params });
    if (data.orders) {
      data.orders = adaptKeys(data.orders);
    }
    return adaptKeys(data);
  },
  async updateOrderStatus(id: string, status: string) {
    const data = await httpClient.put(`/admin/orders/${id}/status`, { status });
    return adaptKeys(data);
  },
  async getTransactions() {
    const data = await httpClient.get('/admin/transactions');
    if (data.transactions) {
      data.transactions = adaptKeys(data.transactions);
    }
    return adaptKeys(data);
  },
  async getSystemStats() {
    const data = await httpClient.get('/admin/system-stats');
    return adaptKeys(data);
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// GEOLOCATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const geolocationService = {
  async geocodeAddress(address: string) {
    return await httpClient.post('/geocode', { address });
  },
  async reverseGeocode(lat: number, lng: number) {
    return await httpClient.post('/reverse-geocode', { lat, lng });
  },
  async calculateDistance(origin: any, destination: any) {
    return await httpClient.post('/geocode/distance', { origin, destination });
  },
  async estimateTime(origin: any, destination: any) {
    return await httpClient.post('/geocode/estimate-time', { origin, destination });
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// SERVICE ZONE
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const serviceZoneService = {
  async getServiceZones() {
    return await httpClient.get('/service-zones');
  },
  async getServiceZoneById(id: string) {
    return await httpClient.get(`/service-zones/${id}`);
  },
  async checkPoint(lat: number, lng: number) {
    return await httpClient.post('/service-zones/check-point', { lat, lng });
  },
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━
// BLOG
// ━━━━━━━━━━━━━━━━━━━━━━━━━
export const blogService = {
  async getAllPosts() {
    const data = await httpClient.get('/blog/posts');
    if (Array.isArray(data)) return adaptKeys(data);
    if (data.posts) {
      data.posts = adaptKeys(data.posts);
    }
    return adaptKeys(data);
  },
  async createPost(data: any) {
    const response = await httpClient.post('/blog/posts', data);
    return adaptKeys(response);
  },
  async updatePost(id: string, data: any) {
    const response = await httpClient.patch(`/blog/posts/${id}`, data);
    return adaptKeys(response);
  },
  async deletePost(id: string) {
    return await httpClient.delete(`/blog/posts/${id}`);
  },
};