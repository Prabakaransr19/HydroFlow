import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-breadcrumb">HydroFlow / Portal</span>
          <h1 className="dashboard-welcome">Welcome, {displayName}</h1>
          <p className="dashboard-subtext">
            Water Consumption & Billing Dashboard Overview
          </p>
        </div>
        <div>
          <button type="button" onClick={handleLogout} className="btn btn-outline">
            Log out
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dash-card">
            <span className="dash-card-label">Current Meter Reading</span>
            <div className="dash-card-value">142.8 <span className="dash-unit">m³</span></div>
            <p className="dash-card-meta">Last synced 2 hours ago</p>
          </div>

          <div className="dash-card">
            <span className="dash-card-label">Est. Billing Period</span>
            <div className="dash-card-value">$38.40</div>
            <p className="dash-card-meta">Due in 14 days</p>
          </div>

          <div className="dash-card">
            <span className="dash-card-label">Account Status</span>
            <div className="dash-card-status">
              <span className="status-dot"></span> Active Session
            </div>
            <p className="dash-card-meta">Token verified (SessionStorage)</p>
          </div>
        </div>

        <div className="dash-placeholder-section">
          <h3>System Notice & Quick Actions</h3>
          <p>
            Your account is authenticated. This placeholder area will display detailed meter consumption logs, tariff calculations, and community administrative management tools when connected to backend services.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
