import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ error: '', success: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    api
      .get('/customers/me')
      .then((res) => {
        if (mounted) {
          setUser(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Failed to fetch user:', err);
          // If not logged in -> Automatically redirect to /login
          navigate('/login', { replace: true });
        }
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const onPwdChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    if (pwdMsg.error || pwdMsg.success) setPwdMsg({ error: '', success: '' });
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg({ error: '', success: '' });

    if (!passwords.oldPassword || !passwords.newPassword) {
      setPwdMsg({ error: 'Both old and new passwords are required', success: '' });
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPwdMsg({ error: 'New password must be at least 6 characters', success: '' });
      return;
    }

    setPwdLoading(true);
    try {
      const res = await api.patch('/customers/change-password', passwords);
      setPwdMsg({
        error: '',
        success: res.data?.message || 'Password changed successfully!',
      });
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setPwdMsg({
        error: err.response?.data?.message || 'Failed to change password',
        success: '',
      });
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your ShopKart profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="home-container">
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <h1>Welcome, {user.fullName}! 👋</h1>
        <p>You are securely logged into your ShopKart customer account.</p>
      </section>

      <div className="dashboard-grid">
        {/* Customer Information Card */}
        <div className="dashboard-card">
          <h3>
            <span>👤</span> Customer Profile
          </h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Full Name</span>
              <span className="info-value">{user.fullName}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email Address</span>
              <span className="info-value">{user.email}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone Number</span>
              <span className="info-value">{user.phone}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Account Status</span>
              <span className="badge-active">Active Customer</span>
            </div>
          </div>
        </div>

        {/* Bonus Challenge Card: Change Password */}
        <div className="dashboard-card">
          <h3>
            <span>🔒</span> Change Password
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            Update your account password securely (Lab 01 Bonus Challenge).
          </p>

          {pwdMsg.success && (
            <div className="alert alert-success">
              <span>✅</span>
              <span>{pwdMsg.success}</span>
            </div>
          )}

          {pwdMsg.error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <span>{pwdMsg.error}</span>
            </div>
          )}

          <form onSubmit={submitPasswordChange} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="oldPassword">
                Old Password
              </label>
              <input
                id="oldPassword"
                name="oldPassword"
                type="password"
                placeholder="Current password"
                value={passwords.oldPassword}
                onChange={onPwdChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="New password (min 6 characters)"
                value={passwords.newPassword}
                onChange={onPwdChange}
                className="form-input"
                required
              />
            </div>

            <button type="submit" disabled={pwdLoading} className="btn-submit">
              {pwdLoading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

