import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TruckIcon,
  ShieldIcon,
  RefreshIcon,
  HeadphonesIcon,
  CartIcon,
  ArrowRightIcon,
  CheckIcon,
} from './Icons';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3500);
    }
  };

  return (
    <footer className="storefront-footer">
      {/* Trust & Value Pillars */}
      <div className="storefront-perks-banner">
        <div className="storefront-container perks-grid">
          <div className="perk-box">
            <div className="perk-icon-wrapper">
              <TruckIcon size={22} className="perk-icon-svg" />
            </div>
            <div className="perk-text">
              <h4>Free Standard Delivery</h4>
              <p>On all orders over ₹499 across India</p>
            </div>
          </div>

          <div className="perk-box">
            <div className="perk-icon-wrapper">
              <ShieldIcon size={22} className="perk-icon-svg" />
            </div>
            <div className="perk-text">
              <h4>100% Secure Checkout</h4>
              <p>256-bit encrypted Razorpay payment</p>
            </div>
          </div>

          <div className="perk-box">
            <div className="perk-icon-wrapper">
              <RefreshIcon size={22} className="perk-icon-svg" />
            </div>
            <div className="perk-text">
              <h4>30-Day Easy Returns</h4>
              <p>Hassle-free replacement guarantee</p>
            </div>
          </div>

          <div className="perk-box">
            <div className="perk-icon-wrapper">
              <HeadphonesIcon size={22} className="perk-icon-svg" />
            </div>
            <div className="perk-text">
              <h4>24/7 Dedicated Support</h4>
              <p>Friendly expert support anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="storefront-container footer-main-content">
        <div className="footer-cols-grid">
          {/* Brand Col */}
          <div className="footer-col brand-col">
            <Link to="/home" className="footer-brand-logo">
              <CartIcon size={24} className="footer-logo-svg" />
              <span>ShopKart</span>
            </Link>
            <p className="footer-brand-desc">
              Curated technology, modern fashion, and premium living essentials designed for elevated everyday life.
            </p>
            <div className="footer-social-icons">
              <span className="social-pill" title="Secure Platform">
                <ShieldIcon size={14} /> Verified Store
              </span>
              <span className="social-pill" title="Razorpay Enabled">
                💳 Razorpay Active
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Shop & Explore</h4>
            <ul className="footer-links-list">
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/products?category=Electronics">Electronics & Tech</Link></li>
              <li><Link to="/products?category=Fashion">Apparel & Fashion</Link></li>
              <li><Link to="/products?category=Home">Home & Living</Link></li>
              <li><Link to="/products?category=Books">Books & Knowledge</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="footer-col">
            <h4 className="footer-heading">Account & Orders</h4>
            <ul className="footer-links-list">
              <li><Link to="/home">Account Dashboard</Link></li>
              <li><Link to="/orders">Order History & Tracking</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/cart">Shopping Bag</Link></li>
              <li><Link to="/checkout">Fast Checkout</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-heading">Stay in the Loop</h4>
            <p className="newsletter-text">
              Subscribe to receive updates on curated drops, member discounts, and flash sales.
            </p>
            {subscribed ? (
              <div className="newsletter-success-box">
                <CheckIcon size={18} />
                <span>You're subscribed! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="newsletter-input"
                />
                <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
                  <ArrowRightIcon size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copy">
            © {new Date().getFullYear()} ShopKart Inc. Crafted with modern e-commerce storefront standards.
          </p>
          <div className="footer-legal-links">
            <a href="#privacy">Privacy Policy</a>
            <span>•</span>
            <a href="#terms">Terms of Service</a>
            <span>•</span>
            <a href="#shipping">Shipping & Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
