import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { ShieldIcon } from './Icons';

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    api
      .get('/customers/me')
      .then(() => {
        if (mounted) {
          setAuthed(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setAuthed(false);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="storefront-auth-loading-screen">
        <div className="auth-loading-card">
          <div className="auth-loading-spinner-wrapper">
            <div className="spinner modern-gradient-spinner"></div>
            <div className="spinner-center-icon">
              <ShieldIcon size={24} />
            </div>
          </div>
          <h3 className="auth-loading-title">Securing Your Session</h3>
          <p className="auth-loading-subtitle">Verifying customer credentials...</p>
          <div className="auth-loading-pill">
            <span className="pulse-indicator-dot"></span>
            <span>256-Bit SSL Protected</span>
          </div>
        </div>
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

