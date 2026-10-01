import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Droplets,
  Zap,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle2,
  ArrowRight,
  Gauge,
  Receipt,
  Sparkles,
  BarChart3,
  Waves
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* HydroFlow logo/droplet icon + HydroFlow Platform branding */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-2xs">
              <Droplets className="w-4.5 h-4.5 fill-white text-white" />
            </div>
            <div className="flex items-center">
              <span className="font-extrabold text-base text-slate-900 tracking-tight">HydroFlow</span>
              <span className="text-xs text-slate-500 font-semibold ml-2 border-l border-slate-200 pl-2">
                Platform
              </span>
            </div>
          </div>

          {/* Navigation links on right */}
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-700 hover:text-sky-600 transition-colors hidden sm:inline-block"
            >
              Home
            </Link>
            {isAuthenticated ? (
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-sky-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-2xs hover:shadow-xs transition-all"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/70 via-slate-50/50 to-slate-50 pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Abstract water wave graphic accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-sky-200/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Subtle category badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200/80 text-sky-800 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Water Utility &amp; Consumption Governance</span>
          </div>

          {/* Large Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            HydroFlow Management System
          </h1>

          {/* Supporting text */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 font-normal leading-relaxed mb-8">
            Comprehensive water consumption monitoring, analytics, automated tiered billing, and utility management for residential apartment communities.
          </p>

          {/* Two clear CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold shadow-2xs hover:shadow-xs transition-all flex items-center justify-center space-x-2"
            >
              <span>Log in to Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-sm font-bold shadow-2xs transition-all flex items-center justify-center space-x-2"
            >
              <span>Community Admin Registration</span>
            </Link>
          </div>

          {/* Key metrics overview strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs text-left">
            <div className="p-3 border-r border-slate-100 last:border-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Meter Accuracy</span>
              <span className="text-2xl font-extrabold text-sky-600">100%</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Daily logging telemetry</span>
            </div>
            <div className="p-3 border-r border-slate-100 last:border-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Tariff Engine</span>
              <span className="text-2xl font-extrabold text-blue-600">3-Tier</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Automated rate tiers</span>
            </div>
            <div className="p-3 border-r border-slate-100 last:border-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Leak Detection</span>
              <span className="text-2xl font-extrabold text-emerald-600">&gt; 2σ</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Statistical anomaly alerts</span>
            </div>
            <div className="p-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Batch Logging</span>
              <span className="text-2xl font-extrabold text-indigo-600">CSV Bulk</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Instant data import</span>
            </div>
          </div>
        </div>
      </section>

      {/* THREE-COLUMN FEATURE CARDS SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-sky-600">Platform Governance</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Built for Every Stakeholder
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Resident Access */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between water-card-hover">
            <div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4">
                <Gauge className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Meter Tracking</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">Resident Access</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Track personal water consumption, monitor daily usage charts, review 3-tier bill breakdowns, and receive leak warnings.
              </p>
            </div>
            <ul className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Daily Consumption Charts</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Itemized Utility Statements</span>
              </li>
            </ul>
          </div>

          {/* Card 2: Community Admin */}
          <div className="bg-white border border-sky-200/90 rounded-xl p-6 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between water-card-hover relative">
            <div className="absolute -top-3 right-4 bg-sky-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Primary Workflow
            </div>
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Administrative Control</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">Community Admin</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Manage household meters, log daily readings, execute bulk CSV uploads, run monthly billing engines, and distribute tanker costs.
              </p>
            </div>
            <ul className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Water Purchase Allocation</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Billing Engine &amp; Cycle Locks</span>
              </li>
            </ul>
          </div>

          {/* Card 3: Super Admin */}
          <div className="bg-white border border-slate-200/90 rounded-xl p-6 shadow-2xs hover:shadow-sm transition-all duration-200 flex flex-col justify-between water-card-hover">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Platform Governance</span>
              <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">Super Admin</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Evaluate community admin registration applications, onboard new apartment complexes, and oversee platform analytics.
              </p>
            </div>
            <ul className="space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Admin Approval Queue</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Property Portfolio Overview</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-sky-600 flex items-center justify-center text-white">
              <Droplets className="w-3.5 h-3.5 fill-white text-white" />
            </div>
            <span className="font-bold text-slate-900 text-sm">HydroFlow Platform</span>
          </div>

          <p className="text-slate-500 text-xs font-medium">
            &copy; {new Date().getFullYear()} HydroFlow Utility Management System. All rights reserved.
          </p>

          <div className="flex items-center space-x-4 text-xs font-semibold text-slate-600">
            <Link to="/login" className="hover:text-sky-600 transition-colors">Sign In</Link>
            <Link to="/register" className="hover:text-sky-600 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
