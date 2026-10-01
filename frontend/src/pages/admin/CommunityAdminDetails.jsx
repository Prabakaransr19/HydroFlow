import React, { useEffect, useState } from 'react';
import { apartmentService } from '../../services/apartmentService';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';
import { UserCheck, UserX, Shield, Eye, Mail, Building, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react';

const CommunityAdminDetails = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, PENDING, APPROVED, REJECTED

  // Detail Modal State
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Reject Dialog State
  const [adminToReject, setAdminToReject] = useState(null);
  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isCreateSuperAdminOpen, setIsCreateSuperAdminOpen] = useState(false);
  const [superAdminData, setSuperAdminData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchCommunityAdmins();
  }, []);

  const fetchCommunityAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apartmentService.getAllCommunityAdmins();
      setAdmins(data || []);
    } catch (err) {
      setError('Failed to fetch community admin details.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await apartmentService.approveCommunityAdmin(id);
      showToast('Community Admin approved successfully!');
      if (isDetailModalOpen) setIsDetailModalOpen(false);
      fetchCommunityAdmins();
    } catch (err) {
      setError('Failed to approve community admin.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (admin) => {
    setAdminToReject(admin);
    setIsConfirmRejectOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!adminToReject) return;
    setActionLoading(true);
    try {
      await apartmentService.rejectCommunityAdmin(adminToReject.id);
      showToast('Community Admin registration rejected.');
      setIsConfirmRejectOpen(false);
      if (isDetailModalOpen) setIsDetailModalOpen(false);
      setAdminToReject(null);
      fetchCommunityAdmins();
    } catch (err) {
      setError('Failed to reject community admin.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewDetails = (admin) => {
    setSelectedAdmin(admin);
    setIsDetailModalOpen(true);
  };

  const handleCreateSuperAdmin = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    setError('');
    try {
      await apartmentService.createSuperAdmin(superAdminData);
      showToast('Super Admin created successfully.');
      setSuperAdminData({ name: '', email: '', password: '' });
      setIsCreateSuperAdminOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create Super Admin.');
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const filteredAdmins = admins.filter((a) => {
    if (activeTab === 'PENDING') return a.status === 'PENDING';
    if (activeTab === 'APPROVED') return a.status === 'APPROVED';
    if (activeTab === 'REJECTED') return a.status === 'REJECTED';
    return true;
  });

  const totalCount = admins.length;
  const approvedCount = admins.filter((a) => a.status === 'APPROVED').length;
  const pendingCount = admins.filter((a) => a.status === 'PENDING').length;
  const rejectedCount = admins.filter((a) => a.status === 'REJECTED').length;

  const columns = [
    {
      header: 'Administrator',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-extrabold text-slate-900 text-xs">{row.name}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Assigned Apartment Community',
      accessor: 'apartmentName',
      render: (row) => (
        <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          {row.apartmentName || 'Green Valley Residency'}
        </span>
      ),
    },
    {
      header: 'System Role',
      accessor: 'role',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
          <Shield className="w-3 h-3 text-sky-600" />
          {row.role?.replace('_', ' ')}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            View Details
          </button>

          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(row.id)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all disabled:opacity-50"
              >
                <UserCheck className="w-3.5 h-3.5" />
                Approve
              </button>
              <button
                onClick={() => handleRejectClick(row)}
                disabled={actionLoading}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
              >
                <UserX className="w-3.5 h-3.5" />
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Fetching community admin details..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 text-[11px] font-bold mb-1.5">
          <Shield className="w-3 h-3 text-indigo-600" />
          <span>Platform Governance</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Community Admin Directory</h1>
          <button onClick={() => setIsCreateSuperAdminOpen(true)} className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Create Super Admin
          </button>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Inspect, manage, and verify administrative personnel assigned to residential communities
        </p>
      </div>

      {/* Governance Scoping Rule Notice */}
      <div className="p-4 bg-sky-50 border border-sky-200/90 rounded-xl flex items-start gap-3 text-xs text-sky-950">
        <Building className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-sky-950">Strict Admin Scoping Rule Enforced</h4>
          <p className="mt-0.5 text-sky-800 leading-relaxed font-medium">
            Each Community Admin manages <strong>exactly 1 assigned apartment complex</strong>. Multiple Community Admins can be assigned to co-manage the same apartment complex, but no single Community Admin can manage multiple apartments.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchCommunityAdmins} />}

      {/* Overview Stat Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Admins</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white border border-emerald-200/90 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Approved Admins</p>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white border border-amber-200/90 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Pending Approvals</p>
          <p className="text-xl font-extrabold text-amber-700 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white border border-rose-200/90 rounded-xl p-4 shadow-2xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Rejected Applications</p>
          <p className="text-xl font-extrabold text-rose-700 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
            activeTab === 'ALL'
              ? 'bg-sky-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Admins ({totalCount})
        </button>
        <button
          onClick={() => setActiveTab('PENDING')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'PENDING'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('APPROVED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'APPROVED'
              ? 'bg-emerald-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setActiveTab('REJECTED')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
            activeTab === 'REJECTED'
              ? 'bg-rose-600 text-white shadow-2xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={filteredAdmins}
        searchKey="name"
        searchPlaceholder="Search by community admin name, email, or apartment..."
        emptyMessage="No community admin details match the selected filter."
      />

      {/* Detailed Admin Inspector Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Community Admin Details"
      >
        {selectedAdmin && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/90 rounded-xl p-4">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white font-extrabold text-lg flex items-center justify-center shadow-2xs shrink-0">
                {selectedAdmin.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedAdmin.name}</h3>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {selectedAdmin.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Community</span>
                <p className="font-extrabold text-slate-900 flex items-center gap-1.5 text-sm mt-0.5">
                  <Building className="w-4 h-4 text-sky-600" />
                  {selectedAdmin.apartmentName || 'Green Valley Residency'}
                </p>
                <p className="text-[11px] text-slate-500 font-medium">Residential Complex</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Status</span>
                <div className="mt-1">
                  <StatusBadge status={selectedAdmin.status} />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Access Verification Status</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System Role</span>
                <p className="font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-sky-600" />
                  {selectedAdmin.role?.replace('_', ' ')}
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">System ID</span>
                <p className="font-extrabold text-slate-900 mt-0.5">#ADM-{selectedAdmin.id}</p>
              </div>
            </div>

            {selectedAdmin.status === 'PENDING' && (
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleRejectClick(selectedAdmin)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-lg border border-rose-200 transition"
                >
                  Reject Application
                </button>
                <button
                  onClick={() => handleApprove(selectedAdmin.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition"
                >
                  Approve Administrator
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmRejectOpen}
        onClose={() => setIsConfirmRejectOpen(false)}
        onConfirm={handleConfirmReject}
        title="Reject Community Admin Request"
        message={`Are you sure you want to reject registration request for "${adminToReject?.name}" (${adminToReject?.email})?`}
        confirmText="Reject Application"
        variant="danger"
        isLoading={actionLoading}
      />

      <Modal
        isOpen={isCreateSuperAdminOpen}
        onClose={() => setIsCreateSuperAdminOpen(false)}
        title="Create Super Admin"
        footer={<>
          <button onClick={() => setIsCreateSuperAdminOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg">Cancel</button>
          <button onClick={handleCreateSuperAdmin} disabled={actionLoading} className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg disabled:opacity-50">{actionLoading ? 'Creating...' : 'Create Super Admin'}</button>
        </>}
      >
        <form onSubmit={handleCreateSuperAdmin} className="space-y-4">
          {['name', 'email', 'password'].map((field) => (
            <label key={field} className="block text-xs font-bold text-slate-700">
              {field === 'name' ? 'Full name' : field === 'email' ? 'Email address' : 'Temporary password'}
              <input required type={field === 'email' ? 'email' : field === 'password' ? 'password' : 'text'} value={superAdminData[field]} onChange={(event) => setSuperAdminData({ ...superAdminData, [field]: event.target.value })} className="mt-1 w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium" />
            </label>
          ))}
        </form>
      </Modal>
    </div>
  );
};

export default CommunityAdminDetails;
