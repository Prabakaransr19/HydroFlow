import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { residentService } from '../services/residentService';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  Droplets,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  Clock,
  UserCheck,
} from 'lucide-react';

const ResidentRegister = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token') || '';

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [residentData, setResidentData] = useState({ name: '', email: '' });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorState, setErrorState] = useState({ title: '', message: '', type: 'generic' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const validateInvitationToken = useCallback(async () => {
    if (!token) {
      setValidating(false);
      setTokenValid(false);
      setErrorState({
        title: 'Missing Invitation Token',
        message: 'No token was provided in the invitation link. Please check your link or contact your Community Administrator.',
        type: 'invalid',
      });
      return;
    }

    setValidating(true);
    setErrorState({ title: '', message: '', type: '' });

    try {
      const data = await residentService.validateToken(token);

      setTokenValid(true);
      setResidentData({
        name: data?.residentName || data?.name || data?.resident_name || 'Valued Resident',
        email: data?.email || '',
      });
    } catch (err) {
      setTokenValid(false);
      if (err.response) {
        const status = err.response.status;
        const backendMsg = err.response.data?.message || err.response.data?.error || err.response.data;
        const msgString = typeof backendMsg === 'string' ? backendMsg : '';

        let title = 'Invalid Invitation';
        let message = msgString || 'Your invitation token is invalid.';
        let type = 'invalid';

        if (status === 400 || msgString.toLowerCase().includes('used') || msgString.toLowerCase().includes('already')) {
          title = 'Invitation Already Used';
          message = msgString || 'This invitation link has already been used to create an account.';
          type = 'used';
        } else if (status === 410 || msgString.toLowerCase().includes('expire')) {
          title = 'Invitation Expired';
          message = msgString || 'This invitation link has expired. Please ask your administrator to send a new invitation.';
          type = 'expired';
        } else if (status === 404) {
          title = 'Invalid Invitation';
          message = 'The invitation link was not found. Please verify your link.';
          type = 'invalid';
        }

        setErrorState({ title, message, type });
      } else {
        setErrorState({
          title: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          type: 'network',
        });
      }
    } finally {
      setValidating(false);
    }
  }, [token]);

  useEffect(() => {
    validateInvitationToken();
  }, [validateInvitationToken]);

  const validateForm = () => {
    const errors = {};

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorState({ title: '', message: '', type: '' });

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      await residentService.registerResident(token, password);

      setSuccess(true);

      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Account created successfully! Please log in with your password.' },
        });
      }, 2000);
    } catch (err) {
      if (err.response) {
        const backendMsg = err.response.data?.message || err.response.data?.error || err.response.data;
        setErrorState({
          title: 'Account Creation Failed',
          message: typeof backendMsg === 'string' ? backendMsg : 'Registration failed. Please try again.',
          type: 'registration_failed',
        });
      } else {
        setErrorState({
          title: 'Network Error',
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          type: 'network',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (validating) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-8 max-w-md w-full text-center shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Validating Invitation</h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Please wait while we verify your resident registration token...
          </p>
        </div>
      </div>
    );
  }

  // Token Error States
  if (!tokenValid && !success) {
    const getErrorIcon = () => {
      switch (errorState.type) {
        case 'expired':
          return <Clock className="w-8 h-8 text-amber-600" />;
        case 'used':
          return <UserCheck className="w-8 h-8 text-sky-600" />;
        default:
          return <XCircle className="w-8 h-8 text-rose-600" />;
      }
    };

    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="bg-white border border-slate-200/90 rounded-xl p-8 max-w-md w-full text-center shadow-2xs space-y-4">
          <div className="flex justify-center">{getErrorIcon()}</div>
          <h2 className="text-lg font-extrabold text-slate-900">
            {errorState.title || 'Invalid Invitation'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {errorState.message}
          </p>

          {errorState.type === 'network' ? (
            <button
              type="button"
              onClick={validateInvitationToken}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Validation</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <span>Return to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Registration Form
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-xl border border-slate-200/90 shadow-2xs">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-11 w-11 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-2xs mb-3">
            <Droplets className="h-5 w-5 fill-white text-white" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Resident Account Setup</h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">Set your password to activate your water account</p>
        </div>

        {/* Success Alert */}
        {success ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-extrabold text-emerald-950">
              Account Created Successfully
            </h3>
            <p className="text-xs text-emerald-800 font-medium">
              Your resident account is active. Redirecting you to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorState.message && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <p>{errorState.message}</p>
              </div>
            )}

            {/* Resident Name (Readonly) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">RESIDENT NAME</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  disabled
                  value={residentData.name}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            {/* Email Address (Readonly) */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={residentData.email}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-not-allowed opacity-80"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">NEW PASSWORD</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                  }}
                  disabled={submitting}
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-10 py-2 bg-slate-50 border ${
                    fieldErrors.password ? 'border-rose-400' : 'border-slate-200'
                  } rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition shadow-2xs`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="text-[11px] font-semibold text-rose-600 mt-1 block">{fieldErrors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">CONFIRM PASSWORD</label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                  }}
                  disabled={submitting}
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-10 py-2 bg-slate-50 border ${
                    fieldErrors.confirmPassword ? 'border-rose-400' : 'border-slate-200'
                  } rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 transition shadow-2xs`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <span className="text-[11px] font-semibold text-rose-600 mt-1 block">{fieldErrors.confirmPassword}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {submitting ? (
                'Creating Account...'
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700">
                Log in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResidentRegister;
