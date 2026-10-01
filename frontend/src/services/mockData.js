/**
 * Initial Mock / Seed Data for fallback when backend is unavailable.
 */

export const INITIAL_MOCK_DATA = {
  apartments: [
    {
      id: 1,
      name: 'Green Valley Residency',
      address: '100 Waterworks Road, Electronic City',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560100',
      totalFlats: 48,
      createdAt: '2026-01-15T09:00:00Z',
    },
    {
      id: 2,
      name: 'Blue Waters Heights',
      address: '45 Lakeview Avenue, Whitefield',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560066',
      totalFlats: 32,
      createdAt: '2026-02-10T10:30:00Z',
    },
    {
      id: 3,
      name: 'Orchid Towers',
      address: '12 Palm Grove Highway',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560037',
      totalFlats: 60,
      createdAt: '2026-03-01T14:15:00Z',
    },
  ],

  pendingCommunityAdmins: [
    {
      id: 101,
      name: 'Rajesh Sharma',
      email: 'rajesh.sharma@greenvalley.com',
      role: 'COMMUNITY_ADMIN',
      status: 'PENDING',
      apartmentName: 'Green Valley Residency',
      apartmentId: 1,
      requestedAt: '2026-08-10T08:30:00Z',
    },
    {
      id: 102,
      name: 'Priya Verma',
      email: 'priya.verma@bluewaters.com',
      role: 'COMMUNITY_ADMIN',
      status: 'PENDING',
      apartmentName: 'Blue Waters Heights',
      apartmentId: 2,
      requestedAt: '2026-08-11T11:45:00Z',
    },
  ],

  households: [
    {
      id: 1,
      apartmentId: 1,
      flatNumber: 'A101',
      floorNumber: 1,
      occupancy: 4,
      flatArea: 1200,
      meterNumber: 'WM-GV-101',
      meterInstallationDate: '2026-01-20',
      meterStatus: 'INSTALLED',
      status: 'ACTIVE',
      residentName: 'Amit Patel',
      residentEmail: 'amit.patel@gmail.com',
    },
    {
      id: 2,
      apartmentId: 1,
      flatNumber: 'A102',
      floorNumber: 1,
      occupancy: 5,
      flatArea: 1400,
      meterNumber: 'WM-GV-102',
      meterInstallationDate: '2026-01-20',
      meterStatus: 'INSTALLED',
      status: 'ACTIVE',
      residentName: 'Sunita Rao',
      residentEmail: 'sunita.rao@gmail.com',
    },
    {
      id: 3,
      apartmentId: 1,
      flatNumber: 'A103',
      floorNumber: 2,
      occupancy: 2,
      flatArea: 1000,
      meterNumber: 'WM-GV-103',
      meterInstallationDate: '2026-01-21',
      meterStatus: 'INSTALLED',
      status: 'ACTIVE',
      residentName: 'Vikram Singh',
      residentEmail: 'vikram.singh@gmail.com',
    },
    {
      id: 4,
      apartmentId: 1,
      flatNumber: 'A104',
      floorNumber: 2,
      occupancy: 6,
      flatArea: 1600,
      meterNumber: 'WM-GV-104',
      meterInstallationDate: '2026-01-21',
      meterStatus: 'INSTALLED',
      status: 'ACTIVE',
      residentName: 'Kavita Nair',
      residentEmail: 'kavita.nair@gmail.com',
    },
  ],

  readings: [
    { id: 1, householdId: 1, flatNumber: 'A101', readingDate: '2026-08-01', previousReading: 120, currentReading: 138, waterConsumed: 18, remarks: 'Monthly automated check' },
    { id: 2, householdId: 2, flatNumber: 'A102', readingDate: '2026-08-01', previousReading: 210, currentReading: 234, waterConsumed: 24, remarks: 'High occupancy usage' },
    { id: 3, householdId: 3, flatNumber: 'A103', readingDate: '2026-08-01', previousReading: 95, currentReading: 107, waterConsumed: 12, remarks: 'Standard usage' },
    { id: 4, householdId: 4, flatNumber: 'A104', readingDate: '2026-08-01', previousReading: 150, currentReading: 181, waterConsumed: 31, remarks: 'Unusual high consumption' },
  ],

  waterPurchases: [
    {
      id: 1,
      apartmentId: 1,
      purchaseType: 'TANKER',
      purchasedVolume: 10000,
      unitCost: 2.50,
      totalCost: 25000,
      purchaseDate: '2026-08-05',
      supplier: 'Kaveri Tanker Services',
      remarks: 'Emergency water supply for Block A',
    },
    {
      id: 2,
      apartmentId: 1,
      purchaseType: 'MUNICIPAL_SUPPLY',
      purchasedVolume: 25000,
      unitCost: 1.80,
      totalCost: 45000,
      purchaseDate: '2026-08-01',
      supplier: 'BWSSB Municipal Board',
      remarks: 'Monthly piped supply intake',
    },
  ],

  billingCycles: [
    { id: 1, apartmentId: 1, month: 8, year: 2026, status: 'OPEN', totalConsumption: 85, totalCost: 70000, createdAt: '2026-08-01' },
    { id: 2, apartmentId: 1, month: 7, year: 2026, status: 'FINALIZED', totalConsumption: 82, totalCost: 68000, createdAt: '2026-07-01' },
    { id: 3, apartmentId: 1, month: 6, year: 2026, status: 'ARCHIVED', totalConsumption: 78, totalCost: 65000, createdAt: '2026-06-01' },
  ],

  invoices: [
    {
      id: 1001,
      billingCycleId: 2,
      householdId: 1,
      flatNumber: 'A101',
      residentName: 'Amit Patel',
      billingMonth: 'July 2026',
      consumption: 18,
      baseWaterCharge: 1800,
      sharedAreaCharge: 1250,
      adjustments: 0,
      totalAmount: 3050,
      status: 'PAID',
      generatedDate: '2026-07-31',
    },
    {
      id: 1002,
      billingCycleId: 2,
      householdId: 2,
      flatNumber: 'A102',
      residentName: 'Sunita Rao',
      billingMonth: 'July 2026',
      consumption: 24,
      baseWaterCharge: 2400,
      sharedAreaCharge: 1650,
      adjustments: 100,
      totalAmount: 4150,
      status: 'UNPAID',
      generatedDate: '2026-07-31',
    },
  ],

  alerts: [
    {
      id: 1,
      householdId: 2,
      flatNumber: 'A102',
      alertType: 'OVERUSE',
      message: 'Current consumption (24 kL) exceeded monthly limit of 20 kL.',
      currentUsage: 24,
      threshold: 20,
      date: '2026-08-02T10:15:00Z',
      acknowledged: false,
    },
    {
      id: 2,
      householdId: 4,
      flatNumber: 'A104',
      alertType: 'ANOMALY',
      message: 'Current consumption exceeded the historical average + 2σ threshold.',
      currentUsage: 31,
      threshold: 21.5,
      date: '2026-08-03T14:20:00Z',
      acknowledged: false,
    },
  ],
};

export const mockFallbackEnabled = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MOCK_FALLBACKS === 'true';

const MOCK_DATA_VERSION = 2;

export const getMockStore = () => {
  if (!mockFallbackEnabled) throw new Error('Mock fallback is disabled.');
  const stored = localStorage.getItem('hydroflow_mock_db');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed._version === MOCK_DATA_VERSION) return parsed;
    } catch {
      // Reinitialize malformed local data below.
    }
  }
  const seededStore = { ...INITIAL_MOCK_DATA, _version: MOCK_DATA_VERSION };
  localStorage.setItem('hydroflow_mock_db', JSON.stringify(seededStore));
  return seededStore;
};

export const saveMockStore = (store) => {
  localStorage.setItem('hydroflow_mock_db', JSON.stringify(store));
};
