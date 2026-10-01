import api from './api';
import { getMockStore, saveMockStore } from './mockData';

export const billingService = {
  calculateBill: async (payload) => {
    try {
      const response = await api.post('/api/billing/calculate', payload);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const household = store.households.find((h) => h.id === Number(payload.householdId)) || { flatNumber: 'A101' };

        const currentReading = Number(payload.currentReading);
        const previousEntry = store.readings
          .filter((reading) => reading.householdId === Number(payload.householdId)
            && !(reading.billingMonth === Number(payload.billingMonth)
              && reading.billingYear === Number(payload.billingYear)))
          .sort((a, b) => new Date(b.readingDate) - new Date(a.readingDate))[0];
        const prev = previousEntry?.currentReading ?? 0;
        let curr = Number(payload.currentReading);
        let consumption = curr - prev;
        if (consumption < 0) {
          consumption = curr;
          curr = prev + consumption;
        }

        const existingReading = store.readings.find(
          (reading) => reading.householdId === Number(payload.householdId)
            && reading.billingMonth === Number(payload.billingMonth)
            && reading.billingYear === Number(payload.billingYear)
        );
        const reading = {
          id: existingReading?.id || Date.now(),
          householdId: Number(payload.householdId),
          flatNumber: household.flatNumber,
          billingMonth: Number(payload.billingMonth),
          billingYear: Number(payload.billingYear),
          readingDate: new Date().toISOString().split('T')[0],
          previousReading: prev,
          currentReading: curr,
          waterConsumed: consumption,
          remarks: 'Monthly billing meter reading',
        };
        if (existingReading) Object.assign(existingReading, reading);
        else store.readings.unshift(reading);
        saveMockStore(store);

        // Tier calculations: Tier 1 (0-15 kL @ 50), Tier 2 (15-25 kL @ 75), Tier 3 (>25 kL @ 100)
        let tier1 = Math.min(consumption, 15);
        let tier2 = Math.min(Math.max(0, consumption - 15), 10);
        let tier3 = Math.max(0, consumption - 25);

        let tier1Charge = tier1 * 50;
        let tier2Charge = tier2 * 75;
        let tier3Charge = tier3 * 100;
        let baseWaterCharge = tier1Charge + tier2Charge + tier3Charge;

        // Shared area charge estimation (e.g., ₹1,250)
        let sharedCharge = 1250;
        let totalBill = baseWaterCharge + sharedCharge;

        return {
          householdId: payload.householdId,
          flatNumber: household.flatNumber,
          previousReading: prev,
          currentReading: curr,
          consumption,
          tierBreakdown: {
            tier1: { volume: tier1, rate: 50, amount: tier1Charge },
            tier2: { volume: tier2, rate: 75, amount: tier2Charge },
            tier3: { volume: tier3, rate: 100, amount: tier3Charge },
          },
          baseWaterCharge,
          sharedCharge,
          totalBill,
        };
      }
      throw error;
    }
  },

  calculateAllPending: async (apartmentId, billingMonth, billingYear) => {
    try {
      const response = await api.post('/api/billing/calculate-all', null, {
        params: { apartmentId, billingMonth, billingYear },
      });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const households = store.households.filter((h) => !apartmentId || h.apartmentId === Number(apartmentId));
        let billedCount = 0;
        let skippedCount = 0;
        let noReadingCount = 0;

        households.forEach((h) => {
          const reading = store.readings.find(
            (r) => r.householdId === h.id && r.billingMonth === Number(billingMonth) && r.billingYear === Number(billingYear)
          );
          if (!reading) {
            noReadingCount++;
          } else {
            const existingCycle = store.billingCycles.find(
              (c) => c.householdId === h.id && c.billingMonth === Number(billingMonth) && c.billingYear === Number(billingYear)
            );
            if (existingCycle) {
              skippedCount++;
            } else {
              billedCount++;
              store.billingCycles.push({
                id: Date.now() + Math.random(),
                householdId: h.id,
                flatNumber: h.flatNumber,
                apartmentId: h.apartmentId,
                billingMonth: Number(billingMonth),
                billingYear: Number(billingYear),
                totalConsumption: reading.waterConsumed,
                waterCharge: reading.waterConsumed * 50,
                totalBill: reading.waterConsumed * 50,
                status: 'OPEN',
              });
            }
          }
        });
        saveMockStore(store);

        return {
          apartmentId,
          billingMonth,
          billingYear,
          totalHouseholds: households.length,
          billedCount,
          skippedCount,
          noReadingCount,
          message: `Bulk billing completed: ${billedCount} billed, ${skippedCount} skipped (already billed), ${noReadingCount} pending reading.`,
        };
      }
      throw error;
    }
  },

  uploadUsageCsv: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/water-usage/upload-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getBillingCycles: async (apartmentId) => {
    try {
      const response = await api.get('/api/billing-cycles', { params: { apartmentId } });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        if (apartmentId) {
          return store.billingCycles.filter((c) => c.apartmentId === Number(apartmentId));
        }
        return store.billingCycles;
      }
      throw error;
    }
  },

  finalizeBillingCycle: async (billingCycleId) => {
    try {
      const response = await api.put(`/api/billing-cycles/${billingCycleId}/finalize`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const cycle = store.billingCycles.find((c) => c.id === Number(billingCycleId));
        if (cycle) {
          if (cycle.status === 'ARCHIVED') {
            throw { response: { data: { message: 'Cannot finalize an archived billing cycle.' } } };
          }
          cycle.status = 'FINALIZED';
          saveMockStore(store);
          return cycle;
        }
        throw new Error('Billing cycle not found');
      }
      throw error;
    }
  },

  archiveBillingCycle: async (billingCycleId) => {
    try {
      const response = await api.put(`/api/billing-cycles/${billingCycleId}/archive`);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        const cycle = store.billingCycles.find((c) => c.id === Number(billingCycleId));
        if (cycle) {
          if (cycle.status !== 'FINALIZED') {
            throw { response: { data: { message: 'Only finalized billing cycles can be archived.' } } };
          }
          cycle.status = 'ARCHIVED';
          saveMockStore(store);
          return cycle;
        }
        throw new Error('Billing cycle not found');
      }
      throw error;
    }
  },
};
