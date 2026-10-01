import api from './api';
import { getMockStore, saveMockStore } from './mockData';

export const usageService = {
  getReadings: async (householdId, apartmentId) => {
    try {
      const response = await api.get('/api/water-usage/readings', { params: { householdId, apartmentId } });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        if (householdId) {
          return store.readings.filter((r) => r.householdId === Number(householdId));
        }
        if (apartmentId) {
          const householdIds = store.households.filter((h) => h.apartmentId === Number(apartmentId)).map((h) => h.id);
          return store.readings.filter((r) => householdIds.includes(r.householdId));
        }
        return store.readings;
      }
      throw error;
    }
  },

  submitManualReading: async (data) => {
    try {
      const response = await api.post('/api/water-usage/reading', data);
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        const store = getMockStore();
        
        // Check for duplicate reading on same date & household
        const isDuplicate = store.readings.some(
          (r) => r.householdId === Number(data.householdId) && r.readingDate === data.readingDate
        );

        if (isDuplicate) {
          const err = new Error('Duplicate meter reading detected for this household on the specified reading date.');
          err.response = {
            data: { message: 'Duplicate reading error: Meter reading already recorded for date ' + data.readingDate },
          };
          throw err;
        }

        const household = store.households.find((h) => h.id === Number(data.householdId)) || { flatNumber: 'A101' };
        
        // Find previous reading
        const previousReadings = store.readings
          .filter((r) => r.householdId === Number(data.householdId))
          .sort((a, b) => new Date(b.readingDate) - new Date(a.readingDate));
        
        const previousReading = previousReadings.length > 0 ? previousReadings[0].currentReading : Math.max(0, data.meterReading - 15);
        const currentReading = Number(data.meterReading);
        const waterConsumed = Math.max(0, currentReading - previousReading);

        const newReading = {
          id: Date.now(),
          householdId: Number(data.householdId),
          flatNumber: household.flatNumber,
          readingDate: data.readingDate,
          previousReading,
          currentReading,
          waterConsumed,
          remarks: data.remarks || 'Manual Reading Entry',
        };

        store.readings.unshift(newReading);
        saveMockStore(store);
        return newReading;
      }
      throw error;
    }
  },

  uploadUsageCSV: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/water-usage/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      });
      return response.data;
    } catch (error) {
      if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
        // Simulate progressive upload delay for realistic demo
        if (onProgress) {
          onProgress(30);
          await new Promise((r) => setTimeout(r, 200));
          onProgress(70);
          await new Promise((r) => setTimeout(r, 200));
          onProgress(100);
        }

        // Mock upload summary results
        return {
          fileName: file.name,
          totalRecords: 6,
          successCount: 4,
          failedCount: 2,
          duplicateCount: 1,
          validationErrors: [
            { row: 3, field: 'meterReading', message: 'Current reading (95) cannot be lower than previous reading (110)' },
            { row: 5, field: 'readingDate', message: 'Duplicate reading entry for household A102 on 2026-08-01' },
          ],
          processedRecords: [
            { flatNumber: 'A101', readingDate: '2026-08-10', previousReading: 138, currentReading: 156, waterConsumed: 18, status: 'SUCCESS' },
            { flatNumber: 'A102', readingDate: '2026-08-10', previousReading: 234, currentReading: 258, waterConsumed: 24, status: 'SUCCESS' },
            { flatNumber: 'A103', readingDate: '2026-08-10', previousReading: 107, currentReading: 119, waterConsumed: 12, status: 'SUCCESS' },
            { flatNumber: 'A104', readingDate: '2026-08-10', previousReading: 181, currentReading: 210, waterConsumed: 29, status: 'SUCCESS' },
            { flatNumber: 'A101', readingDate: '2026-08-01', previousReading: 120, currentReading: 138, waterConsumed: 18, status: 'DUPLICATE' },
            { flatNumber: 'A105', readingDate: '2026-08-10', previousReading: 110, currentReading: 95, waterConsumed: 0, status: 'INVALID_READING' },
          ],
        };
      }
      throw error;
    }
  },
};
