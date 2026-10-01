import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { residentService } from '../services/residentService';
import { User, Mail, Send, Copy, Check, ArrowLeft, Droplets, Sparkles, AlertCircle } from 'lucide-react';

const InviteResident = () => {
  const [residentName, setResidentName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [invitationResult, setInvitationResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInvitationResult(null);
    setCopied(false);

    if (!residentName.trim()) {
      setError('Resident name is required');
      return;
    }

    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const data = await residentService.inviteResident(residentName.trim(), email.trim());
      
      let link = data?.invitationLink || '';
      if (!link && data?.token) {
        link = `${window.location.origin}/resident/register?token=${data.token}`;
      } else if (link && !link.startsWith('http')) {
        link = `${window.location.origin}${link.startsWith('/') ? '' : '/'}${link}`;
      }

      setInvitationResult({
        message: data?.message || 'Resident invitation created successfully.',
        invitationLink: link,
        token: data?.token || '',
      });

      setResidentName('');
      setEmail('');
    } catch (err) {
      if (err.response) {
        const backendMsg = err.response.data?.message || err.response.data?.error || err.response.data;
        setError(typeof backendMsg === 'string' ? backendMsg : 'Failed to send invitation. Please try again.');
      } else {
        setError('Unable to reach backend server. Please check network connectivity.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!invitationResult?.invitationLink) return;
    navigator.clipboard.writeText(invitationResult.invitationLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/community/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-xs font-bold">
          <Droplets className="w-3.5 h-3.5 text-sky-600 fill-current" />
          <span>Community Operations</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="text-center">
          <div className="mx-auto h-11 w-11 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Invite Resident</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Generate an onboarding invitation link for a flat occupant to access their water dashboard.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Success Alert & Invitation Link Box */}
        {invitationResult && (
          <div className="p-4 bg-emerald-50 border border-emerald-200/90 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              <span>{invitationResult.message || 'Resident invitation created successfully.'}</span>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Generated Invitation Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={invitationResult.invitationLink}
                  onClick={(e) => e.target.select()}
                  className="flex-1 px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-mono text-emerald-950 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-emerald-700 font-medium">
                Share this unique link with the resident so they can register and set up their password.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="residentName" className="block text-xs font-bold text-slate-700 mb-1.5">
              RESIDENT FULL NAME
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="residentName"
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={residentName}
                onChange={(e) => setResidentName(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1.5">
              RESIDENT EMAIL ADDRESS
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                placeholder="sarah.jenkins@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition shadow-2xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              'Generating Invitation...'
            ) : (
              <>
                <span>Send Invitation</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InviteResident;
