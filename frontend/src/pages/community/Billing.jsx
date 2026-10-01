import React, { useEffect, useState } from 'react';
import { Calculator, Upload, Receipt, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { billingService } from '../../services/billingService';
import { householdService } from '../../services/householdService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatCurrency } from '../../utils/formatCurrency';

const Billing = () => {
  const { user } = useAuth();
  const apartmentId = user?.apartmentId || user?.apartment?.id || null;

  const [households, setHouseholds] = useState([]);
  const [selectedHouseholdId, setSelectedHouseholdId] = useState('');
  const [currentReading, setCurrentReading] = useState('');
  const [billingMonth, setBillingMonth] = useState(new Date().getMonth() + 1);
  const [billingYear, setBillingYear] = useState(new Date().getFullYear());
  const [calculatedBill, setCalculatedBill] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);

  // Bulk Billing State
  const [bulkMonth, setBulkMonth] = useState(new Date().getMonth() + 1);
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkSummary, setBulkSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    householdService.getHouseholds(apartmentId)
      .then((data) => {
        setHouseholds(data);
        if (data.length) setSelectedHouseholdId(String(data[0].id));
      })
      .catch(() => setError('Failed to load households.'))
      .finally(() => setLoading(false));
  }, [apartmentId]);

  const handleCalculate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const result = await billingService.calculateBill({
        householdId: Number(selectedHouseholdId),
        billingMonth,
        billingYear,
        currentReading: Number(currentReading),
      });
      setCalculatedBill(result);
      setMessage('Meter reading stored and bill calculated from the active tariff plan.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to store reading and calculate bill.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCalculateAll = async (event) => {
    event.preventDefault();
    setBulkSubmitting(true);
    setError('');
    setBulkSummary(null);
    try {
      const summary = await billingService.calculateAllPending(apartmentId, bulkMonth, bulkYear);
      setBulkSummary(summary);
      setMessage(summary.message || 'Bulk bill calculation completed.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate bulk bills.');
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleCsvUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setUploadResult(await billingService.uploadUsageCsv(file));
      setMessage('Monthly usage CSV uploaded.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload usage CSV.');
    }
  };

  if (!apartmentId) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Community Operations</span>
          <h1 className="text-2xl font-extrabold text-slate-900">Billing Workspace</h1>
        </div>
        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          Apartment not configured. Please complete your apartment setup before using the billing workspace.
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Opening billing workspace..." />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Community Operations</span>
        <h1 className="text-2xl font-extrabold text-slate-900">Billing Workspace</h1>
        <p className="text-xs text-slate-500 mt-1">Store current meter readings, calculate individual bills, or run bulk bill calculation for all pending households.</p>
      </div>
      {error && <ErrorMessage message={error} />}
      {message && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold">{message}</div>}

      {/* Bulk Bill Calculation Form */}
      <form onSubmit={handleCalculateAll} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Zap className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-extrabold text-slate-900">Bulk Bill Calculation (All Households)</h2>
        </div>
        <p className="text-xs text-slate-500">Calculate bills for all households in the community with pending readings for the selected billing period in one step.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <label className="text-xs font-bold text-slate-700">Billing Month
            <input required type="number" min="1" max="12" value={bulkMonth} onChange={(e) => setBulkMonth(Number(e.target.value))} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500" />
          </label>
          <label className="text-xs font-bold text-slate-700">Billing Year
            <input required type="number" min="2000" value={bulkYear} onChange={(e) => setBulkYear(Number(e.target.value))} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500" />
          </label>
          <button type="submit" disabled={bulkSubmitting || !apartmentId} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs disabled:opacity-50 flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>{bulkSubmitting ? 'Calculating All...' : 'Calculate Bills for All Households'}</span>
          </button>
        </div>

        {bulkSummary && (
          <div className="mt-4 bg-sky-50/80 border border-sky-200 rounded-xl p-4 space-y-2 text-xs">
            <div className="font-extrabold text-sky-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>Bulk Calculation Results ({bulkSummary.billingMonth}/{bulkSummary.billingYear})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 font-medium">Total Flat Units</span>
                <strong className="block text-slate-900 text-sm font-extrabold">{bulkSummary.totalHouseholds}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-emerald-200">
                <span className="text-emerald-700 font-medium">Newly Billed</span>
                <strong className="block text-emerald-800 text-sm font-extrabold">{bulkSummary.billedCount}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="text-slate-500 font-medium">Skipped (Already Billed)</span>
                <strong className="block text-slate-700 text-sm font-extrabold">{bulkSummary.skippedCount}</strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-amber-200">
                <span className="text-amber-700 font-medium">Pending Readings</span>
                <strong className="block text-amber-800 text-sm font-extrabold">{bulkSummary.noReadingCount}</strong>
              </div>
            </div>
          </div>
        )}
      </form>

      <form onSubmit={handleCalculate} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3"><Calculator className="w-4 h-4 text-sky-600" /><h2 className="text-sm font-extrabold text-slate-900">Single Household Meter Reading & Calculation</h2></div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <label className="text-xs font-bold text-slate-700">Household<select required value={selectedHouseholdId} onChange={(e) => setSelectedHouseholdId(e.target.value)} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"><option value="">Select flat</option>{households.map((household) => <option key={household.id} value={household.id}>{household.flatNumber}</option>)}</select></label>
          <label className="text-xs font-bold text-slate-700">Month<input required type="number" min="1" max="12" value={billingMonth} onChange={(e) => setBillingMonth(Number(e.target.value))} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" /></label>
          <label className="text-xs font-bold text-slate-700">Year<input required type="number" min="2000" value={billingYear} onChange={(e) => setBillingYear(Number(e.target.value))} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" /></label>
          <label className="text-xs font-bold text-slate-700">Current reading<input required type="number" min="0" step="0.01" value={currentReading} onChange={(e) => setCurrentReading(e.target.value)} className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs" /></label>
        </div>
        <button type="submit" disabled={submitting || !selectedHouseholdId} className="px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-bold disabled:opacity-50">{submitting ? 'Saving and calculating...' : 'Save Reading & Calculate Bill'}</button>
      </form>

      {calculatedBill && <div className="bg-sky-50 border border-sky-200 rounded-xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs"><div><span className="text-slate-500">Previous reading</span><strong className="block text-slate-900">{calculatedBill.previousReading}</strong></div><div><span className="text-slate-500">Consumption</span><strong className="block text-slate-900">{calculatedBill.consumption}</strong></div><div><span className="text-slate-500">Tariff charge</span><strong className="block text-slate-900">{formatCurrency(calculatedBill.waterCharge || calculatedBill.baseWaterCharge)}</strong></div><div><span className="text-slate-500">Total bill</span><strong className="block text-sky-800">{formatCurrency(calculatedBill.totalBill)}</strong></div></div>}

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3"><div className="flex items-center gap-2"><Upload className="w-4 h-4 text-sky-600" /><h2 className="text-sm font-extrabold text-slate-900">Bulk Usage Upload</h2></div><p className="text-xs text-slate-500">CSV format: <code>flatNumber,billingMonth,billingYear,consumption,remarks</code>. Upload one monthly reading per household.</p><label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer">Upload CSV<input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="hidden" /></label>{uploadResult && <p className="text-xs text-emerald-700 font-bold">Processed {uploadResult.successCount || 0}; failed {uploadResult.failedCount || 0}.</p>}</div>

      <div className="flex items-center gap-2 text-xs text-slate-500"><Receipt className="w-4 h-4" />Generated bills are available in the Invoices workspace after invoice generation.</div>
    </div>
  );
};

export default Billing;
