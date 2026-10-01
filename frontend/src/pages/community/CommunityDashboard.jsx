import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, BarChart2, Droplets, Home, Users } from 'lucide-react';
import { apartmentService } from '../../services/apartmentService';
import { householdService } from '../../services/householdService';
import { usageService } from '../../services/usageService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { formatVolume } from '../../utils/formatCurrency';
import {
  LineChart, Line,
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];

const CommunityDashboard = () => {
  const { user } = useAuth();
  const apartmentId = user?.apartmentId || user?.apartment?.id || null;

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  // Per-household bar chart period selectors
  const [comparisonMonth, setComparisonMonth] = useState(new Date().getMonth() + 1);
  const [comparisonYear, setComparisonYear] = useState(CURRENT_YEAR);

  useEffect(() => {
    if (!apartmentId) return;
    Promise.all([
      apartmentService.getApartmentById(apartmentId),
      householdService.getHouseholds(apartmentId),
      usageService.getReadings(null, apartmentId),
    ])
      .then(([apartment, households, readings]) => {
        const monthlyUsage = readings.reduce((months, reading) => {
          const key = `${reading.billingYear || CURRENT_YEAR}-${String(reading.billingMonth || new Date().getMonth() + 1).padStart(2, '0')}`;
          months[key] = (months[key] || 0) + Number(reading.waterConsumed || reading.consumption || 0);
          return months;
        }, {});
        setData({
          apartment,
          households,
          readings,                           // kept raw for bar chart filtering
          monthlyUsage: Object.entries(monthlyUsage)
            .map(([month, consumption]) => ({ month, consumption }))
            .sort((a, b) => a.month.localeCompare(b.month)),
        });
      })
      .catch(() => setError('Failed to load community dashboard details.'));
  }, [apartmentId]);

  // Derive per-household bar data from already-fetched readings — no extra API call
  const barData = (() => {
    if (!data) return [];
    const filtered = data.readings.filter(
      (r) => Number(r.billingMonth) === comparisonMonth && Number(r.billingYear) === comparisonYear,
    );
    const householdMap = Object.fromEntries(data.households.map((h) => [h.id, h]));
    return filtered
      .map((r) => {
        const hh = householdMap[r.householdId] || {};
        const label =
          hh.meterNumber && hh.meterNumber !== 'NOT_CONFIGURED'
            ? hh.meterNumber
            : (hh.flatNumber || `HH-${r.householdId}`);
        return { household: label, consumption: Number(r.waterConsumed ?? r.consumption ?? 0) };
      })
      .sort((a, b) => b.consumption - a.consumption);
  })();

  const avgConsumption = barData.length
    ? barData.reduce((sum, d) => sum + d.consumption, 0) / barData.length
    : 0;

  if (error) return <ErrorMessage message={error} />;
  if (!data) return <LoadingSpinner message="Loading community details..." />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Community Operations</span>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{data.apartment?.name || 'Apartment Dashboard'}</h1>
        <p className="text-xs text-slate-500 font-medium mt-1">Apartment details and monthly water usage</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-sky-200 rounded-xl p-5">
          <Building2 className="w-5 h-5 text-sky-600 mb-3" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Apartment</p>
          <p className="text-lg font-extrabold text-slate-900 mt-1">{data.apartment?.name}</p>
          <p className="text-xs text-slate-500 mt-1">{data.apartment?.address}, {data.apartment?.city}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <Home className="w-5 h-5 text-sky-600 mb-3" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Flats</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{data.apartment?.totalFlats || data.households.length}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <Users className="w-5 h-5 text-sky-600 mb-3" />
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Households</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{data.households.length}</p>
        </div>
      </div>

      {/* Monthly aggregate line chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Droplets className="w-4 h-4 text-sky-600" />
          <h2 className="text-sm font-extrabold text-slate-900">Monthly Water Usage</h2>
        </div>
        <div className="h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyUsage}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip formatter={(value) => formatVolume(value * 1000)} />
              <Line type="monotone" dataKey="consumption" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-household consumption bar chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-extrabold text-slate-900">Per-Household Consumption</h2>
          </div>
          {/* Period selectors */}
          <div className="flex items-center gap-2">
            <select
              value={comparisonMonth}
              onChange={(e) => setComparisonMonth(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
            <select
              value={comparisonYear}
              onChange={(e) => setComparisonYear(Number(e.target.value))}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {barData.length === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-medium">
            No readings recorded for this period.
          </div>
        ) : (
          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 16, left: 0, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="household"
                  stroke="#64748b"
                  fontSize={10}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#64748b" fontSize={11} unit=" kL" />
                <Tooltip
                  formatter={(value, _name, props) => [`${Number(value).toFixed(2)} kL`, props.payload.household]}
                  contentStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
                <ReferenceLine
                  y={avgConsumption}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: `Avg ${avgConsumption.toFixed(1)} kL`,
                    position: 'insideTopRight',
                    fontSize: 10,
                    fill: '#b45309',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="consumption" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.consumption > avgConsumption ? '#0ea5e9' : '#38bdf8'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <Link to="/community/households" className="inline-flex items-center gap-2 text-xs font-bold text-sky-700 hover:text-sky-900">
        Manage households and resident invitations
      </Link>
    </div>
  );
};

export default CommunityDashboard;
