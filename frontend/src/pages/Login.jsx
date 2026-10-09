import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Success message passed from registration page if redirected
  const successMessage = location.state?.message || '';

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Please provide both email and password');
      return;
    }

    setLoading(true);
    try {
      await api.post('/customers/login', {
        email: form.email.trim(),
        password: form.password,
      });
      // On success -> Navigate to /home
      navigate('/home');
    } catch (err) {
      // Show "Invalid Credentials" or message from backend on failure
      setError(err?.response?.data?.message || 'Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your ShopKart account</p>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            <span>✅</span>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="e.g. john@example.com"
              value={form.email}
              onChange={onChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={onChange}
              className="form-input"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

