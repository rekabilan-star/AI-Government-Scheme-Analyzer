import axios from 'axios';
import {
  User,
  UserProfile,
  GovernmentScheme,
  EligibilityEvaluation,
  SchemeRecommendation,
  ApplicationTracking,
  SavedScheme,
  Notification,
  Feedback
} from '../types/index.js';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth API
export const authApi = {
  register: (data: { name: string; email: string; password: string; profile?: Partial<UserProfile> }) =>
    api.post<{ message: string; token: string; user: User }>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<{ message: string; token: string; user: User }>('/auth/login', data),
  getMe: () =>
    api.get<{ user: User }>('/auth/me'),
  updateProfile: (data: { name?: string; profile: Partial<UserProfile> }) =>
    api.put<{ message: string; user: User }>('/auth/profile', data)
};

// Schemes API
export const schemeApi = {
  getSchemes: (params?: { category?: string; ministry?: string; search?: string; sort?: string; page?: number; limit?: number; includeInactive?: boolean }) =>
    api.get<{
      schemes: GovernmentScheme[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>('/schemes', { params }),
  getSchemeById: (id: string) =>
    api.get<{ scheme: GovernmentScheme }>(`/schemes/${id}`),
  getMeta: () =>
    api.get<{ categories: string[]; ministries: string[] }>('/schemes/meta'),
  createScheme: (data: Partial<GovernmentScheme>) =>
    api.post<{ message: string; scheme: GovernmentScheme }>('/schemes', data),
  updateScheme: (id: string, data: Partial<GovernmentScheme>) =>
    api.put<{ message: string; scheme: GovernmentScheme }>(`/schemes/${id}`, data),
  deleteScheme: (id: string) =>
    api.delete<{ message: string }>(`/schemes/${id}`)
};

// Eligibility API
export const eligibilityApi = {
  analyze: (data: { schemeId: string; profileOverride?: Partial<UserProfile>; requestAiExplanation?: boolean }) =>
    api.post<{ scheme: GovernmentScheme; evaluation: EligibilityEvaluation }>('/eligibility/analyze', data),
  batchAnalyze: (data?: { profileOverride?: Partial<UserProfile> }) =>
    api.post<{
      totalAnalyzed: number;
      evaluations: Array<{ schemeId: string; schemeName: string; shortName: string; category: string; evaluation: EligibilityEvaluation }>;
    }>('/eligibility/batch', data || {})
};

// Recommendations API
export const recommendationApi = {
  getRecommendations: () =>
    api.get<{
      total: number;
      aiOverview: string;
      recommendations: SchemeRecommendation[];
    }>('/recommendations')
};

// Chat API
export const chatApi = {
  sendMessage: (data: { message: string; history?: any[] }) =>
    api.post<{ reply: string; referencedSchemes: string[]; timestamp: string }>('/chat', data)
};

// Applications API
export const applicationApi = {
  getApplications: () =>
    api.get<{ applications: ApplicationTracking[] }>('/applications'),
  createApplication: (data: { schemeId: string; status?: string; applicationDate?: string; trackingNumber?: string; notes?: string }) =>
    api.post<{ message: string; application: ApplicationTracking }>('/applications', data),
  updateApplication: (id: string, data: Partial<ApplicationTracking>) =>
    api.put<{ message: string; application: ApplicationTracking }>(`/applications/${id}`, data),
  deleteApplication: (id: string) =>
    api.delete<{ message: string }>(`/applications/${id}`)
};

// Saved Schemes API
export const savedSchemeApi = {
  getSavedSchemes: () =>
    api.get<{ savedSchemes: SavedScheme[] }>('/saved-schemes'),
  saveScheme: (schemeId: string, notes?: string) =>
    api.post<{ message: string; savedScheme: SavedScheme }>(`/saved-schemes/${schemeId}`, { notes }),
  removeSavedScheme: (schemeId: string) =>
    api.delete<{ message: string }>(`/saved-schemes/${schemeId}`)
};

// Notifications API
export const notificationApi = {
  getNotifications: () =>
    api.get<{ notifications: Notification[]; unreadCount: number }>('/notifications'),
  markAsRead: (id: string) =>
    api.put<{ message: string }>(`/notifications/${id}/read`),
  markAllAsRead: () =>
    api.put<{ message: string }>('/notifications/read-all')
};

// Feedback API
export const feedbackApi = {
  submitFeedback: (data: { rating: number; category: string; comment: string }) =>
    api.post<{ message: string; feedback: Feedback }>('/feedback', data),
  getAllFeedback: () =>
    api.get<{ feedbacks: Feedback[] }>('/feedback'),
  respondToFeedback: (id: string, response: string) =>
    api.put<{ message: string; feedback: Feedback }>(`/feedback/${id}/respond`, { response })
};

// Admin API
export const adminApi = {
  getAnalytics: () =>
    api.get<{
      summary: {
        totalUsers: number;
        citizenCount: number;
        adminCount: number;
        totalSchemes: number;
        activeSchemes: number;
        inactiveSchemes: number;
        totalApplications: number;
        totalFeedbacks: number;
        avgRating: number;
        totalBenefitPool: number;
        avgBenefit: number;
        databaseType: string;
      };
      applicationStatusChart: Array<{ name: string; count: number }>;
      categoryChart: Array<{ name: string; count: number }>;
      ratingDistribution: Array<{ star: string; count: number }>;
      recentFeedbacks: Feedback[];
      recentApplications: ApplicationTracking[];
    }>('/admin/analytics')
};

export default api;
