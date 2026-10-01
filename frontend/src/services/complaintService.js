import api from './api';
import { getMockStore, saveMockStore } from './mockData';

export const complaintService = {
  raiseComplaint: async (data) => {
    try {
      const response = await api.post('/api/complaints', data);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        if (!store.complaints) store.complaints = [];
        const newComplaint = {
          id: Date.now(),
          householdId: 1,
          householdFlatNumber: 'A101',
          apartmentId: 1,
          raisedById: 1,
          raisedByName: 'Amit Patel',
          title: data.title,
          description: data.description,
          category: (data.category || 'OTHER').toUpperCase(),
          status: 'OPEN',
          adminNote: null,
          acknowledgedById: null,
          acknowledgedByName: null,
          acknowledgedAt: null,
          resolvedAt: null,
          createdAt: new Date().toISOString(),
        };
        store.complaints.unshift(newComplaint);
        saveMockStore(store);
        return newComplaint;
      }
      throw error;
    }
  },

  getMyComplaints: async () => {
    try {
      const response = await api.get('/api/complaints/my');
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        if (!store.complaints) {
          store.complaints = [
            {
              id: 101,
              householdId: 1,
              householdFlatNumber: 'A101',
              apartmentId: 1,
              raisedById: 1,
              raisedByName: 'Amit Patel',
              title: 'Water pressure low in master bathroom',
              description: 'Since yesterday morning the pressure in the master bathroom shower has dropped significantly.',
              category: 'LEAK',
              status: 'ACKNOWLEDGED',
              adminNote: 'Plumber scheduled for inspection tomorrow at 10 AM.',
              acknowledgedByName: 'Community Manager',
              acknowledgedAt: '2026-08-25T10:30:00Z',
              resolvedAt: null,
              createdAt: '2026-08-24T14:20:00Z',
            },
            {
              id: 102,
              householdId: 1,
              householdFlatNumber: 'A101',
              apartmentId: 1,
              raisedById: 1,
              raisedByName: 'Amit Patel',
              title: 'Incorrect reading on July bill',
              description: 'July consumption shows 25 kL but meter check showed 18 kL.',
              category: 'BILLING',
              status: 'RESOLVED',
              adminNote: 'Verified meter photo and adjusted July bill by -7 kL.',
              acknowledgedByName: 'Community Manager',
              acknowledgedAt: '2026-08-02T09:00:00Z',
              resolvedAt: '2026-08-03T16:00:00Z',
              createdAt: '2026-08-01T11:00:00Z',
            },
          ];
          saveMockStore(store);
        }
        return store.complaints;
      }
      throw error;
    }
  },

  getApartmentComplaints: async (apartmentId, status) => {
    try {
      const response = await api.get(`/api/complaints/apartment/${apartmentId}`, {
        params: status && status !== 'ALL' ? { status } : {},
      });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        if (!store.complaints) {
          store.complaints = [
            {
              id: 101,
              householdId: 1,
              householdFlatNumber: 'A101',
              apartmentId: 1,
              raisedById: 1,
              raisedByName: 'Amit Patel',
              title: 'Water pressure low in master bathroom',
              description: 'Since yesterday morning the pressure in the master bathroom shower has dropped significantly.',
              category: 'LEAK',
              status: 'ACKNOWLEDGED',
              adminNote: 'Plumber scheduled for inspection tomorrow at 10 AM.',
              acknowledgedByName: 'Community Manager',
              acknowledgedAt: '2026-08-25T10:30:00Z',
              resolvedAt: null,
              createdAt: '2026-08-24T14:20:00Z',
            },
            {
              id: 102,
              householdId: 1,
              householdFlatNumber: 'A101',
              apartmentId: 1,
              raisedById: 1,
              raisedByName: 'Amit Patel',
              title: 'Incorrect reading on July bill',
              description: 'July consumption shows 25 kL but meter check showed 18 kL.',
              category: 'BILLING',
              status: 'RESOLVED',
              adminNote: 'Verified meter photo and adjusted July bill by -7 kL.',
              acknowledgedByName: 'Community Manager',
              acknowledgedAt: '2026-08-02T09:00:00Z',
              resolvedAt: '2026-08-03T16:00:00Z',
              createdAt: '2026-08-01T11:00:00Z',
            },
            {
              id: 103,
              householdId: 2,
              householdFlatNumber: 'A102',
              apartmentId: 1,
              raisedById: 2,
              raisedByName: 'Sunita Rao',
              title: 'Digital meter display glitching',
              description: 'Meter display numbers are flickering and unreadable.',
              category: 'METER',
              status: 'OPEN',
              adminNote: null,
              acknowledgedByName: null,
              acknowledgedAt: null,
              resolvedAt: null,
              createdAt: '2026-08-26T09:15:00Z',
            },
          ];
          saveMockStore(store);
        }
        if (status && status !== 'ALL') {
          return store.complaints.filter((c) => c.status === status);
        }
        return store.complaints;
      }
      throw error;
    }
  },

  acknowledgeComplaint: async (id, adminNote) => {
    try {
      const response = await api.put(`/api/complaints/${id}/acknowledge`, { adminNote });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const comp = (store.complaints || []).find((c) => c.id === Number(id));
        if (comp) {
          comp.status = 'ACKNOWLEDGED';
          comp.adminNote = adminNote;
          comp.acknowledgedByName = 'Community Manager';
          comp.acknowledgedAt = new Date().toISOString();
          saveMockStore(store);
          return comp;
        }
      }
      throw error;
    }
  },

  resolveComplaint: async (id, adminNote) => {
    try {
      const response = await api.put(`/api/complaints/${id}/resolve`, { adminNote });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const comp = (store.complaints || []).find((c) => c.id === Number(id));
        if (comp) {
          comp.status = 'RESOLVED';
          if (adminNote) comp.adminNote = adminNote;
          comp.resolvedAt = new Date().toISOString();
          saveMockStore(store);
          return comp;
        }
      }
      throw error;
    }
  },
};
