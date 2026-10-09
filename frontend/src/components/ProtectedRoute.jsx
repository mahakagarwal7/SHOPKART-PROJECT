import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

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
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

