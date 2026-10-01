import api from './api';
import { getMockStore, saveMockStore } from './mockData';

export const waterPurchaseService = {
  createPurchase: async (data) => {
    try {
      const response = await api.post('/api/water-purchases', data);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const volume = Number(data.purchasedVolume) || 0;
        const unitCost = Number(data.unitCost) || 0;
        const totalCost = volume * unitCost;

        const newPurchase = {
          id: Date.now(),
          apartmentId: Number(data.apartmentId) || 1,
          purchaseType: data.purchaseType || 'TANKER',
          purchasedVolume: volume,
          unitCost: unitCost,
          totalCost: totalCost,
          purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
          supplier: data.supplier || 'Standard Supplier',
          remarks: data.remarks || '',
        };

        store.waterPurchases.unshift(newPurchase);
        saveMockStore(store);
        return newPurchase;
      }
      throw error;
    }
  },

  getApartmentPurchases: async (apartmentId) => {
    try {
      const response = await api.get(`/api/water-purchases/apartment/${apartmentId}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        if (apartmentId) {
          return store.waterPurchases.filter((p) => p.apartmentId === Number(apartmentId));
        }
        return store.waterPurchases;
      }
      throw error;
    }
  },

  getBillingCyclePurchases: async (billingCycleId) => {
    try {
      const response = await api.get(`/api/water-purchases/cycle/${billingCycleId}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        return store.waterPurchases;
      }
      throw error;
    }
  },

  getTotalPurchaseCost: async (apartmentId) => {
    try {
      const response = await api.get(`/api/water-purchases/apartment/${apartmentId}/total-cost`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const purchases = store.waterPurchases.filter((p) => p.apartmentId === Number(apartmentId));
        const total = purchases.reduce((sum, p) => sum + p.totalCost, 0);
        return { totalCost: total, count: purchases.length };
      }
      throw error;
    }
  },
};
