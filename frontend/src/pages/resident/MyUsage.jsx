import React, { useEffect, useState } from 'react';
import { usageService } from '../../services/usageService';
import { householdService } from '../../services/householdService';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { Home, Users } from 'lucide-react';
import {
  LineChart, Line,
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR];

const SELECT_CLS =
  'px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500';

const MyUsage = () => {
  const { user } = useAuth();

  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Benchmarking state
  const [myHousehold, setMyHousehold]   = useState(null);   // { id, flatArea, apartmentId, … }
  const [aptReadings, setAptReadings]   = useState([]);     // all readings for the apartment
  const [allHouseholds, setAllHouseholds] = useState([]);   // for flatArea join
  const [comparisonMonth, setComparisonMonth] = useState(new Date().getMonth() + 1);
  const [comparisonYear,  setComparisonYear]  = useState(CURRENT_YEAR);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const flatLabel = user?.household || 'A101';
      const aptId     = user?.apartmentId || user?.apartment?.id || null;

      let ownReadings      = [];
      let household        = null;
      let households       = [];
      let apartmentReadings = [];

      if (aptId) {
        households = await householdService.getHouseholds(aptId);
        household  = households.find((h) => h.flatNumber === flatLabel) || households[0] || null;

        if (household) {
          [ownReadings, apartmentReadings] = await Promise.all([
            usageService.getReadings(household.id, null),
            usageService.getReadings(null, aptId),
          ]);
        } else {
          ownReadings = await usageService.getReadings(null, aptId);
        }
      } else {
        // Demo / no-apartment fallback
        ownReadings = await usageService.getReadings(1);
      }

      setReadings(ownReadings);
      setMyHousehold(household);
      setAllHouseholds(households);
      setAptReadings(apartmentReadings);

      // Auto-select the most recent month that has a reading
      if (ownReadings.length > 0) {
        const latest = new Date(
          [...ownReadings].sort((a, b) => new Date(b.readingDate) - new Date(a.readingDate))[0].readingDate,
        );
        setComparisonMonth(latest.getMonth() + 1);
        setComparisonYear(latest.getFullYear());
      }
    } catch (_err) {
      setError('Failed to fetch personal meter readings.');
    } finally {
      setLoading(false);
    }
  };

  // Static trend chart data (existing, unchanged)
  const chartData = [
    { period: 'Apr 2026', usage: 16 },
    { period: 'May 2026', usage: 17 },
    { period: 'Jun 2026', usage: 15 },
    { period: 'Jul 2026', usage: 18 },
    { period: 'Aug 2026', usage: 18 },
  ];

  // ── Peer benchmarking derived data ─────────────────────────────────────────

  const myReadingForPeriod = readings.find((r) => {
    const d = new Date(r.readingDate);
    return d.getMonth() + 1 === comparisonMonth && d.getFullYear() === comparisonYear;
  });
  const myConsumption = myReadingForPeriod != null
    ? Number(myReadingForPeriod.waterConsumed ?? myReadingForPeriod.consumption ?? 0)
    : null;

  const aptPeriodReadings = aptReadings.filter((r) => {
    const d = new Date(r.readingDate);
    return d.getMonth() + 1 === comparisonMonth && d.getFullYear() === comparisonYear;
  });

  // Exclude the resident's own household so averages reflect true peers
  const myHouseholdId  = myHousehold?.id;
  const othersReadings = aptPeriodReadings.filter((r) => r.householdId !== myHouseholdId);
  const hasEnoughData  = othersReadings.length > 0;

  const aptAvg = hasEnoughData
    ? othersReadings.reduce((s, r) => s + Number(r.waterConsumed ?? r.consumption ?? 0), 0) / othersReadings.length
    : null;

  // Similar-sized homes: flatArea within ±20% of resident's flatArea
  const myFlatArea   = myHousehold?.flatArea ?? null;
  const householdMap = Object.fromEntries(allHouseholds.map((h) => [h.id, h]));

  const similarReadings = myFlatArea != null
    ? othersReadings.filter((r) => {
        const area = householdMap[r.householdId]?.flatArea;
        return area != null && Math.abs(area - myFlatArea) / myFlatArea <= 0.2;
      })
    : [];
  const hasSimilar  = similarReadings.length > 0;
  const similarAvg  = hasSimilar
    ? similarReadings.reduce((s, r) => s + Number(r.waterConsumed ?? r.consumption ?? 0), 0) / similarReadings.length
    : null;

  const comparisonData = (() => {
    if (myConsumption === null || !hasEnoughData) return [];
    const bars = [
      { label: 'You',         consumption: myConsumption, isMe: true  },
      { label: 'Apt Average', consumption: aptAvg,        isMe: false },
    ];
    if (hasSimilar) bars.push({ label: 'Similar Homes', consumption: similarAvg, isMe: false });
    return bars;
  })();

  const contextMessage = (() => {
    if (myConsumption === null || aptAvg === null) return null;
    if (myConsumption < aptAvg)
      return { text: "You're using less than average. Great work!", color: 'text-emerald-700' };
    if (myConsumption > aptAvg * 1.2)
      return { text: 'Your usage is above average. Consider checking for leaks.', color: 'text-rose-700' };
    return { text: 'Your usage is close to the apartment average.', color: 'text-sky-700' };
  })();

  // ── Table columns (unchanged) ───────────────────────────────────────────────

  const columns = [
    { header: 'Reading Date',        accessor: 'readingDate',    render: (r) => <span className="font-semibold text-slate-800 text-xs">{r.readingDate}</span> },
    { header: 'Previous Meter Index',accessor: 'previousReading',render: (r) => <span className="font-mono text-xs text-slate-700">{r.previousReading} kL</span> },
    { header: 'Current Meter Index', accessor: 'currentReading', render: (r) => <strong className="font-mono text-xs text-slate-900">{r.currentReading} kL</strong> },
    {
      header: 'Water Consumed',
      accessor: 'waterConsumed',
      render: (r) => (
        <span className="font-bold text-sky-800 bg-sky-50 border border-sky-200/80 px-2.5 py-0.5 rounded-full text-xs font-mono">
          {r.waterConsumed} kL
        </span>
      ),
    },
    { header: 'Inspection Remarks', accessor: 'remarks', render: (r) => <span className="text-slate-500 text-xs font-medium">{r.remarks || '-'}</span> },
  ];

  if (loading) return <LoadingSpinner message="Fetching your household meter history..." />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page header */}
      <div className="border-b border-slate-200/80 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold mb-1.5">
          <Home className="w-3 h-3 text-sky-600" />
          <span>Flat {myHousehold?.flatNumber || user?.household || 'A101'} Meter Telemetry</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Water Consumption</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Historical daily and monthly consumption telemetry logs</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchAll} />}

      {/* Consumption Trend Chart (unchanged) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Monthly Consumption Trend (Flat {myHousehold?.flatNumber || 'A101'})
          </h3>
          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/80">Line Trend</span>
        </div>
        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="period" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="usage" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── How You Compare ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
        {/* Card header + period selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">How You Compare</h3>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={comparisonMonth}
              onChange={(e) => setComparisonMonth(Number(e.target.value))}
              className={SELECT_CLS}
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
            <select
              value={comparisonYear}
              onChange={(e) => setComparisonYear(Number(e.target.value))}
              className={SELECT_CLS}
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content: error states → chart */}
        {myConsumption === null ? (
          <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-medium">
            No reading found for your household in this period.
          </div>
        ) : !hasEnoughData ? (
          <div className="h-40 flex items-center justify-center text-xs text-slate-400 font-medium">
            Not enough data to compare this period.
          </div>
        ) : (
          <>
            {!hasSimilar && (
              <p className="text-[11px] text-slate-400 font-medium">
                No similar-sized homes to compare — showing apartment average only.
              </p>
            )}

            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  margin={{ top: 8, right: 16, left: 0, bottom: 4 }}
                  barCategoryGap="40%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} unit=" kL" />
                  <Tooltip
                    formatter={(value, _name, props) => [
                      `${Number(value).toFixed(2)} kL`,
                      props.payload.label,
                    ]}
                    contentStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="consumption" radius={[5, 5, 0, 0]}>
                    {comparisonData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.isMe ? '#0ea5e9' : '#94a3b8'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-sky-400" /> You
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-sm bg-slate-400" /> Peers
              </span>
            </div>

            {/* Contextual message */}
            {contextMessage && (
              <p className={`text-xs font-bold ${contextMessage.color}`}>
                {contextMessage.text}
              </p>
            )}
          </>
        )}
      </div>

      {/* Meter Reading Log Table */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Meter Reading Audit Logs</h3>
        <DataTable columns={columns} data={readings} emptyMessage="No meter readings recorded for your flat." />
      </div>
    </div>
  );
};

export default MyUsage;
