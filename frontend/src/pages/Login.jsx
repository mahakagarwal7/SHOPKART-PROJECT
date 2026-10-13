import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import {
  CartIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  TruckIcon,
  ShieldIcon,
  CreditCardIcon,
  ArrowRightIcon,
  StarIcon,
  CheckIcon,
} from '../components/Icons';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchCart } = useCart();

  const [form, setForm] = useState({
    email: location.state?.email || '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  // If redirected with state message, show it
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
    if (location.state?.email) {
      setForm((prev) => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!form.email || !form.password) {
      setError('Both email and password are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/customers/login', form);
      if (res.data?.token) {
        localStorage.setItem('shopkart_token', res.data.token);
      }
      fetchCart();
      setSuccessMessage('Login successful! Redirecting to storefront...');
      setTimeout(() => {
        navigate('/home', { replace: true });
      }, 700);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="storefront-auth-page">
      {/* Background ambient lighting orbs */}
      <div className="auth-ambient-orb orb-1"></div>
      <div className="auth-ambient-orb orb-2"></div>

      <div className="storefront-container auth-split-container">
        <div className="auth-split-card">
          {/* Left Column: Visual Lifestyle Showcase */}
          <div className="auth-showcase-panel">
            <div className="showcase-overlay-gradient"></div>
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
              alt="ShopKart Collection"
              className="showcase-bg-image"
            />

            <div className="showcase-inner-content">
              {/* Brand Pill */}
              <div className="showcase-badge">
                <span className="badge-sparkle">✨</span>
                <span>Curated Lifestyle & Electronics</span>
              </div>

              <h2 className="showcase-headline">
                Elevate Your Everyday with <span>Curated Essentials</span>
              </h2>

              <p className="showcase-description">
                Join over 10,000+ members enjoying handpicked technology, modern apparel, instant Razorpay checkout, and express nationwide delivery.
              </p>

              {/* Floating Testimonial Card */}
              <div className="showcase-testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} size={15} filled={true} />
                  ))}
                </div>
                <p className="testimonial-quote">
                  "The finest curated store I've used. Fast 2-day delivery across India and spotless packaging!"
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">A</div>
                  <div>
                    <span className="author-name">Aarav Sharma</span>
                    <span className="author-tag">Verified Member • Mumbai</span>
                  </div>
                </div>
              </div>

              {/* Trust Badges Row */}
              <div className="showcase-perks-row">
                <div className="showcase-perk">
                  <TruckIcon size={16} />
                  <span>Free Shipping ₹499+</span>
                </div>
                <div className="showcase-perk">
                  <ShieldIcon size={16} />
                  <span>100% Genuine Items</span>
                </div>
                <div className="showcase-perk">
                  <CreditCardIcon size={16} />
                  <span>Razorpay Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Form */}
          <div className="auth-form-panel">
            <div className="auth-panel-header">
              <div className="auth-brand-badge-inline">
                <div className="brand-badge-icon">
                  <CartIcon size={18} />
                </div>
                <span className="brand-badge-text">
                  ShopKart <strong>Storefront</strong>
                </span>
              </div>

              <span className="auth-eyebrow-pill">Customer Portal</span>
              <h1 className="auth-main-title">Welcome Back</h1>
              <p className="auth-main-subtitle">
                Sign in to manage your orders, saved items, and fast Razorpay checkout.
              </p>
            </div>

            {/* Value Perks Mini-Strip */}
            <div className="auth-perks-strip">
              <div className="auth-perk-item">
                <TruckIcon size={14} />
                <span>Free Delivery ₹499+</span>
              </div>
              <div className="auth-perk-dot">•</div>
              <div className="auth-perk-item">
                <ShieldIcon size={14} />
                <span>256-Bit SSL</span>
              </div>
              <div className="auth-perk-dot">•</div>
              <div className="auth-perk-item">
                <CreditCardIcon size={14} />
                <span>Razorpay Active</span>
              </div>
            </div>

            {successMessage && (
              <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
                <CheckIcon size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} noValidate className="storefront-auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">✉️</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={form.email}
                    onChange={onChange}
                    className="form-input with-left-icon"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>
                </div>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <LockIcon size={16} />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={onChange}
                    className="form-input with-left-icon with-right-btn"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="input-eye-btn"
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-auth-primary">
                {loading ? (
                  <span className="loading-inline">
                    <span className="spinner-sm"></span> Signing In...
                  </span>
                ) : (
                  <>
                    <span>Sign In to ShopKart</span>
                    <ArrowRightIcon size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <span>Don't have an account yet?</span>{' '}
              <Link to="/register" className="auth-switch-link">
                Create an Account →
              </Link>
            </div>

            <div className="auth-security-note">
              <ShieldIcon size={15} />
              <span>Secured with JWT HttpOnly Authentication & Cookie Sessions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
