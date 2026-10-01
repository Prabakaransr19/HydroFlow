import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';
import { Menu, LogOut, User, Droplets } from 'lucide-react';

const Navbar = ({ onMenuToggle }) => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="h-16 px-4 lg:px-8 flex items-center justify-between">
        {/* Left Side: Toggle button & branding */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-2xs group-hover:bg-sky-700 transition-colors">
              <Droplets className="w-4 h-4 fill-white text-white" />
            </div>
            <div className="flex items-center">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">HydroFlow</span>
              <span className="text-xs text-slate-500 font-semibold ml-1.5 border-l border-slate-200 pl-1.5 hidden sm:inline">
                Platform
              </span>
            </div>
          </Link>
        </div>

        {/* Right Side: Auth controls */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs border border-sky-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  {role?.replace('_', ' ')}
                </p>
              </div>
            </div>

            {user?.status && (
              <div className="hidden md:block">
                <StatusBadge status={user.status} />
              </div>
            )}

            <Link
              to="/profile"
              className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              title="My Profile"
            >
              <User className="w-4.5 h-4.5" />
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold rounded-lg transition-all shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:inline"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-sky-700 rounded-lg transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-2xs hover:shadow-xs transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
