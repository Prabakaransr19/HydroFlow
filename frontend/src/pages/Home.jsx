import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, getDashboardPath } = useAuth();

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-pill">Water Consumption & Utility Billing</div>
        <h1 className="hero-title">HydroFlow Management System</h1>
        <p className="hero-tagline">
          Streamlined metering, consumption analytics, and automated utility invoicing for modern residential communities and administrative utility boards.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to={getDashboardPath()} className="btn btn-primary btn-lg">
              Go to Dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary btn-lg">
                Log in to Account
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Community Admin Registration
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-header">
            <span className="feature-tag">Resident Access</span>
            <h3>Meter Tracking</h3>
          </div>
          <p>
            Monitor real-time consumption rates, track historical usage data, and review current billing statements transparently.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-header">
            <span className="feature-tag">Community Admin</span>
            <h3>Administrative Control</h3>
          </div>
          <p>
            Manage neighborhood meters, send resident registration invites, and oversee access control with role-based permissions.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-header">
            <span className="feature-tag">Super Admin</span>
            <h3>Platform Governance</h3>
          </div>
          <p>
            Approve or reject pending community administrator access requests to ensure enterprise-grade security.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;

