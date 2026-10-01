import React, { useEffect, useState } from 'react';
import { waterPurchaseService } from '../../services/waterPurchaseService';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatCurrency, formatVolume } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Truck, Banknote, Droplets, Calendar, CheckCircle2, Building } from 'lucide-react';

const WaterPurchases = () => {
  const { user } = useAuth();
  const apartmentId = user?.apartmentId || user?.apartment?.id || null;

  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    apartmentId: apartmentId,
    purchaseType: 'TANKER',
    purchasedVolume: '10000',
    unitCost: '2.50',
    purchaseDate: new Date().toISOString().split('T')[0],
    supplier: 'Kaveri Tanker Services',
    remarks: 'Emergency water supply intake',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await waterPurchaseService.getApartmentPurchases(apartmentId);
      setPurchases(data);
    } catch (err) {
      setError('Failed to fetch water purchase records.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculated total cost
  const calculatedTotalCost = (Number(formData.purchasedVolume) || 0) * (Number(formData.unitCost) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.purchasedVolume || !formData.unitCost || !formData.supplier) {
      setError('Please fill in volume, unit cost, and supplier.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await waterPurchaseService.createPurchase(formData);
      showToast('Water purchase recorded successfully!');
      fetchPurchases();
      // Reset form
      setFormData({
        apartmentId: apartmentId,
        purchaseType: 'TANKER',
        purchasedVolume: '5000',
        unitCost: '2.50',
        purchaseDate: new Date().toISOString().split('T')[0],
        supplier: '',
        remarks: '',
      });
    } catch (err) {
      setError('Failed to create water purchase record.');
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Stats calculation
  const totalVolume = purchases.reduce((sum, p) => sum + p.purchasedVolume, 0);
  const totalCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
  const latestPurchase = purchases.length > 0 ? purchases[0] : null;

  const columns = [
    {
      header: 'Purchase Date',
      accessor: 'purchaseDate',
      render: (row) => (
        <span className="font-bold text-slate-800 text-xs">{formatDate(row.purchaseDate)}</span>
      ),
    },
    {
      header: 'Supply Type',
      accessor: 'purchaseType',
      render: (row) => <StatusBadge status={row.purchaseType} />,
    },
    {
      header: 'Purchased Volume',
      accessor: 'purchasedVolume',
      render: (row) => (
        <span className="font-extrabold text-sky-800 text-xs font-mono">{formatVolume(row.purchasedVolume)}</span>
      ),
    },
    {
      header: 'Unit Cost',
      accessor: 'unitCost',
      render: (row) => <span className="text-slate-600 text-xs font-mono font-medium">₹{row.unitCost.toFixed(2)} / L</span>,
    },
    {
      header: 'Total Cost',
      accessor: 'totalCost',
      render: (row) => (
        <span className="font-extrabold text-slate-900 text-xs font-mono">{formatCurrency(row.totalCost)}</span>
      ),
    },
    {
      header: 'Supplier Name',
      accessor: 'supplier',
      render: (row) => <span className="text-slate-700 text-xs font-bold">{row.supplier}</span>,
    },
  ];

  if (loading) return <LoadingSpinner message="Fetching water purchase history..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold mb-1.5">
            <Building className="w-3 h-3 text-sky-600" />
            <span>Water Procurement</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Water Purchase Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Log external tanker purchases and municipal supply bulk allocations</p>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchPurchases} />}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Purchased Volume"
          value={formatVolume(totalVolume)}
          icon={Droplets}
          color="cyan"
          subtitle="Cumulative external intake"
        />
        <StatCard
          title="Total Purchase Cost"
          value={formatCurrency(totalCost)}
          icon={Banknote}
          color="indigo"
          subtitle="Shared area cost basis"
        />
        <StatCard
          title="Number of Purchases"
          value={purchases.length}
          unit="Records"
          icon={Truck}
          color="blue"
          subtitle="Procurement count"
        />
        <StatCard
          title="Latest Purchase"
          value={latestPurchase ? formatDate(latestPurchase.purchaseDate) : 'N/A'}
          icon={Calendar}
          color="teal"
          subtitle={latestPurchase ? `${formatVolume(latestPurchase.purchasedVolume)} (${latestPurchase.purchaseType})` : 'None'}
        />
      </div>

      {/* Grid: Form & History Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Creation Form */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Truck className="w-4.5 h-4.5 text-sky-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Record Water Purchase</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Supply Type *</label>
              <select
                value={formData.purchaseType}
                onChange={(e) => setFormData({ ...formData, purchaseType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900"
              >
                <option value="TANKER">Private Water Tanker</option>
                <option value="MUNICIPAL_SUPPLY">BWSSB Municipal Board</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Volume (Liters) *</label>
                <input
                  type="number"
                  required
                  value={formData.purchasedVolume}
                  onChange={(e) => setFormData({ ...formData, purchasedVolume: e.target.value })}
                  placeholder="10000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Unit Cost (₹ / L) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                  placeholder="2.50"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Auto Calculated Total Cost */}
            <div className="p-3 bg-sky-50/80 border border-sky-200/80 rounded-lg flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900">Total Purchase Cost:</span>
              <strong className="text-sm font-extrabold text-sky-950 font-mono">
                {formatCurrency(calculatedTotalCost)}
              </strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Purchase Date *</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Supplier Name *</label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Kaveri Tanker Services"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Remarks</label>
              <input
                type="text"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Emergency water supply intake"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all disabled:opacity-50"
            >
              {submitting ? 'Recording Purchase...' : 'Save Water Purchase'}
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Water Purchase History Logs</h3>
          <DataTable
            columns={columns}
            data={purchases}
            searchKey="supplier"
            searchPlaceholder="Search purchases by supplier or type..."
            emptyMessage="No water purchase logs recorded yet."
          />
        </div>
      </div>
    </div>
  );
};

export default WaterPurchases;
