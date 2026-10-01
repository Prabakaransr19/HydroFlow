import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Droplets, Mail, Lock, ArrowRight, ShieldCheck, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot Password Inline 2-Step Flow State
  // mode: 'LOGIN' | 'FORGOT_STEP_1' | 'FORGOT_STEP_2'
  const [mode, setMode] = useState('LOGIN');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get('expired') === 'true';

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.login({ email, password });
      login(response.token, response.user);

      const userRole = response.user?.role;
      if (userRole === 'SUPER_ADMIN') {
        navigate('/admin/dashboard');
      } else if (userRole === 'COMMUNITY_ADMIN') {
        navigate(response.user?.requiresApartmentSetup ? '/community/setup' : '/community/dashboard');
      } else {
        navigate('/resident/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to log in. Please verify your credentials.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await authService.forgotPassword(forgotEmail);
      setSuccessMsg(response.message || 'OTP sent to your email');
      setMode('FORGOT_STEP_2');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authService.resetPassword({
        email: forgotEmail,
        otp,
        newPassword,
      });
      setSuccessMsg(response.message || 'Password reset successfully. Please login.');
      setMode('LOGIN');
      setEmail(forgotEmail);
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail) => {
    setMode('LOGIN');
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl border border-slate-200/90 shadow-2xs">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-11 w-11 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-2xs mb-3">
            <Droplets className="h-5 w-5 fill-white text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {mode === 'LOGIN' ? 'Sign in to HydroFlow' : mode === 'FORGOT_STEP_1' ? 'Reset Password' : 'Verify OTP'}
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            {mode === 'LOGIN' ? 'Access your water management portal' : 'Account security and password recovery'}
          </p>
        </div>

        {/* Expired Session Notice */}
        {isExpired && mode === 'LOGIN' && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 text-center font-semibold">
            Your session has expired. Please log in again.
          </div>
        )}

        {/* Success Notice */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold text-center flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold text-center">
            {error}
          </div>
        )}

        {/* VIEW 1: Standard Login */}
        {mode === 'LOGIN' && (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@community.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('FORGOT_STEP_1');
                    setForgotEmail(email);
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="text-[11px] font-bold text-sky-600 hover:text-sky-700"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-2xs hover:shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* VIEW 2: Forgot Password - Step 1 (Request OTP) */}
        {mode === 'FORGOT_STEP_1' && (
          <form className="space-y-4" onSubmit={handleRequestOtp}>
            <p className="text-xs text-slate-500 font-medium">
              Enter your account email address. We will send a 6-digit OTP code to verify your request.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@community.com"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setError('');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </div>
          </form>
        )}

        {/* VIEW 3: Forgot Password - Step 2 (Reset Password) */}
        {mode === 'FORGOT_STEP_2' && (
          <form className="space-y-4" onSubmit={handleResetPassword}>
            <p className="text-xs text-slate-500 font-medium">
              Enter the 6-digit OTP sent to <strong className="text-slate-800">{forgotEmail}</strong> and choose a new password.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">6-Digit OTP Code</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Resetting Password...' : 'Reset Password & Login'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setError('');
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </div>
          </form>
        )}

        {/* Demo Fast Login Shortcuts */}
        {mode === 'LOGIN' && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              Quick Demo Shortcuts:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('admin@platform.com')}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg transition"
              >
                Super Admin
              </button>
              <button
                onClick={() => handleQuickLogin('community@greenvalley.com')}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg transition"
              >
                Community Admin
              </button>
              <button
                onClick={() => handleQuickLogin('resident@greenvalley.com')}
                className="px-2 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-[10px] font-bold rounded-lg transition"
              >
                Resident
              </button>
            </div>
          </div>
        )}

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-sky-600 hover:text-sky-700">
              Register Community
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
