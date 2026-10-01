import React, { useEffect, useState } from 'react';
import { usageService } from '../../services/usageService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatVolume } from '../../utils/formatCurrency';
import { Droplets, Home } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ResidentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResidentTelemetry();
  }, []);

  const fetchResidentTelemetry = async () => {
    setLoading(true);
    setError('');
    try {
      const readings = await usageService.getReadings(1);

      const usageTrend = readings.map((reading) => ({
        day: reading.readingDate || reading.billingMonth,
        consumption: reading.waterConsumed || reading.consumption || 0,
      }));
      const currentMonthConsumption = readings.reduce((total, reading) => total + (reading.waterConsumed || reading.consumption || 0), 0);

      setData({
        flatNumber: 'A101',
        currentMonthConsumption,
        usageTrend,
      });
    } catch (_err) {
      setError('Failed to fetch resident dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching your household telemetry..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchResidentTelemetry} />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Personal Consumer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold mb-1.5">
            <Home className="w-3 h-3 text-sky-600" />
            <span>Green Valley Residency • Flat A101</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resident Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Your personal water consumption summary and utility statements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white border border-sky-200/80 rounded-xl p-5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">1. Consumption</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <Droplets className="w-4 h-4 fill-current" />
            </div>
          </div>
          <p className="text-xs text-slate-500 font-semibold">"How much water did I use?"</p>
          <div className="pt-1">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatVolume(data?.currentMonthConsumption * 1000)}
            </span>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Flat A101 current billing period</p>
          </div>
        </div>

      </div>

      {/* Usage Trend Line Chart */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">My Water Usage Trends (kL)</h3>
          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/80">Daily Telemetry</span>
        </div>
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.usageTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="consumption" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ResidentDashboard;
