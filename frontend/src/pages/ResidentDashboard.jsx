import React from 'react';
import { useAuth } from '../context/AuthContext';

const ResidentDashboard = () => {
  const { user } = useAuth();
  const displayName = user?.name || user?.email?.split('@')[0] || 'Resident';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-breadcrumb">HydroFlow / Resident Portal</span>
          <h1 className="dashboard-welcome">Welcome, {displayName}</h1>
          <p className="dashboard-subtext">
            Household Water Consumption & Utility Billing Overview
          </p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dash-card">
          <span className="dash-card-label">Current Meter Reading</span>
          <div className="dash-card-value">142.8 <span className="dash-unit">m³</span></div>
          <p className="dash-card-meta">Smart Meter synced 2 hours ago</p>
        </div>

        <div className="dash-card">
          <span className="dash-card-label">Est. Billing Period</span>
          <div className="dash-card-value">$38.40</div>
          <p className="dash-card-meta">Billing due in 14 days</p>
        </div>

        <div className="dash-card">
          <span className="dash-card-label">Account Security</span>
          <div className="dash-card-status">
            <span className="status-dot"></span> Active JWT Session
          </div>
          <p className="dash-card-meta">Role: Resident</p>
        </div>
      </div>

      <div className="dash-placeholder-section" style={{ borderStyle: 'solid', borderColor: 'var(--border-color)' }}>
        <h3>Household Usage & Telemetry</h3>
        <p>
          Your smart water meter is active. Historical daily consumption charts and itemized utility invoices will display here as telemetry data syncs with your community grid.
        </p>
      </div>
    </div>
  );
};

export default ResidentDashboard;
