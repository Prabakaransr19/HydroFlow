import React, { useEffect, useState } from 'react';
import { apartmentService } from '../../services/apartmentService';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ConfirmDialog from '../../components/ConfirmDialog';
import { formatDate } from '../../utils/formatDate';
import { UserCheck, UserX, CheckCircle, Shield } from 'lucide-react';

const CommunityAdminApprovals = () => {
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isConfirmRejectOpen, setIsConfirmRejectOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apartmentService.getPendingCommunityAdmins();
      setPendingAdmins(data);
    } catch (err) {
      setError('Failed to fetch pending community admin requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await apartmentService.approveCommunityAdmin(id);
      showToast('Community Admin approved successfully!');
      fetchPendingAdmins();
    } catch (err) {
      setError('Failed to approve community admin.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectClick = (admin) => {
    setSelectedAdmin(admin);
    setIsConfirmRejectOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedAdmin) return;
    setActionLoading(true);
    try {
      await apartmentService.rejectCommunityAdmin(selectedAdmin.id);
      showToast('Community Admin registration rejected.');
      setIsConfirmRejectOpen(false);
      setSelectedAdmin(null);
      fetchPendingAdmins();
    } catch (err) {
      setError('Failed to reject community admin.');
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const columns = [
    {
      header: 'Applicant Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <p className="font-extrabold text-slate-900 text-xs">{row.name}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.email}</p>
        </div>
      ),
    },
    {
      header: 'Apartment Community',
      accessor: 'apartmentName',
      render: (row) => (
        <span className="font-bold text-slate-800 text-xs">{row.apartmentName || 'Green Valley Residency'}</span>
      ),
    },
    {
      header: 'Requested On',
      accessor: 'requestedAt',
      render: (row) => <span className="text-slate-500 font-medium text-xs">{formatDate(row.requestedAt)}</span>,
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
            onClick={() => handleApprove(row.id)}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all disabled:opacity-50"
          >
            <UserCheck className="w-3.5 h-3.5" />
            Approve
          </button>
          <button
            onClick={() => handleRejectClick(row)}
            disabled={actionLoading}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
          >
            <UserX className="w-3.5 h-3.5" />
            Reject
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Fetching pending admin registration requests..." />;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200/80 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold mb-1.5">
          <Shield className="w-3 h-3 text-sky-600" />
          <span>Access Control</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Community Admin Approvals</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Review and verify administrative access requests submitted by community personnel
        </p>
      </div>

      {toastMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchPendingAdmins} />}

      <DataTable
        columns={columns}
        data={pendingAdmins}
        searchKey="name"
        searchPlaceholder="Search by applicant name or email..."
        emptyMessage="No pending community admin registration requests."
      />

      <ConfirmDialog
        isOpen={isConfirmRejectOpen}
        onClose={() => setIsConfirmRejectOpen(false)}
        onConfirm={handleConfirmReject}
        title="Reject Community Admin Request"
        message={`Are you sure you want to reject registration request for "${selectedAdmin?.name}" (${selectedAdmin?.email})?`}
        confirmText="Reject Application"
        variant="danger"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default CommunityAdminApprovals;
