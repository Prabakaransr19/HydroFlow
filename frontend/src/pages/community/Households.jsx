import React, { useEffect, useState } from 'react';
import { householdService } from '../../services/householdService';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { Home, Plus, Edit, UserCheck, Gauge, CheckCircle2, AlertCircle, Mail, Copy, Check, Send, Link as LinkIcon } from 'lucide-react';

const Households = () => {
  const { user } = useAuth();
  const apartmentId = user?.apartmentId || user?.apartment?.id || null;

  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMeterOpen, setIsMeterOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState(null);

  // Household Form State
  const [formData, setFormData] = useState({
    apartmentId: apartmentId,
    flatNumber: '',
    floorNumber: '',
    occupancy: '',
    flatArea: '',
    meterNumber: '',
    meterInstallationDate: '',
  });

  // Meter Form State
  const [meterData, setMeterData] = useState({
    meterNumber: '',
    meterInstallationDate: '',
  });

  // Assign Resident Form State
  const [residentData, setResidentData] = useState({
    residentName: '',
    residentEmail: '',
  });

  // Invite Resident Registration Link Form State
  const [inviteData, setInviteData] = useState({
    residentName: '',
    email: '',
  });
  const [generatedLinkRes, setGeneratedLinkRes] = useState(null);
  const [copied, setCopied] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchHouseholds();
  }, [apartmentId]);

  const fetchHouseholds = async () => {
    if (!apartmentId) return;
    setLoading(true);
    setError('');
    try {
      const data = await householdService.getHouseholds(apartmentId);
      setHouseholds(data);
    } catch (err) {
      setError('Failed to load households list.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setSelectedHousehold(null);
    setFormData({
      apartmentId: apartmentId,
      flatNumber: '',
      floorNumber: '1',
      occupancy: '4',
      flatArea: '1200',
      meterInstallationDate: new Date().toISOString().split('T')[0],
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (hh) => {
    setSelectedHousehold(hh);
    setFormData({
      apartmentId: hh.apartmentId || apartmentId,
      flatNumber: hh.flatNumber || '',
      floorNumber: hh.floorNumber || '1',
      occupancy: hh.occupancy || '1',
      flatArea: hh.flatArea || '1000',
      meterInstallationDate: hh.meterInstallationDate || '',
    });
    setIsFormOpen(true);
  };

  const handleOpenMeter = (hh) => {
    setSelectedHousehold(hh);
    setMeterData({
      meterNumber: hh.meterNumber || 'Auto-generated',
      meterInstallationDate: hh.meterInstallationDate || new Date().toISOString().split('T')[0],
    });
    setIsMeterOpen(true);
  };

  const handleOpenAssign = (hh) => {
    setSelectedHousehold(hh);
    setResidentData({
      residentName: hh.residentName || '',
      residentEmail: hh.residentEmail || '',
    });
    setIsAssignOpen(true);
  };

  const handleOpenInvite = (hh = null) => {
    setSelectedHousehold(hh);
    setGeneratedLinkRes(null);
    setCopied(false);
    setInviteData({
      residentName: hh?.residentName && hh.residentName !== 'Unassigned' ? hh.residentName : '',
      email: hh?.residentEmail || '',
    });
    setIsInviteOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedHousehold) {
        await householdService.updateHousehold(selectedHousehold.id, formData);
        showToast('Household updated successfully!');
      } else {
        await householdService.createHousehold(formData);
        showToast('Household created successfully!');
      }
      setIsFormOpen(false);
      fetchHouseholds();
    } catch (err) {
      setError('Failed to save household information.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitMeter = async (e) => {
    e.preventDefault();
    if (!selectedHousehold) return;
    setSubmitting(true);
    try {
      await householdService.configureMeter(selectedHousehold.id, meterData);
      showToast('Water meter configured successfully!');
      setIsMeterOpen(false);
      fetchHouseholds();
    } catch (err) {
      setError('Failed to configure water meter.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAssign = async (e) => {
    e.preventDefault();
    if (!selectedHousehold) return;
    setSubmitting(true);
    try {
      await householdService.assignResident(selectedHousehold.id, residentData);
      showToast('Resident assigned successfully!');
      setIsAssignOpen(false);
      fetchHouseholds();
    } catch (err) {
      setError('Failed to assign resident.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authService.createResidentInvitation(inviteData);
      setGeneratedLinkRes(res);
      showToast('Registration invitation link generated!');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to generate invitation link.';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedLinkRes?.invitationLink) return;
    navigator.clipboard.writeText(generatedLinkRes.invitationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const columns = [
    {
      header: 'Flat Unit',
      accessor: 'flatNumber',
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-200/80 text-sky-700 flex items-center justify-center font-bold text-xs">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <p className="font-extrabold text-slate-900 text-xs">{row.flatNumber}</p>
            <p className="text-[11px] text-slate-500 font-medium">Floor {row.floorNumber} • {row.flatArea} sqft</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Resident',
      accessor: 'residentName',
      render: (row) => (
        <div>
          <p className="font-bold text-slate-900 text-xs">{row.residentName || 'Unassigned'}</p>
          <p className="text-[11px] text-slate-500 font-medium">{row.residentEmail || 'No email registered'}</p>
        </div>
      ),
    },
    {
      header: 'Occupancy',
      accessor: 'occupancy',
      render: (row) => <span className="font-bold text-slate-800 text-xs">{row.occupancy} Members</span>,
    },
    {
      header: 'Water Meter Status',
      accessor: 'meterStatus',
      render: (row) => {
        const isInstalled = row.meterStatus === 'INSTALLED' && row.meterNumber !== 'NOT_CONFIGURED';
        return (
          <div>
            {isInstalled ? (
              <span className="inline-flex items-center gap-1 text-emerald-800 font-bold text-[11px] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Meter Installed ({row.meterNumber})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-800 font-bold text-[11px] bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full shadow-2xs">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                Meter Not Configured
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleOpenInvite(row)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Send Registration Link to Resident"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenMeter(row)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
            title="Configure Meter"
          >
            <Gauge className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenAssign(row)}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Assign Resident"
          >
            <UserCheck className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Edit Household"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <LoadingSpinner message="Loading household registry..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Community Operations</span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Household & Resident Management</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Manage residential units, send onboarding registration links, and configure smart water meters</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenInvite()}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Send className="w-4 h-4" />
            Send Resident Reg Link
          </button>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Household Unit
          </button>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-2xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={fetchHouseholds} />}

      <DataTable
        columns={columns}
        data={households}
        searchKey="flatNumber"
        searchPlaceholder="Search by flat number, resident name, or meter number..."
        emptyMessage="No households registered in this community."
      />

      {/* Invite Resident & Registration Link Generator Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title={selectedHousehold ? `Send Registration Link: Flat ${selectedHousehold.flatNumber}` : 'Create Resident Registration Link'}
        footer={
          generatedLinkRes ? (
            <button
              onClick={() => setIsInviteOpen(false)}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsInviteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitInvite}
                disabled={submitting}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-2xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Generating Link...' : 'Generate & Send Link'}
              </button>
            </>
          )
        }
      >
        {generatedLinkRes ? (
          <div className="space-y-4 py-2">
            <div className="p-4 bg-emerald-50 border border-emerald-200/90 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Registration Link Created for {generatedLinkRes.residentName}!</span>
              </div>
              <p className="text-slate-600 text-xs font-medium">
                Send this link to <strong>{generatedLinkRes.email}</strong>. The resident can click the link to confirm their email address and create their account password.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-600" /> Unique Registration Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLinkRes.invitationLink}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-indigo-950 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3.5 py-2 text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-all shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitInvite} className="space-y-4">
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs text-indigo-950 leading-relaxed font-medium">
              Community Admin creates the resident profile, generates a secure registration link, and sends it to the resident. The resident confirms their email and sets up their password to complete onboarding.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Resident Full Name *</label>
              <input
                type="text"
                required
                value={inviteData.residentName}
                onChange={(e) => setInviteData({ ...inviteData, residentName: e.target.value })}
                placeholder="Amit Patel"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Resident Email Address *</label>
              <input
                type="email"
                required
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="amit.patel@gmail.com"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Household Add/Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedHousehold ? `Edit Household ${selectedHousehold.flatNumber}` : 'Create Household Unit'}
        footer={
          <>
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitForm}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Household'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Flat Number *</label>
              <input
                type="text"
                required
                value={formData.flatNumber}
                onChange={(e) => setFormData({ ...formData, flatNumber: e.target.value })}
                placeholder="A101"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Floor Number *</label>
              <input
                type="number"
                required
                value={formData.floorNumber}
                onChange={(e) => setFormData({ ...formData, floorNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Occupants Count *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.occupancy}
                onChange={(e) => setFormData({ ...formData, occupancy: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Flat Area (Sq Ft) *</label>
              <input
                type="number"
                required
                value={formData.flatArea}
                onChange={(e) => setFormData({ ...formData, flatArea: e.target.value })}
                placeholder="1200"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Meter Configuration Modal */}
      <Modal
        isOpen={isMeterOpen}
        onClose={() => setIsMeterOpen(false)}
        title={`Configure Water Meter: Flat ${selectedHousehold?.flatNumber}`}
        footer={
          <>
            <button
              onClick={() => setIsMeterOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitMeter}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs disabled:opacity-50"
            >
              {submitting ? 'Configuring...' : 'Save Meter Setup'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitMeter} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Meter Serial Number (Auto-generated)</label>
            <input
              type="text"
              readOnly
              disabled
              value={selectedHousehold?.meterNumber || meterData.meterNumber}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Installation Date *</label>
            <input
              type="date"
              required
              value={meterData.meterInstallationDate}
              onChange={(e) => setMeterData({ ...meterData, meterInstallationDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>
        </form>
      </Modal>

      {/* Assign Resident Modal */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={`Assign Resident: Flat ${selectedHousehold?.flatNumber}`}
        footer={
          <>
            <button
              onClick={() => setIsAssignOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitAssign}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs disabled:opacity-50"
            >
              {submitting ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmitAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Resident Name *</label>
            <input
              type="text"
              required
              value={residentData.residentName}
              onChange={(e) => setResidentData({ ...residentData, residentName: e.target.value })}
              placeholder="Amit Patel"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Resident Email Address *</label>
            <input
              type="email"
              required
              value={residentData.residentEmail}
              onChange={(e) => setResidentData({ ...residentData, residentEmail: e.target.value })}
              placeholder="amit.patel@gmail.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Households;
