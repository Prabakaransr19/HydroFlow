import api from './api';
import { getMockStore, saveMockStore } from './mockData';

export const apartmentService = {
  createSuperAdmin: async (data) => {
    const response = await api.post('/api/admin/super-admins', data);
    return response.data;
  },

  getApartments: async () => {
    try {
      const response = await api.get('/api/apartments');
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        return store.apartments;
      }
      throw error;
    }
  },

  getApartmentById: async (id) => {
    try {
      const response = await api.get(`/api/apartments/${id}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        return store.apartments.find((a) => a.id === Number(id)) || store.apartments[0];
      }
      throw error;
    }
  },

  createApartment: async (data) => {
    try {
      const response = await api.post('/api/apartments', data);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const newApt = {
          id: Date.now(),
          ...data,
          totalFlats: Number(data.totalFlats) || 0,
          createdAt: new Date().toISOString(),
        };
        store.apartments.unshift(newApt);
        saveMockStore(store);
        return newApt;
      }
      throw error;
    }
  },

  updateApartment: async (id, data) => {
    try {
      const response = await api.put(`/api/apartments/${id}`, data);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const index = store.apartments.findIndex((a) => a.id === Number(id));
        if (index !== -1) {
          store.apartments[index] = { ...store.apartments[index], ...data };
          saveMockStore(store);
          return store.apartments[index];
        }
        throw new Error('Apartment not found');
      }
      throw error;
    }
  },

  deleteApartment: async (id) => {
    try {
      const response = await api.delete(`/api/apartments/${id}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        store.apartments = store.apartments.filter((a) => a.id !== Number(id));
        saveMockStore(store);
        return { success: true, message: 'Apartment deleted successfully' };
      }
      throw error;
    }
  },

  getPendingCommunityAdmins: async () => {
    try {
      const response = await api.get('/api/admin/pending-community-admins');
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        return store.pendingCommunityAdmins;
      }
      throw error;
    }
  },

  approveCommunityAdmin: async (id) => {
    try {
      const response = await api.put(`/api/admin/approve/${id}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        store.pendingCommunityAdmins = store.pendingCommunityAdmins.filter((a) => a.id !== Number(id));
        saveMockStore(store);
        return { success: true, message: 'Community Admin approved successfully' };
      }
      throw error;
    }
  },

  rejectCommunityAdmin: async (id) => {
    try {
      const response = await api.put(`/api/admin/reject/${id}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        store.pendingCommunityAdmins = store.pendingCommunityAdmins.filter((a) => a.id !== Number(id));
        saveMockStore(store);
        return { success: true, message: 'Community Admin rejected successfully' };
      }
      throw error;
    }
  },
  getAllCommunityAdmins: async () => {
    try {
      const response = await api.get('/api/admin/community-admins');
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        return store.pendingCommunityAdmins || [];
      }
      throw error;
    }
  },
};
