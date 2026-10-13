import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
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

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  // Auto redirect countdown timer when registration succeeds
  useEffect(() => {
    let timer;
    if (registeredSuccess) {
      if (countdown > 0) {
        timer = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 1000);
      } else {
        navigate('/login', {
          state: {
            message: 'Account registered successfully! Please sign in.',
            email: registeredSuccess.email,
          },
        });
      }
    }
    return () => clearTimeout(timer);
  }, [registeredSuccess, countdown, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName || !form.email || !form.password || !form.phone) {
      setError('Please fill in all required fields.');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/customers/register', form);
      // Trigger success popup
      setRegisteredSuccess({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
      });
      setCountdown(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
              src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop"
              alt="ShopKart Membership"
              className="showcase-bg-image"
            />

            <div className="showcase-inner-content">
              {/* Brand Pill */}
              <div className="showcase-badge">
                <span className="badge-sparkle">🚀</span>
                <span>Exclusive Member Perks</span>
              </div>

              <h2 className="showcase-headline">
                Unlock Premium Living with <span>ShopKart Membership</span>
              </h2>

              <p className="showcase-description">
                Create your account to unlock private collection drops, track real-time delivery timelines, and access one-tap Razorpay checkout.
              </p>

              {/* Membership Benefits List Card */}
              <div className="showcase-testimonial-card">
                <div className="showcase-perks-vertical">
                  <div className="perk-vertical-item">
                    <div className="perk-circle-icon"><CheckIcon size={14} /></div>
                    <div>
                      <strong>Free Express Delivery:</strong>
                      <p>Enjoy free shipping across all 19,000+ Indian pincodes over ₹499.</p>
                    </div>
                  </div>
                  <div className="perk-vertical-item">
                    <div className="perk-circle-icon"><CheckIcon size={14} /></div>
                    <div>
                      <strong>Saved Wishlist & History:</strong>
                      <p>Save curated gear and reorder essentials in seconds.</p>
                    </div>
                  </div>
                  <div className="perk-vertical-item">
                    <div className="perk-circle-icon"><CheckIcon size={14} /></div>
                    <div>
                      <strong>Instant Refunds & Returns:</strong>
                      <p>30-day hassle-free replacement on all catalog orders.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trust Badges Row */}
              <div className="showcase-perks-row">
                <div className="showcase-perk">
                  <TruckIcon size={16} />
                  <span>Pan-India Dispatch</span>
                </div>
                <div className="showcase-perk">
                  <ShieldIcon size={16} />
                  <span>SSL Protected</span>
                </div>
                <div className="showcase-perk">
                  <CreditCardIcon size={16} />
                  <span>Razorpay Verified</span>
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

              <span className="auth-eyebrow-pill">New Customer</span>
              <h1 className="auth-main-title">Create Account</h1>
              <p className="auth-main-subtitle">
                Join ShopKart to explore curated collections, save items, and order easily.
              </p>
            </div>

            {/* Value Perks Mini-Strip */}
            <div className="auth-perks-strip">
              <div className="auth-perk-item">
                <TruckIcon size={14} />
                <span>Express Delivery</span>
              </div>
              <div className="auth-perk-dot">•</div>
              <div className="auth-perk-item">
                <ShieldIcon size={14} />
                <span>SSL Protected</span>
              </div>
              <div className="auth-perk-dot">•</div>
              <div className="auth-perk-item">
                <CreditCardIcon size={14} />
                <span>Instant Setup</span>
              </div>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} noValidate className="storefront-auth-form">
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <UserIcon size={16} />
                  </span>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    value={form.fullName}
                    onChange={onChange}
                    className="form-input with-left-icon"
                    required
                  />
                </div>
              </div>

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
                    placeholder="e.g. aarav@example.com"
                    value={form.email}
                    onChange={onChange}
                    className="form-input with-left-icon"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password (min 6 characters)
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">
                    <LockIcon size={16} />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
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
                <span className="form-hint-clean">Must be at least 6 characters</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number
                </label>
                <div className="input-with-icon">
                  <span className="input-icon">📞</span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={onChange}
                    className="form-input with-left-icon"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-auth-primary">
                {loading ? (
                  <span className="loading-inline">
                    <span className="spinner-sm"></span> Creating Account...
                  </span>
                ) : (
                  <>
                    <span>Create Account & Start Shopping</span>
                    <ArrowRightIcon size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-card-footer">
              <span>Already have an account?</span>{' '}
              <Link to="/login" className="auth-switch-link">
                Sign In Instead →
              </Link>
            </div>

            <div className="auth-security-note">
              <ShieldIcon size={15} />
              <span>By registering, you agree to ShopKart's Terms of Service and Privacy Policy.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Success Popup Modal */}
      {registeredSuccess && (
        <div className="modal-backdrop">
          <div className="modal-card auth-success-modal">
            <div className="modal-success-badge">
              <CheckIcon size={38} />
            </div>
            <h2 className="modal-success-title">Account Created Successfully! 🎉</h2>
            <p className="modal-success-sub">
              Welcome to ShopKart, <strong>{registeredSuccess.fullName}</strong>!
            </p>
            <p className="modal-success-email">
              Your account with <strong>{registeredSuccess.email}</strong> is ready.
            </p>

            <div className="modal-countdown-badge">
              <span className="countdown-pulse-dot"></span>
              <span>Redirecting to Sign In in <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}...</span>
            </div>

            <div className="modal-actions" style={{ marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn-modal-login-now"
                onClick={() =>
                  navigate('/login', {
                    state: {
                      message: 'Account registered successfully! Please sign in with your password.',
                      email: registeredSuccess.email,
                    },
                  })
                }
              >
                <span>Go to Sign In Now</span>
                <ArrowRightIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
