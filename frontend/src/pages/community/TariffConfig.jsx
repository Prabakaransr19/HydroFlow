import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Zap,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  Building
} from 'lucide-react';

const TariffConfig = () => {
  const { user } = useAuth();
  const apartmentId = user?.apartmentId || user?.apartment?.id || null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    planName: '',
    tier1MaxKl: 10,
    tier1Rate: 50,
    tier2MaxKl: 25,
    tier2Rate: 75,
    tier3Rate: 100
  });

  useEffect(() => {
    fetchTariffPlan();
  }, [apartmentId]);

  const fetchTariffPlan = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get(`/api/tariff-plans/apartment/${apartmentId}`);
      if (res.data) {
        setForm({
          planName: res.data.planName || 'Standard Community Tariff Plan',
          tier1MaxKl: res.data.tier1MaxKl ?? 10,
          tier1Rate: res.data.tier1Rate ?? 50,
          tier2MaxKl: res.data.tier2MaxKl ?? 25,
          tier2Rate: res.data.tier2Rate ?? 75,
          tier3Rate: res.data.tier3Rate ?? 100
        });
      }
    } catch (err) {
      console.warn('Using default tariff values:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'planName' ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Frontend validations
    if (form.tier1MaxKl <= 0) {
      setErrorMsg('Tier 1 maximum volume must be greater than 0 kL.');
      return;
    }
    if (form.tier2MaxKl <= form.tier1MaxKl) {
      setErrorMsg('Tier 2 maximum volume must be strictly greater than Tier 1 limit (' + form.tier1MaxKl + ' kL).');
      return;
    }
    if (form.tier1Rate < 0 || form.tier2Rate < 0 || form.tier3Rate < 0) {
      setErrorMsg('Tariff rates cannot be negative values.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        apartmentId: parseInt(apartmentId),
        planName: form.planName,
        tier1MaxKl: form.tier1MaxKl,
        tier1Rate: form.tier1Rate,
        tier2MaxKl: form.tier2MaxKl,
        tier2Rate: form.tier2Rate,
        tier3Rate: form.tier3Rate
      };

      await api.post('/api/tariff-plans', payload);
      setSuccessMsg('Apartment tariff configuration saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to save tariff plan. Please verify backend connectivity.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600" />
      </div>
    );
  }

  if (!apartmentId) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">3-Tier Tariff Configuration</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Configure dynamic progressive rates stored specifically for your apartment complex</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          Apartment not configured. Please complete your apartment setup before configuring tariff rates.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold mb-1.5">
            <Building className="w-3 h-3 text-sky-600" />
            <span>Billing Rate Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">3-Tier Tariff Configuration</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure dynamic progressive rates stored specifically for your apartment complex
          </p>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Title Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Tariff Plan Name *
          </label>
          <input
            type="text"
            name="planName"
            value={form.planName}
            onChange={handleChange}
            placeholder="e.g. Green Valley Progressive Water Plan"
            required
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-sky-100 focus:border-sky-500 text-xs font-bold text-slate-900"
          />
        </div>

        {/* 3 Tier Configuration Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Tier 1 Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200/80">
                Tier 1 (Base Allowance)
              </span>
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Volume Limit (kL)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">0 to</span>
                  <input
                    type="number"
                    name="tier1MaxKl"
                    value={form.tier1MaxKl}
                    onChange={handleChange}
                    min="1"
                    step="0.5"
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold">kL</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rate per kL (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    name="tier1Rate"
                    value={form.tier1Rate}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    required
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 font-bold text-slate-900"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Applies from 0 up to {form.tier1MaxKl} kL.
              </p>
            </div>
          </div>

          {/* Tier 2 Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-sky-50 text-sky-800 rounded-full border border-sky-200/80">
                Tier 2 (Standard Usage)
              </span>
              <Layers className="w-4 h-4 text-sky-600" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Volume Limit (kL)
                </label>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">{form.tier1MaxKl} to</span>
                  <input
                    type="number"
                    name="tier2MaxKl"
                    value={form.tier2MaxKl}
                    onChange={handleChange}
                    min={form.tier1MaxKl + 1}
                    step="0.5"
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 font-bold text-slate-900"
                  />
                  <span className="text-slate-500 font-bold">kL</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rate per kL (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    name="tier2Rate"
                    value={form.tier2Rate}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    required
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 font-bold text-slate-900"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Applies between {form.tier1MaxKl} and {form.tier2MaxKl} kL.
              </p>
            </div>
          </div>

          {/* Tier 3 Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs relative overflow-hidden space-y-4">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 bg-amber-50 text-amber-800 rounded-full border border-amber-200/80">
                Tier 3 (High Consumption)
              </span>
              <Layers className="w-4 h-4 text-amber-600" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Volume Limit (kL)
                </label>
                <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-bold text-slate-700">
                  Above {form.tier2MaxKl} kL
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Rate per kL (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    name="tier3Rate"
                    value={form.tier3Rate}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    required
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-500 font-bold text-slate-900"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Applies to consumption exceeding {form.tier2MaxKl} kL.
              </p>
            </div>
          </div>
        </div>

        {/* Live Calculation Formula Preview Banner */}
        <div className="bg-slate-950 text-slate-100 p-5 rounded-xl shadow-2xs space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" /> Live Formula Rate Preview
          </h4>
          <div className="text-xs space-y-1 font-mono text-slate-300 font-medium">
            <p>• Tier 1 (0 – {form.tier1MaxKl} kL) = ₹{form.tier1Rate} / kL</p>
            <p>• Tier 2 ({form.tier1MaxKl} – {form.tier2MaxKl} kL) = ₹{form.tier2Rate} / kL</p>
            <p>• Tier 3 (&gt; {form.tier2MaxKl} kL) = ₹{form.tier3Rate} / kL</p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Tariff...' : 'Save Tariff Plan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default TariffConfig;
