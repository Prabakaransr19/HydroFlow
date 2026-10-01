import api from './api';
import { getMockStore, saveMockStore } from './mockData';

export const householdService = {
  getHouseholds: async (apartmentId) => {
    try {
      const response = await api.get('/api/households', { params: { apartmentId } });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        if (apartmentId) {
          return store.households.filter((h) => h.apartmentId === Number(apartmentId));
        }
        return store.households;
      }
      throw error;
    }
  },

  getHouseholdById: async (id) => {
    try {
      const response = await api.get(`/api/households/${id}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        return store.households.find((h) => h.id === Number(id)) || store.households[0];
      }
      throw error;
    }
  },

  createHousehold: async (data) => {
    try {
      const response = await api.post('/api/households', data);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const aptId = Number(data.apartmentId) || 1;
        const count = store.households.filter((h) => h.apartmentId === aptId).length;
        const autoMeter = `APT${aptId}-${String(count + 1).padStart(3, '0')}`;
        const newHousehold = {
          id: Date.now(),
          apartmentId: aptId,
          flatNumber: data.flatNumber,
          floorNumber: Number(data.floorNumber) || 1,
          occupancy: Number(data.occupancy) || 1,
          flatArea: Number(data.flatArea) || 1000,
          meterNumber: autoMeter,
          meterInstallationDate: data.meterInstallationDate || new Date().toISOString().split('T')[0],
          meterStatus: 'INSTALLED',
          status: 'ACTIVE',
          residentName: data.residentName || 'Unassigned',
          residentEmail: data.residentEmail || '',
        };
        store.households.unshift(newHousehold);
        saveMockStore(store);
        return newHousehold;
      }
      throw error;
    }
  },

  updateHousehold: async (id, data) => {
    try {
      const response = await api.put(`/api/households/${id}`, data);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const index = store.households.findIndex((h) => h.id === Number(id));
        if (index !== -1) {
          store.households[index] = { ...store.households[index], ...data };
          saveMockStore(store);
          return store.households[index];
        }
        throw new Error('Household not found');
      }
      throw error;
    }
  },

  assignResident: async (householdId, residentData) => {
    try {
      const response = await api.post(`/api/households/${householdId}/assign-resident`, residentData);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const household = store.households.find((h) => h.id === Number(householdId));
        if (household) {
          household.residentName = residentData.name || residentData.residentName;
          household.residentEmail = residentData.email || residentData.residentEmail;
          saveMockStore(store);
          return household;
        }
        throw new Error('Household not found');
      }
      throw error;
    }
  },

  configureMeter: async (householdId, meterData) => {
    try {
      const response = await api.post(`/api/households/${householdId}/meter`, meterData);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const household = store.households.find((h) => h.id === Number(householdId));
        if (household) {
          household.meterNumber = meterData.meterNumber;
          household.meterInstallationDate = meterData.meterInstallationDate;
          household.meterStatus = meterData.meterNumber ? 'INSTALLED' : 'NOT_CONFIGURED';
          saveMockStore(store);
          return household;
        }
        throw new Error('Household not found');
      }
      throw error;
    }
  },
};
