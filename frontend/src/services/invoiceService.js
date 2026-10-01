import api from './api';
import { getMockStore, saveMockStore } from './mockData';

export const invoiceService = {
  createRazorpayOrder: async (invoiceId) => {
    const response = await api.post(`/api/invoices/${invoiceId}/razorpay/order`);
    return response.data;
  },

  verifyRazorpayPayment: async (invoiceId, payment) => {
    const response = await api.post(`/api/invoices/${invoiceId}/razorpay/verify`, payment);
    return response.data;
  },

  generateInvoice: async (billingCycleId) => {
    try {
      const response = await api.post(`/api/invoices/generate/${billingCycleId}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        
        const newInvoice = {
          id: Date.now(),
          billingCycleId: Number(billingCycleId),
          householdId: 1,
          flatNumber: 'A101',
          residentName: 'Amit Patel',
          billingMonth: 'August 2026',
          consumption: 18,
          baseWaterCharge: 1125,
          sharedAreaCharge: 1470,
          adjustments: 0,
          totalAmount: 2595,
          status: 'UNPAID',
          generatedDate: new Date().toISOString().split('T')[0],
        };

        store.invoices.unshift(newInvoice);
        saveMockStore(store);
        return { message: 'Invoices generated successfully for billing cycle', invoice: newInvoice, count: store.households.length };
      }
      throw error;
    }
  },

  getInvoices: async (params = {}) => {
    try {
      const response = await api.get('/api/invoices', { params });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        if (params.householdId) {
          return store.invoices.filter((inv) => inv.householdId === Number(params.householdId));
        }
        return store.invoices;
      }
      throw error;
    }
  },

  getInvoiceById: async (id) => {
    try {
      const response = await api.get(`/api/invoices/${id}`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        return store.invoices.find((inv) => inv.id === Number(id)) || store.invoices[0];
      }
      throw error;
    }
  },
};
