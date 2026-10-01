import React, { useEffect, useState } from 'react';
import { apartmentService } from '../../services/apartmentService';
import { waterPurchaseService } from '../../services/waterPurchaseService';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import StatusBadge from '../../components/StatusBadge';
import { formatCurrency, formatVolume } from '../../utils/formatCurrency';
import { Building2, Users, UserCheck, CalendarCheck, Droplets, Banknote, Activity, ArrowRight, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [apartments, pendingAdmins, purchases] = await Promise.all([
        apartmentService.getApartments(),
        apartmentService.getPendingCommunityAdmins(),
        waterPurchaseService.getApartmentPurchases(1),
      ]);

      const totalCost = purchases.reduce((sum, p) => sum + p.totalCost, 0);
      const totalVolume = purchases.reduce((sum, p) => sum + p.purchasedVolume, 0);

      setStats({
        totalApartments: apartments.length,
        totalResidents: 184,
        pendingAdminsCount: pendingAdmins.length,
        activeBillingCycles: 3,
        totalConsumption: totalVolume,
        totalPurchaseCost: totalCost,
        pendingAdminsList: pendingAdmins,
      });
    } catch (err) {
      setError('Failed to load Super Admin dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading Super Admin platform telemetry..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardData} />;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[11px] font-bold mb-1.5">
            <Shield className="w-3 h-3 text-indigo-600" />
            <span>Platform Governance</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Super Admin Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">Enterprise telemetry across all registered residential communities</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/approvals"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1.5"
          >
            <UserCheck className="w-4 h-4" />
            <span>Review Pending Approvals ({stats?.pendingAdminsCount})</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Apartments"
          value={stats?.totalApartments}
          unit="Communities"
          icon={Building2}
          color="blue"
          subtitle="Registered residential complexes"
        />
        <StatCard
          title="Total Residents"
          value={stats?.totalResidents}
          unit="Occupants"
          icon={Users}
          color="cyan"
          subtitle="Active flat occupants & owners"
        />
        <StatCard
          title="Pending Admin Approvals"
          value={stats?.pendingAdminsCount}
          unit="Requests"
          icon={UserCheck}
          color="amber"
          subtitle="Awaiting Super Admin decision"
        />
        <StatCard
          title="Active Billing Cycles"
          value={stats?.activeBillingCycles}
          unit="Cycles"
          icon={CalendarCheck}
          color="emerald"
          subtitle="OPEN & processing cycles"
        />
        <StatCard
          title="Water Consumption"
          value={formatVolume(stats?.totalConsumption || 35000)}
          icon={Droplets}
          color="teal"
          subtitle="Combined system intake"
        />
        <StatCard
          title="Water Purchase Costs"
          value={formatCurrency(stats?.totalPurchaseCost || 70000)}
          icon={Banknote}
          color="indigo"
          subtitle="Cumulative tanker & board expenditure"
        />
      </div>

      {/* Recent Activity Log & Pending Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Table Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4.5 h-4.5 text-amber-600" />
              <h3 className="text-sm font-extrabold text-slate-900">Pending Community Admins</h3>
            </div>
            <Link to="/admin/approvals" className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              <span>View Approvals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.pendingAdminsList?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.pendingAdminsList.map((admin) => (
                <div key={admin.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{admin.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{admin.email} • {admin.apartmentName}</p>
                  </div>
                  <StatusBadge status="PENDING" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">
              <p className="text-xs font-semibold text-slate-600">No pending community admin approvals.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">All registration requests have been reviewed.</p>
            </div>
          )}
        </div>

        {/* System Activity Stream */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3.5">
            <Activity className="w-4.5 h-4.5 text-sky-600" />
            <h3 className="text-sm font-extrabold text-slate-900">Recent System Activity</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">Tanker Water Purchase Created</p>
                <p className="text-slate-500 text-[11px] font-medium">10,000 L purchased for Green Valley Residency</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">New Apartment Registered</p>
                <p className="text-slate-500 text-[11px] font-medium">Orchid Towers (60 flats) added to system</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">1 day ago</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
              <div>
                <p className="font-bold text-slate-900">2σ Leak Outlier Triggered</p>
                <p className="text-slate-500 text-[11px] font-medium">Flat A104 exceeded 2σ historical threshold</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">2 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
