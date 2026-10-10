import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

const CATEGORY_SHOWCASE = [
  {
    name: 'Electronics',
    img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=260&auto=format&fit=crop',
    subtitle: 'Gadgets & Tech',
  },
  {
    name: 'Fashion',
    img: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=260&auto=format&fit=crop',
    subtitle: 'Apparel & Style',
  },
  {
    name: 'Home',
    img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=260&auto=format&fit=crop',
    subtitle: 'Living & Comfort',
  },
  {
    name: 'Books',
    img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=260&auto=format&fit=crop',
    subtitle: 'Knowledge & Reads',
  },
  {
    name: 'Audio',
    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=260&auto=format&fit=crop',
    subtitle: 'Headphones & Gear',
  },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Password change state (Lab 01/02 Bonus)
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ error: '', success: '' });
  const [pwdLoading, setPwdLoading] = useState(false);

  const navigate = useNavigate();

  // 1. Fetch authenticated user profile
  useEffect(() => {
    let mounted = true;
    api
      .get('/customers/me')
      .then((res) => {
        if (mounted) {
          setUser(res.data);
        }
      })
      .catch(() => {
        if (mounted) {
          // If not logged in -> redirect to login
          navigate('/login', { replace: true });
        }
      });

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // 2. Fetch Wishlist to mark saved products
  useEffect(() => {
    let mounted = true;
    api
      .get('/wishlist')
      .then((res) => {
        if (mounted && res.data?.wishlist) {
          setWishlistIds(new Set(res.data.wishlist.map((item) => item._id)));
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  // 3. Fetch products from backend for Trending Section
  useEffect(() => {
    let mounted = true;
    setLoadingProducts(true);

    const params = {};
    if (selectedCategory !== 'All') {
      params.category = selectedCategory;
    }

    api
      .get('/products', { params })
      .then((res) => {
        if (mounted) {
          setTrendingProducts(res.data?.products || []);
          setLoadingProducts(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Fetch trending products error:', err);
          setLoadingProducts(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [selectedCategory]);

  // Handle password change submission
  const handlePasswordSubmit = async (e) => {
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
        success: res.data?.message || 'Password updated successfully!',
      });
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setPwdMsg({
        error: err.response?.data?.message || 'Failed to update password',
        success: '',
      });
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="storefront-home-page">
      {/* Hero Showcase Section */}
      <section className="storefront-hero-banner">
        <div className="storefront-container hero-inner-grid">
          <div className="hero-content-col">
            <div className="hero-pill-badge">
              <span>🚀 2026 Collection Live</span>
            </div>
            <h1 className="hero-headline">
              Curated Essentials for <span>Modern Living</span>
            </h1>
            <p className="hero-subtext">
              Discover verified quality electronics, lifestyle gear, and smart essentials. Enjoy instant checkout with Razorpay and free nationwide shipping.
            </p>
            <div className="hero-cta-group">
              <a href="#trending-section" className="btn-hero-primary">
                🔥 Explore Trending
              </a>
              <Link to="/products" className="btn-hero-secondary">
                📦 All Products →
              </Link>
            </div>

            {/* Quick stats banner */}
            <div className="hero-stats-row">
              <div className="stat-item">
                <span className="stat-number">10k+</span>
                <span className="stat-label">Happy Shoppers</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">100%</span>
                <span className="stat-label">Genuine Items</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Customer Care</span>
              </div>
            </div>
          </div>

          <div className="hero-visual-col">
            <div className="hero-image-frame">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=900&auto=format&fit=crop"
                alt="Storefront Hero"
                className="hero-main-visual"
              />
              <div className="floating-hero-card">
                <div className="floating-card-icon">⚡</div>
                <div>
                  <span className="floating-card-title">Flash Offer Active</span>
                  <span className="floating-card-sub">Extra 15% off on Electronics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Category Circles Showcase */}
      <section className="storefront-categories-strip">
        <div className="storefront-container">
          <div className="section-header-row">
            <div>
              <h2 className="section-title-clean">Explore Top Categories</h2>
              <p className="section-subtitle-clean">Browse our top selected departments</p>
            </div>
            <Link to="/products" className="link-view-all">
              View All Categories →
            </Link>
          </div>

          <div className="categories-circles-grid">
            {CATEGORY_SHOWCASE.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${cat.name}`}
                className="category-circle-card group"
              >
                <div className="circle-image-wrapper">
                  <img src={cat.img} alt={cat.name} className="circle-img" />
                </div>
                <span className="category-circle-name">{cat.name}</span>
                <span className="category-circle-subtitle">{cat.subtitle}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Now Section with Live Products */}
      <section id="trending-section" className="storefront-trending-section">
        <div className="storefront-container">
          <div className="trending-header-row">
            <div>
              <span className="trending-eyebrow">🔥 Handpicked Highlights</span>
              <h2 className="section-title-clean">Trending Now</h2>
            </div>

            {/* Filter Tabs */}
            <div className="trending-tabs-pill-list">
              {['All', 'Electronics', 'Fashion', 'Home', 'Books'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSelectedCategory(tab)}
                  className={`tab-pill-btn ${selectedCategory === tab ? 'tab-pill-active' : ''}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {loadingProducts ? (
            <div className="state-container loading-state">
              <div className="spinner"></div>
              <p>Curating trending items...</p>
            </div>
          ) : trendingProducts.length === 0 ? (
            <div className="state-container empty-state">
              <div className="state-icon">🛍️</div>
              <h3>No items found in {selectedCategory}</h3>
              <p>Explore other categories or view all products in the catalog.</p>
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                className="btn-retry"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="storefront-products-grid">
              {trendingProducts.slice(0, 8).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  initialWishlisted={wishlistIds.has(product._id)}
                  onWishlistChange={(id, isSaved) => {
                    setWishlistIds((prev) => {
                      const updated = new Set(prev);
                      if (isSaved) updated.add(id);
                      else updated.delete(id);
                      return updated;
                    });
                  }}
                />
              ))}
            </div>
          )}

          <div className="trending-bottom-cta">
            <Link to="/products" className="btn-explore-catalog-wide">
              Explore All Products in Catalog →
            </Link>
          </div>
        </div>
      </section>

      {/* Authenticated Customer Account Hub (Lab 01 & 02 Integration) */}
      {user && (
        <section className="storefront-account-hub">
          <div className="storefront-container">
            <div className="account-hub-card">
              <div className="account-hub-header">
                <div>
                  <h3 className="hub-greeting">Welcome back, {user.fullName}! 👋</h3>
                  <p className="hub-email">Logged in as {user.email} (📞 {user.phone})</p>
                </div>
                <div className="hub-quick-buttons">
                  <Link to="/orders" className="btn-hub-action">
                    📦 My Orders
                  </Link>
                  <Link to="/wishlist" className="btn-hub-action">
                    ❤️ Wishlist
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="btn-hub-action"
                  >
                    🔒 {showPasswordForm ? 'Hide Password Form' : 'Change Password'}
                  </button>
                </div>
              </div>

              {/* Collapsible Change Password Box */}
              {showPasswordForm && (
                <div className="hub-password-box">
                  <h4 className="password-box-title">Change Account Password</h4>
                  <p className="password-box-desc">Update your login password securely</p>

                  {pwdMsg.success && (
                    <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
                      <span>✅</span>
                      <span>{pwdMsg.success}</span>
                    </div>
                  )}

                  {pwdMsg.error && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                      <span>⚠️</span>
                      <span>{pwdMsg.error}</span>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="hub-password-form">
                    <div className="form-group">
                      <label className="form-label" htmlFor="oldPassword">
                        Current Password
                      </label>
                      <input
                        id="oldPassword"
                        name="oldPassword"
                        type="password"
                        placeholder="Current password"
                        value={passwords.oldPassword}
                        onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="newPassword">
                        New Password (min 6 characters)
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="New password"
                        value={passwords.newPassword}
                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    <button type="submit" disabled={pwdLoading} className="btn-hub-submit">
                      {pwdLoading ? 'Updating Password...' : 'Save New Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
