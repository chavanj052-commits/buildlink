import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV_CONFIG, getBaseUrl } from './config';

const api = axios.create({
  baseURL: ENV_CONFIG.DEFAULT_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Request interceptor: attach token & ensure dynamic baseURL
api.interceptors.request.use(
  async (config) => {
    try {
      const dynamicUrl = await getBaseUrl();
      if (dynamicUrl) {
        config.baseURL = dynamicUrl;
      }
      const token = await AsyncStorage.getItem(ENV_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Error reading token in API interceptor:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized or session expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      try {
        await AsyncStorage.removeItem(ENV_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        await AsyncStorage.removeItem(ENV_CONFIG.STORAGE_KEYS.USER_DATA);
      } catch {}
    }
    return Promise.reject(error);
  }
);

// Fallback Mock Data for UI previews when specific endpoints are not populated in backend
export const MOCK_DATA = {
  projects: [
    {
      id: 1,
      name: 'Skyline Luxury Villa',
      location: 'Whitefield, Bangalore',
      budget: 8500000,
      spent: 4200000,
      progress: 68,
      status: 'in_progress',
      start_date: '2026-01-10',
      end_date: '2026-11-30',
      homeowner_name: 'Sarah Sharma',
      homeowner_id: 2,
      contractor_name: 'Ramesh Patel',
      contractor_id: 3,
      description: 'Modern 4-BHK duplex villa with sustainable solar integration and private garden.',
      phase: 'Interior & Electrical',
    },
    {
      id: 2,
      name: 'Greenwood Residences',
      location: 'HSR Layout Sector 2, Bangalore',
      budget: 12000000,
      spent: 9800000,
      progress: 90,
      status: 'in_progress',
      start_date: '2025-08-15',
      end_date: '2026-04-15',
      homeowner_name: 'Arjun Mehta',
      contractor_name: 'Ramesh Patel',
      description: 'G+2 Residential building with rainwater harvesting and terrace lounge.',
      phase: 'Finishing & Painting',
    },
    {
      id: 3,
      name: 'Palm Grove Apartments',
      location: 'Indiranagar, Bangalore',
      budget: 4500000,
      spent: 4500000,
      progress: 100,
      status: 'completed',
      start_date: '2025-03-01',
      end_date: '2026-01-20',
      homeowner_name: 'Ananya Rao',
      contractor_name: 'Kavita Builders',
      description: 'Structural retrofit and premium Scandinavian interior renovation.',
      phase: 'Completed & Handed Over',
    },
  ],
  materials: [
    {
      id: 101,
      project_id: 1,
      name: 'Ultratech Super Cement (Grade 53)',
      quantity: 250,
      unit: 'Bags',
      rate: 420,
      total: 105000,
      party: 'contractor',
      status: 'delivered',
      date: '2026-02-14',
    },
    {
      id: 102,
      project_id: 1,
      name: 'Tata Tiscon 550D TMT Rebar (12mm)',
      quantity: 4.5,
      unit: 'Tons',
      rate: 64000,
      total: 288000,
      party: 'homeowner',
      status: 'approved',
      date: '2026-02-18',
    },
    {
      id: 103,
      project_id: 1,
      name: 'Italian White Statuario Marble',
      quantity: 1800,
      unit: 'Sq Ft',
      rate: 350,
      total: 630000,
      party: 'homeowner',
      status: 'ordered',
      date: '2026-02-25',
    },
    {
      id: 104,
      project_id: 1,
      name: 'Havells Fire-Resistant Copper Wires',
      quantity: 30,
      unit: 'Coils',
      rate: 2200,
      total: 66000,
      party: 'contractor',
      status: 'requested',
      date: '2026-03-01',
    },
    {
      id: 105,
      project_id: 1,
      name: 'Kohler Bathroom Fixture Set',
      quantity: 4,
      unit: 'Sets',
      rate: 48000,
      total: 192000,
      party: 'homeowner',
      status: 'requested',
      date: '2026-03-03',
    },
  ],
  payments: [
    {
      id: 201,
      project_id: 1,
      stage: 'Phase 1: Foundation & Plinth Beam',
      amount: 1500000,
      party: 'homeowner',
      status: 'paid',
      date: '2026-01-25',
      payment_type: 'Bank Transfer (NEFT)',
      description: 'Soil excavation, foundation concrete pouring, plinth completed.',
    },
    {
      id: 202,
      project_id: 1,
      stage: 'Phase 2: RCC Framing & Roof Slab',
      amount: 2000000,
      party: 'homeowner',
      status: 'paid',
      date: '2026-02-20',
      payment_type: 'RTGS',
      description: 'Ground and first floor column and slab casting completed.',
    },
    {
      id: 203,
      project_id: 1,
      stage: 'Phase 3: Brickwork & Plastering',
      amount: 1500000,
      party: 'homeowner',
      status: 'in_review',
      date: '2026-03-15',
      payment_type: 'Direct Account Transfer',
      description: 'Internal partition brickwork and double-coat plastering.',
    },
    {
      id: 204,
      project_id: 1,
      stage: 'Phase 4: Flooring, Plumbing & Electrical',
      amount: 1800000,
      party: 'homeowner',
      status: 'pending',
      date: '2026-04-30',
      payment_type: 'Milestone Disbursal',
      description: 'Wiring, concealed piping, and tile laying.',
    },
  ],
};

// API Services
export const AuthService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name, email, password, role) => {
    const res = await api.post('/auth/register', { name, email, password, role });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const ProjectService = {
  getAll: async () => {
    try {
      const res = await api.get('/projects');
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return MOCK_DATA.projects;
    } catch {
      return MOCK_DATA.projects;
    }
  },
  getById: async (id) => {
    try {
      const res = await api.get(`/projects/${id}`);
      return res.data;
    } catch {
      const found = MOCK_DATA.projects.find((p) => String(p.id) === String(id));
      return found || MOCK_DATA.projects[0];
    }
  },
  create: async (projectData) => {
    const res = await api.post('/projects', projectData);
    return res.data;
  },
  update: async (id, projectData) => {
    const res = await api.put(`/projects/${id}`, projectData);
    return res.data;
  },
  getPeople: async () => {
    try {
      const res = await api.get('/projects/people');
      return res.data;
    } catch {
      return [
        { id: 2, name: 'Sarah Sharma', email: 'sarah@homeowner.com', role: 'homeowner' },
        { id: 4, name: 'Arjun Mehta', email: 'arjun@homeowner.com', role: 'homeowner' },
        { id: 3, name: 'Ramesh Patel', email: 'ramesh@contractor.com', role: 'contractor' },
        { id: 5, name: 'Kavita Builders', email: 'kavita@contractor.com', role: 'contractor' },
      ];
    }
  },
};

export const MaterialService = {
  getByProject: async (projectId) => {
    try {
      const res = await api.get(`/materials/project/${projectId}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return MOCK_DATA.materials;
    } catch {
      return MOCK_DATA.materials;
    }
  },
  create: async (projectId, data) => {
    try {
      const res = await api.post(`/materials/project/${projectId}`, data);
      return res.data;
    } catch {
      // Mock success for offline/dev
      const newItem = {
        id: Date.now(),
        project_id: projectId,
        ...data,
        total: (data.quantity || 1) * (data.rate || 0),
        status: data.status || 'requested',
        date: new Date().toISOString().split('T')[0],
      };
      MOCK_DATA.materials.unshift(newItem);
      return newItem;
    }
  },
  getSummary: async (projectId) => {
    try {
      const res = await api.get(`/materials/project/${projectId}/summary`);
      return res.data;
    } catch {
      const totalCost = MOCK_DATA.materials.reduce((sum, m) => sum + (m.total || (m.quantity * m.rate)), 0);
      return {
        total_items: MOCK_DATA.materials.length,
        total_cost: totalCost,
        homeowner_items: MOCK_DATA.materials.filter((m) => m.party === 'homeowner').length,
        contractor_items: MOCK_DATA.materials.filter((m) => m.party === 'contractor').length,
      };
    }
  },
};

export const PaymentService = {
  getByProject: async (projectId) => {
    try {
      const res = await api.get(`/payments/project/${projectId}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return MOCK_DATA.payments;
    } catch {
      return MOCK_DATA.payments;
    }
  },
  create: async (projectId, data) => {
    try {
      const res = await api.post(`/payments/project/${projectId}`, data);
      return res.data;
    } catch {
      const newPayment = {
        id: Date.now(),
        project_id: projectId,
        ...data,
        status: data.status || 'pending',
        date: new Date().toISOString().split('T')[0],
      };
      MOCK_DATA.payments.unshift(newPayment);
      return newPayment;
    }
  },
};

export const DashboardService = {
  getStats: async () => {
    try {
      const res = await api.get('/dashboard/stats');
      return res.data;
    } catch {
      return {
        totalProjects: 3,
        activeProjects: 2,
        completedProjects: 1,
        totalBudget: 25000000,
        pendingApprovals: 4,
        contractorTasks: 12,
      };
    }
  },
};

export default api;
