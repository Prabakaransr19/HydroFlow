import api from './api';
import { getMockStore, saveMockStore, mockFallbackEnabled } from './mockData';

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      return response.data;
    } catch (error) {
      if (mockFallbackEnabled && (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        const { email, password } = credentials;
        const mockAccounts = {
          'admin@platform.com': { role: 'SUPER_ADMIN', name: 'Super Administrator', status: 'APPROVED' },
          'community@greenvalley.com': { role: 'COMMUNITY_ADMIN', name: 'Community Manager', status: 'APPROVED', apartment: 'Green Valley Residency' },
          'resident@greenvalley.com': { role: 'RESIDENT', name: 'Amit Patel', status: 'APPROVED', apartment: 'Green Valley Residency', household: 'A101' },
        };
        const account = mockAccounts[email.toLowerCase()];
        if (!account || password !== 'password123') {
          throw { response: { data: { message: 'Invalid email or password.' } } };
        }

        const mockPayload = { sub: email, role: account.role, name: account.name, exp: Math.floor(Date.now() / 1000) + 86400 };
        const mockToken = `mock_jwt_header.${btoa(JSON.stringify(mockPayload))}.mock_signature`;

        return {
          token: mockToken,
          user: {
            id: 1,
            name: account.name,
            email,
            ...account,
          },
        };
      }
      throw error;
    }
  },

  register: async (userData) => {
    const registrationData = { ...userData, role: 'COMMUNITY_ADMIN' };
    try {
      const response = await api.post('/api/auth/register', registrationData);
      return response.data;
    } catch (error) {
      if (mockFallbackEnabled && (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        if (userData.email === 'duplicate@example.com') {
          throw { response: { data: { message: 'An account with this email already exists.' } } };
        }
        
        if (registrationData.role === 'COMMUNITY_ADMIN') {
          const store = getMockStore();
          store.pendingCommunityAdmins.push({
            id: Date.now(),
            name: registrationData.name,
            email: registrationData.email,
            role: 'COMMUNITY_ADMIN',
            status: 'PENDING',
            apartmentName: registrationData.apartmentName || 'Requested Apartment',
            requestedAt: new Date().toISOString(),
          });
          localStorage.setItem('hydroflow_mock_db', JSON.stringify(store));
        }

        return {
          message: registrationData.role === 'COMMUNITY_ADMIN'
            ? 'Registration submitted! Awaiting Super Admin approval.'
            : 'Registration successful! You can now log in.',
          user: {
            name: registrationData.name,
            email: registrationData.email,
            role: registrationData.role,
            status: 'PENDING',
          },
        };
      }
      throw error;
    }
  },

  completeCommunityAdminSetup: async (data) => {
    try {
      const response = await api.post('/api/community/setup', data);
      return response.data;
    } catch (error) {
      if (mockFallbackEnabled && (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        const store = getMockStore();
        let apartment = store.apartments.find((item) => item.id === data.apartmentId);
        if (!apartment) {
          apartment = { id: Date.now(), ...data.apartment, totalFlats: Number(data.apartment.totalFlats), createdAt: new Date().toISOString() };
          store.apartments.push(apartment);
        }
        saveMockStore(store);
        return { user: { ...JSON.parse(localStorage.getItem('user') || '{}'), apartment: apartment.name, apartmentId: apartment.id, requiresApartmentSetup: false } };
      }
      throw error;
    }
  },

  createResidentInvitation: async (data) => {
    try {
      const response = await api.post('/api/auth/invitation/create', data);
      return response.data;
    } catch (error) {
      if (mockFallbackEnabled && (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        const token = 'mock-res-inv-' + Date.now();
        return {
          message: 'Resident invitation link created successfully.',
          token,
          invitationLink: `http://localhost:5173/register/resident?token=${token}`,
          residentName: data.residentName,
          email: data.email,
          status: 'PENDING',
        };
      }
      throw error;
    }
  },

  validateInvitation: async (token) => {
    try {
      const response = await api.get(`/api/auth/invitation/validate?token=${token}`);
      return response.data;
    } catch (error) {
      if (mockFallbackEnabled && (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return {
          message: 'Invitation token is valid.',
          token,
          invitationLink: `http://localhost:5173/register/resident?token=${token}`,
          residentName: 'Amit Patel',
          email: 'amit.patel@gmail.com',
          status: 'PENDING',
        };
      }
      throw error;
    }
  },

  completeResidentRegistration: async (data) => {
    try {
      const response = await api.post('/api/auth/register/resident', data);
      return response.data;
    } catch (error) {
      if (mockFallbackEnabled && (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return {
          id: Date.now(),
          name: 'Amit Patel',
          email: 'amit.patel@gmail.com',
          phone: data.phone || '+919876543210',
          role: 'RESIDENT',
          status: 'APPROVED',
        };
      }
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      if (mockFallbackEnabled && (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          return {
            name: parsed.name || 'Demo User',
            email: parsed.email || 'user@example.com',
            role: parsed.role || 'COMMUNITY_ADMIN',
            status: parsed.status || 'APPROVED',
            apartment: parsed.apartment || 'Green Valley Residency',
            household: parsed.household || (parsed.role === 'RESIDENT' ? 'A101' : 'N/A'),
          };
        }
        return {
          name: 'Rajesh Sharma',
          email: 'admin@greenvalley.com',
          role: 'COMMUNITY_ADMIN',
          status: 'APPROVED',
          apartment: 'Green Valley Residency',
          household: 'N/A',
        };
      }
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.put('/api/auth/profile', data);
      return response.data;
    } catch (error) {
      if (mockFallbackEnabled && (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        const savedUser = localStorage.getItem('user');
        const parsed = savedUser ? JSON.parse(savedUser) : {};
        const updated = { ...parsed, ...data };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      }
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (mockFallbackEnabled && (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        return { message: 'If this email is registered, an OTP has been sent.' };
      }
      throw error;
    }
  },

  resetPassword: async (data) => {
    try {
      const response = await api.post('/api/auth/reset-password', data);
      return response.data;
    } catch (error) {
      if (mockFallbackEnabled && (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED')) {
        if (data.otp === '123456' || data.otp.length === 6) {
          return { message: 'Password reset successfully. Please login.' };
        }
        throw { response: { data: { message: 'Invalid or expired OTP code.' } } };
      }
      throw error;
    }
  },
};
