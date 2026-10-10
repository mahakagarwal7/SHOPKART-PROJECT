import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="storefront-footer">
      {/* Trust & Value Pillars */}
      <div className="storefront-perks-banner">
        <div className="storefront-container perks-grid">
          <div className="perk-box">
            <div className="perk-icon">🚚</div>
            <div className="perk-text">
              <h4>Free Standard Delivery</h4>
              <p>On all prepaid orders across India</p>
            </div>
          </div>
          <div className="perk-box">
            <div className="perk-icon">🔒</div>
            <div className="perk-text">
              <h4>Secure Payment</h4>
              <p>256-bit encrypted Razorpay checkout</p>
            </div>
          </div>
          <div className="perk-box">
            <div className="perk-icon">↩️</div>
            <div className="perk-text">
              <h4>30-Day Easy Returns</h4>
              <p>Hassle-free replacement guarantee</p>
            </div>
          </div>
          <div className="perk-box">
            <div className="perk-icon">🎧</div>
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
              🛒 <span>ShopKart</span>
            </Link>
            <p className="footer-brand-desc">
              Your destination for curated technology, modern fashion, and premium lifestyle essentials. Built for exceptional customer experiences.
            </p>
            <div className="footer-social-icons">
              <span className="social-pill" title="Secure Platform">🛡️ Verified Store</span>
              <span className="social-pill" title="Razorpay Enabled">💳 Razorpay Test</span>
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
              <li><Link to="/products?category=Books">Books & Media</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="footer-col">
            <h4 className="footer-heading">Account & Orders</h4>
            <ul className="footer-links-list">
              <li><Link to="/home">My Profile</Link></li>
              <li><Link to="/orders">Order History</Link></li>
              <li><Link to="/wishlist">Saved Wishlist</Link></li>
              <li><Link to="/cart">Shopping Bag</Link></li>
              <li><Link to="/checkout">Fast Checkout</Link></li>
            </ul>
          </div>

          {/* Newsletter Box */}
          <div className="footer-col newsletter-col">
            <h4 className="footer-heading">Stay in the Loop</h4>
            <p className="newsletter-text">
              Subscribe to receive updates on new product drops, exclusive promotions, and flash sales.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed to ShopKart newsletter!'); }} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-submit-btn">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="footer-bottom-bar">
          <p className="footer-copy">
            © {new Date().getFullYear()} ShopKart Inc. Crafted with Preline UI Storefront aesthetics.
          </p>
          <div className="footer-legal-links">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Refund Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
