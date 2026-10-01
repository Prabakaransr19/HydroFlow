import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Mail, Shield, Building, Home, CheckCircle2, Edit3, Save, X, Lock } from 'lucide-react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.getProfile();
      setProfile(data);
      setEditName(data?.name || '');
      setEditEmail(data?.email || '');
    } catch (_err) {
      setError('Failed to fetch user profile details.');
    } finally {
      setLoading(false);
    }
  };

  const isEditableRole = profile?.role === 'SUPER_ADMIN' || profile?.role === 'COMMUNITY_ADMIN';

  const handleStartEdit = () => {
    setEditName(profile?.name || '');
    setEditEmail(profile?.email || '');
    setIsEditing(true);
    setError('');
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(profile?.name || '');
    setEditEmail(profile?.email || '');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      setError('Name and Email cannot be empty.');
      return;
    }

    setSaveLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const updated = await authService.updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
      });

      setProfile(updated);
      setIsEditing(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update user profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching profile details..." />;
  if (error && !profile) return <ErrorMessage message={error} onRetry={fetchProfile} />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Account Governance</span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage your platform identity and community assignment</p>
        </div>

        {isEditableRole && !isEditing && (
          <button
            onClick={handleStartEdit}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-2xs transition shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && profile && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold rounded-xl flex items-center gap-2 shadow-2xs">
          <X className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6">
        {isEditing ? (
          /* Editable Form */
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
                Edit Profile Attributes
              </h3>
              <span className="text-[11px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
                {profile?.role?.replace('_', ' ')} MODE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={saveLoading}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saveLoading ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-6">
            <div className="w-16 h-16 rounded-xl bg-sky-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-2xs shrink-0">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-center sm:text-left space-y-1.5 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                <h2 className="text-xl font-extrabold text-slate-900">{profile?.name}</h2>
                <div>
                  <StatusBadge status={profile?.status || 'APPROVED'} />
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {profile?.email}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-800 border border-sky-200/80 rounded-full text-xs font-bold mt-2">
                <Shield className="w-3.5 h-3.5 text-sky-600" />
                Role: {profile?.role?.replace('_', ' ')}
              </div>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2.5 bg-white text-sky-600 rounded-lg border border-slate-200 shadow-2xs">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Assigned Apartment</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{profile?.apartment || 'Green Valley Residency'}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Primary Managed Community</p>
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2.5 bg-white text-sky-600 rounded-lg border border-slate-200 shadow-2xs">
              <Home className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Household / Unit</p>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{profile?.household || 'N/A'}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Flat Occupancy Unit</p>
            </div>
          </div>
        </div>

        {/* Access Scoping & Lock Notice */}
        {isEditableRole ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-3 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950">Administrative Profile Editable</h4>
              <p className="mt-0.5 text-emerald-800 leading-relaxed font-medium">
                As a {profile?.role?.replace('_', ' ')}, you can update your display name and registered email directly from this profile workspace.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-3 text-xs text-amber-900">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-950">Read-Only Resident Account</h4>
              <p className="mt-0.5 text-amber-800 leading-relaxed font-medium">
                Resident profile details are read-only and managed by your Community Administrator for security compliance.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
