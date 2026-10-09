import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!form.fullName.trim() || !form.email.trim() || !form.password || !form.phone.trim()) {
      setError('All fields are required');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/customers/register', {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      // On success -> Redirect to Login page with success state
      navigate('/login', {
        state: { message: 'Registration successful! Please log in with your credentials.' },
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join ShopKart to start shopping today</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="e.g. John Doe"
              value={form.fullName}
              onChange={onChange}
              className="form-input"
              required
            />
          </div>

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
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={onChange}
              className="form-input"
              required
            />
            <div className="form-hint">Must contain at least 6 characters</div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={onChange}
              className="form-input"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

