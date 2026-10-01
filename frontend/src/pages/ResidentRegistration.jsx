import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Droplets, CheckCircle2, AlertCircle, Key, Mail, User, Lock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';

const ResidentRegistration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState(null);
  const [error, setError] = useState('');

  // Password & Profile Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing registration token in URL. Please check your invitation link.');
      setLoading(false);
      return;
    }
    validateToken(token);
  }, [token]);

  const validateToken = async (t) => {
    setLoading(true);
    setError('');
    try {
      const res = await authService.validateInvitation(t);
      setInvitation(res);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Invitation token is invalid or expired.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (!phone || !/^\+?[0-9]{7,15}$/.test(phone)) {
      setPasswordError('Please enter a valid phone number (7 to 15 digits).');
      return;
    }
    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await authService.completeResidentRegistration({
        token,
        password,
        phone,
      });
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to complete registration.';
      setPasswordError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-sky-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
          <Droplets className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">HydroFlow Resident Onboarding</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Confirm your email address and set up your account password</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-semibold">Validating invitation token...</p>
            </div>
          ) : error ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-white">Invitation Link Invalid</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">{error}</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-white">Email Confirmed & Password Created!</h3>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  Your resident account is now active. You can log in using your email address and newly created password.
                </p>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 font-mono text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Account Name:</span>
                  <span className="font-bold text-white">{invitation?.residentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-sans">Registered Email:</span>
                  <span className="font-bold text-sky-400">{invitation?.email}</span>
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Resident Pre-filled Meta Box */}
              <div className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-sky-400 font-bold border-b border-slate-800/80 pb-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Resident Invitation</span>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-1 text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Resident Name
                    </span>
                    <span className="font-bold text-white">{invitation?.residentName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Registered Email
                    </span>
                    <span className="font-bold text-sky-400">{invitation?.email}</span>
                  </div>
                </div>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+919876543210"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                <span>{submitting ? 'Creating Account...' : 'Confirm Email & Create Password'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResidentRegistration;
