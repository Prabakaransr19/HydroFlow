import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CommunityDashboard = () => {
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split('@')[0] || 'Community Admin';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-breadcrumb">HydroFlow / Community Admin</span>
          <h1 className="dashboard-welcome">Welcome, {displayName}</h1>
          <p className="dashboard-subtext">
            Manage neighborhood water meters, billing reports, and resident invitations
          </p>
        </div>
        <div>
          <Link to="/community/invite" className="btn btn-primary">
            + Invite Resident
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card">
          <span className="dash-card-label">Active Community Meters</span>
          <div className="dash-card-value">28</div>
          <p className="dash-card-meta">100% telemetry online</p>
        </div>

        <div className="dash-card">
          <span className="dash-card-label">Registered Residents</span>
          <div className="dash-card-value">42</div>
          <p className="dash-card-meta">Active community accounts</p>
        </div>

        <div className="dash-card">
          <span className="dash-card-label">Current Period Consumption</span>
          <div className="dash-card-value">4,120 <span className="dash-unit">m³</span></div>
          <p className="dash-card-meta">Total neighborhood usage</p>
        </div>
      </div>

      <div className="dash-placeholder-section" style={{ borderStyle: 'solid', borderColor: 'var(--border-color)' }}>
        <h3>Community Management Quick Actions</h3>
        <p style={{ marginBottom: '1.25rem' }}>
          As a Community Administrator, you can issue secure registration invitations to residents in your neighborhood.
        </p>
        <Link to="/community/invite" className="btn btn-secondary">
          Generate Resident Invitation Link &rarr;
        </Link>
      </div>
    </div>
  );
};

export default CommunityDashboard;
