import React, { useEffect, useState, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import {
  CartIcon,
  HeartIcon,
  SearchIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  PackageIcon,
  LockIcon,
} from './Icons';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close menus when route changes
  useEffect(() => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
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
      {/* Main Storefront Header */}
      <header className="storefront-navbar">
        <div className="storefront-container navbar-inner">
          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon size={22} /> : <MenuIcon size={22} />}
          </button>

          {/* Brand Logo */}
          <Link to="/home" className="storefront-logo">
            <div className="logo-icon-box">
              <CartIcon size={20} className="logo-cart-svg" />
            </div>
            <div className="logo-text-group">
              <span className="logo-title">ShopKart</span>
              <span className="logo-subtitle">CURATED STORE</span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
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
              <SearchIcon size={16} className="search-pill-icon" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="search-pill-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="search-clear-btn"
                  title="Clear search"
                >
                  <CloseIcon size={14} />
                </button>
              )}
            </div>
          </form>

          {/* Right Action Icons Group */}
          <div className="storefront-actions-group">
            {/* Wishlist Icon Button with Animated Badge */}
            <Link
              to="/wishlist"
              className="action-icon-btn"
              title="View Wishlist"
              aria-label="Wishlist"
            >
              <HeartIcon size={20} className="action-icon-svg" />
              {wishlistCount > 0 && (
                <span className="action-counter-pill counter-red">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart Icon Button with Animated Badge */}
            <Link
              to="/cart"
              className="action-icon-btn cart-btn-action"
              title="View Shopping Bag"
              aria-label="Shopping Bag"
            >
              <CartIcon size={20} className="action-icon-svg" />
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
                      <span className="customer-status-tag">Verified Member</span>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div className="account-menu-links">
                      <Link
                        to="/home"
                        onClick={() => setAccountMenuOpen(false)}
                        className="menu-item"
                      >
                        <UserIcon size={16} /> Account Dashboard
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="menu-item"
                      >
                        <PackageIcon size={16} /> My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        onClick={() => setAccountMenuOpen(false)}
                        className="menu-item"
                      >
                        <HeartIcon size={16} /> Saved Items
                      </Link>
                    </div>

                    <div className="dropdown-divider"></div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="menu-item menu-logout"
                    >
                      <LockIcon size={16} /> Sign Out
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

        {/* Mobile Slide-Down Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <div className="mobile-drawer-inner">
              <form onSubmit={handleSearchSubmit} className="mobile-search-form">
                <div className="search-input-pill">
                  <SearchIcon size={16} className="search-pill-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    className="search-pill-input"
                  />
                </div>
              </form>

              <div className="mobile-drawer-links">
                <NavLink
                  to="/home"
                  className={({ isActive }) =>
                    isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/products"
                  className={({ isActive }) =>
                    isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                  }
                >
                  Catalog
                </NavLink>
                <NavLink
                  to="/wishlist"
                  className={({ isActive }) =>
                    isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                  }
                >
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </NavLink>
                <NavLink
                  to="/orders"
                  className={({ isActive }) =>
                    isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                  }
                >
                  Orders
                </NavLink>
                <NavLink
                  to="/cart"
                  className={({ isActive }) =>
                    isActive ? 'mobile-nav-link active' : 'mobile-nav-link'
                  }
                >
                  Shopping Bag {totalItems > 0 && `(${totalItems})`}
                </NavLink>
              </div>

              {currentUser ? (
                <div className="mobile-drawer-user-section">
                  <div className="mobile-user-info">
                    <span className="user-name">{currentUser.fullName}</span>
                    <span className="user-email">{currentUser.email}</span>
                  </div>
                  <button type="button" onClick={handleLogout} className="btn-mobile-logout">
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="mobile-drawer-auth-buttons">
                  <Link to="/login" className="btn-header-login" style={{ textAlign: 'center' }}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-header-register" style={{ textAlign: 'center' }}>
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
