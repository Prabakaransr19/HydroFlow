import React, { useEffect, useState } from 'react';
import { complaintService } from '../../services/complaintService';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { AlertCircle, Plus, Send, CheckCircle2, Clock, MessageSquare, ShieldAlert } from 'lucide-react';

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'LEAK',
    description: '',
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (_err) {
      setError('Failed to fetch your complaints.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError('Please provide both title and description.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      await complaintService.raiseComplaint(formData);
      setMessage('Complaint submitted successfully!');
      setFormData({ title: '', category: 'LEAK', description: '' });
      setIsFormOpen(false);
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.');
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

  const getCategoryBadge = (category) => {
    return (
      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase tracking-wider">
        {category}
      </span>
    );
  };

  if (loading) return <LoadingSpinner message="Loading your complaints..." />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200/80 text-[11px] font-bold mb-1.5">
            <AlertCircle className="w-3 h-3 text-sky-600" />
            <span>Helpdesk & Issue Resolution</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Complaints</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">Report leaks, billing discrepancies, or meter issues to community management</p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? 'Cancel' : 'Raise Complaint'}</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchComplaints} />}
      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-bold">
          {message}
        </div>
      )}

      {/* Inline Raise Complaint Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShieldAlert className="w-4.5 h-4.5 text-sky-600" />
            <h2 className="text-sm font-extrabold text-slate-900">New Issue Ticket</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Issue Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Water leak near main meter inlet"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500"
              >
                <option value="LEAK">LEAK</option>
                <option value="BILLING">BILLING</option>
                <option value="METER">METER</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the issue, location, and severity in detail..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-2xs disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Complaint'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Complaints List */}
      {complaints.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-xl p-8 text-center text-xs text-slate-500 font-medium">
          No complaints reported yet. Click "Raise Complaint" above if you encounter any issues.
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  {getCategoryBadge(c.category)}
                  <h3 className="text-sm font-extrabold text-slate-900">{c.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </span>
                  {getStatusBadge(c.status)}
                </div>
              </div>

              <p className="text-xs text-slate-600 font-medium leading-relaxed">{c.description}</p>

              {c.adminNote && (
                <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                    <span>Admin Response ({c.acknowledgedByName || 'Community Admin'}):</span>
                  </div>
                  <p className="text-slate-600 font-medium pl-5">{c.adminNote}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyComplaints;
