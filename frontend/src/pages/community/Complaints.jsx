import React, { useEffect, useState } from 'react';
import { complaintService } from '../../services/complaintService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { AlertCircle, CheckCircle2, Clock, MessageSquare, Filter, Building, Send } from 'lucide-react';

const Complaints = () => {
  const { user } = useAuth();
  const apartmentId = user?.apartmentId || user?.apartment?.id || null;

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  // Inline action state
  const [actionId, setActionId] = useState(null);
  const [actionType, setActionType] = useState(null); // 'ACKNOWLEDGE' | 'RESOLVE'
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [apartmentId, activeTab]);

  const fetchComplaints = async () => {
    if (!apartmentId) return;
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getApartmentComplaints(apartmentId, activeTab);
      setComplaints(data);
    } catch (_err) {
      setError('Failed to fetch apartment complaints.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionSubmit = async (e, complaintId) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (actionType === 'ACKNOWLEDGE') {
        await complaintService.acknowledgeComplaint(complaintId, adminNote);
      } else if (actionType === 'RESOLVE') {
        await complaintService.resolveComplaint(complaintId, adminNote);
      }
      setActionId(null);
      setActionType(null);
      setAdminNote('');
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint status.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACKNOWLEDGED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold">
            <Clock className="w-3 h-3 text-sky-600" />
            Acknowledged
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 text-[11px] font-bold">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Open
          </span>
        );
    }
  };

  if (!apartmentId) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="border-b border-slate-200 pb-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Community Operations</span>
          <h1 className="text-2xl font-extrabold text-slate-900">Complaints Helpdesk</h1>
        </div>
        <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
          Apartment not configured. Please complete your apartment setup before accessing complaints.
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner message="Loading apartment complaints..." />;

  const tabs = [
    { id: 'ALL', label: 'All Complaints' },
    { id: 'OPEN', label: 'Open' },
    { id: 'ACKNOWLEDGED', label: 'Acknowledged' },
    { id: 'RESOLVED', label: 'Resolved' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold mb-1.5">
          <Building className="w-3 h-3 text-sky-600" />
          <span>Resident Helpdesk Governance</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resident Complaints</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">Review, acknowledge, and resolve issues reported by community residents</p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchComplaints} />}

      {/* Filter Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === tab.id
                ? 'text-sky-600 border-b-2 border-sky-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-xl p-8 text-center text-xs text-slate-500 font-medium">
          No complaints found for status filter "{activeTab}".
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-bold rounded">
                    Flat {c.householdFlatNumber || 'A101'}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">• {c.raisedByName || 'Resident'}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase">
                    {c.category}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </span>
                  {getStatusBadge(c.status)}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-900">{c.title}</h3>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">{c.description}</p>
              </div>

              {/* Admin Note / Resolution Info */}
              {c.adminNote && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                    <span>Admin Response ({c.acknowledgedByName || 'Community Admin'}):</span>
                  </div>
                  <p className="text-slate-600 font-medium pl-5">{c.adminNote}</p>
                  {c.resolvedAt && (
                    <p className="text-[10px] text-slate-400 pl-5 pt-1">
                      Resolved on: {new Date(c.resolvedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons & Inline Form */}
              <div className="pt-2 flex flex-col space-y-3">
                {c.status === 'OPEN' && actionId !== c.id && (
                  <div>
                    <button
                      onClick={() => {
                        setActionId(c.id);
                        setActionType('ACKNOWLEDGE');
                        setAdminNote('');
                      }}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                    >
                      Acknowledge
                    </button>
                  </div>
                )}

                {c.status === 'ACKNOWLEDGED' && actionId !== c.id && (
                  <div>
                    <button
                      onClick={() => {
                        setActionId(c.id);
                        setActionType('RESOLVE');
                        setAdminNote(c.adminNote || '');
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs"
                    >
                      Resolve
                    </button>
                  </div>
                )}

                {/* Inline Action Input Form */}
                {actionId === c.id && (
                  <form onSubmit={(e) => handleActionSubmit(e, c.id)} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        {actionType === 'ACKNOWLEDGE' ? 'Acknowledgment Note / Schedule' : 'Resolution Details'}
                      </label>
                      <input
                        type="text"
                        required
                        value={adminNote}
                        onChange={(e) => setAdminNote(e.target.value)}
                        placeholder={actionType === 'ACKNOWLEDGE' ? 'e.g. Plumber scheduled for 10 AM tomorrow' : 'e.g. Leak repaired and verified.'}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        <span>{submitting ? 'Saving...' : actionType === 'ACKNOWLEDGE' ? 'Confirm Acknowledge' : 'Confirm Resolve'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActionId(null);
                          setActionType(null);
                        }}
                        className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Complaints;
