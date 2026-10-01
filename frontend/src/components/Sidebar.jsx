import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  Home,
  Droplets,
  Truck,
  Receipt,
  FileText,
  User,
  X,
  CalendarCheck,
  Zap,
  AlertCircle
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const superAdminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Community Admins', path: '/admin/community-admins', icon: Users },
    { name: 'Community Approvals', path: '/admin/approvals', icon: CalendarCheck },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const communityAdminLinks = [
    { name: 'Dashboard', path: '/community/dashboard', icon: LayoutDashboard },
    { name: 'Apartment Details', path: '/community/apartments', icon: Building2 },
    { name: 'Households', path: '/community/households', icon: Home },
    { name: 'Water Purchases', path: '/community/water-purchases', icon: Truck },
    { name: 'Tariff Configuration', path: '/community/tariff-config', icon: Zap },
    { name: 'Billing Workspace', path: '/community/billing', icon: Receipt },
    { name: 'Invoices', path: '/community/invoices', icon: FileText },
    { name: 'Complaints', path: '/community/complaints', icon: AlertCircle },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  const residentLinks = [
    { name: 'Dashboard', path: '/resident/dashboard', icon: LayoutDashboard },
    { name: 'My Bills', path: '/resident/bills', icon: Receipt },
    { name: 'My Invoices', path: '/resident/invoices', icon: FileText },
    { name: 'Complaints', path: '/resident/complaints', icon: AlertCircle },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  let links = [];
  if (role === 'SUPER_ADMIN') links = superAdminLinks;
  else if (role === 'COMMUNITY_ADMIN') links = communityAdminLinks;
  else if (role === 'RESIDENT') links = residentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-950 text-slate-300 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-xs">
              <Droplets className="w-4.5 h-4.5 fill-white text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-white tracking-wide">HydroFlow</h1>
              <p className="text-[10px] text-sky-400 font-bold tracking-wider uppercase">Enterprise SaaS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {role ? role.replace('_', ' ') : 'NAVIGATION'}
            </span>
          </div>

          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-600 text-white font-bold shadow-2xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Info */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/30">
          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800/80">
            <p className="text-[11px] font-bold text-slate-200">HydroFlow System</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Utility & Billing Governance</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
