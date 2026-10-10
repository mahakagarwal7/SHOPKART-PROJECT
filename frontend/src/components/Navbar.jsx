import React, { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch current customer profile if authenticated
  useEffect(() => {
    let mounted = true;
    api
      .get('/customers/me')
      .then((res) => {
        if (mounted && res.data) {
          setCurrentUser(res.data);
        }
      })
      .catch(() => {
        if (mounted) setCurrentUser(null);
      });

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  // Fetch dynamic wishlist count
  useEffect(() => {
    let mounted = true;
    api
      .get('/wishlist/count')
      .then((res) => {
        if (mounted && res.data?.success && typeof res.data.count === 'number') {
          setWishlistCount(res.data.count);
        }
      })
      .catch(() => {
        if (mounted) setWishlistCount(0);
      });

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  // Close account dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setCurrentUser(null);
      setAccountMenuOpen(false);
      navigate('/login');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // User avatar initials
  const initials = currentUser?.fullName
    ? currentUser.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      {/* Preline Top Announcement Strip */}
      <div className="storefront-announcement-bar">
        <div className="storefront-container announcement-content">
          <span>✨ <strong>Exclusive Storefront:</strong> Free standard shipping across India on orders over ₹499</span>
          <span className="announcement-badge">Razorpay Test Mode Active</span>
        </div>
      </div>

      {/* Main Preline Storefront Header */}
      <header className="storefront-navbar">
        <div className="storefront-container navbar-inner">
          {/* Brand Logo */}
          <Link to="/home" className="storefront-logo">
            <span className="logo-icon-box">🛒</span>
            <div className="logo-text-group">
              <span className="logo-title">ShopKart</span>
              <span className="logo-subtitle">Storefront</span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="storefront-nav-links">
            <NavLink
              to="/home"
              className={({ isActive }) =>
                isActive ? 'storefront-nav-item active' : 'storefront-nav-item'
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) =>
                isActive ? 'storefront-nav-item active' : 'storefront-nav-item'
              }
            >
              Catalog
            </NavLink>
            <NavLink
              to="/wishlist"
              className={({ isActive }) =>
                isActive ? 'storefront-nav-item active' : 'storefront-nav-item'
              }
            >
              Wishlist
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                isActive ? 'storefront-nav-item active' : 'storefront-nav-item'
              }
            >
              Orders
            </NavLink>
          </nav>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="storefront-search-form">
            <div className="search-input-pill">
              <span className="search-pill-icon">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands..."
                className="search-pill-input"
              />
            </div>
          </form>

          {/* Right Action Icons Group */}
          <div className="storefront-actions-group">
            {/* Wishlist Icon Button with Badge */}
            <Link
              to="/wishlist"
              className="action-icon-btn"
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <span className="icon-symbol">🤍</span>
              {wishlistCount > 0 && (
                <span className="action-counter-pill counter-red">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart Icon Button with Badge */}
            <Link
              to="/cart"
              className="action-icon-btn cart-btn-action"
              title="View Cart"
              aria-label="Cart"
            >
              <span className="icon-symbol">🛍️</span>
              {totalItems > 0 && (
                <span className="action-counter-pill counter-blue">{totalItems}</span>
              )}
            </Link>

            {/* Account / User Profile Dropdown */}
            {currentUser ? (
              <div className="account-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                  className="account-avatar-btn"
                  title="My Account"
                  aria-expanded={accountMenuOpen}
                >
                  <span className="avatar-initials">{initials}</span>
                </button>

                {accountMenuOpen && (
                  <div className="account-dropdown-card">
                    <div className="account-user-meta">
                      <span className="user-name">{currentUser.fullName}</span>
                      <span className="user-email">{currentUser.email}</span>
                      <span className="customer-status-tag">Verified Customer</span>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div className="account-menu-links">
                      <Link
                        to="/home"
                        onClick={() => setAccountMenuOpen(false)}
                        className="menu-item"
                      >
                        👤 Account Dashboard
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="menu-item"
                      >
                        📦 My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setAccountMenuOpen(false)}
                        className="menu-item"
                      >
                        ❤️ Saved Items
                      </Link>
                    </div>

                    <div className="dropdown-divider"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="menu-item menu-logout"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-action-buttons">
                <Link to="/login" className="btn-header-login">
                  Sign In
                </Link>
                <Link to="/register" className="btn-header-register">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
