import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    error,
    actionLoadingId,
    totalItems,
    subtotal,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
  } = useCart();

  const [notification, setNotification] = useState('');

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    const res = await updateQuantity(productId, newQuantity);
    if (!res.success) {
      showNotification(res.message || 'Unable to update quantity.');
    }
  };

  const handleRemove = async (productId) => {
    const res = await removeFromCart(productId);
    if (res.success) {
      showNotification('Item removed from shopping bag');
    } else {
      showNotification(res.message || 'Unable to remove item.');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to empty your shopping bag?')) {
      const res = await clearCart();
      if (res.success) {
        showNotification('Shopping bag cleared');
      }
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="storefront-cart-page">
        <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p>Loading your shopping bag...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="storefront-cart-page">
        <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
          <div className="state-container error-state">
            <div className="state-icon">⚠️</div>
            <h2>Unable to load your shopping bag</h2>
            <p>{error}</p>
            <button type="button" onClick={fetchCart} className="btn-retry">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="storefront-cart-page">
        <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
          <div className="state-container empty-cart-state">
            <div className="empty-cart-icon">🛍️</div>
            <h2>Your Shopping Bag is Empty</h2>
            <p>Explore our curated collections and discover items you love.</p>
            <Link to="/products" className="btn-browse-empty">
              Explore Catalog Now →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="storefront-cart-page">
      <div className="storefront-container">
        {/* Header Block */}
        <div className="cart-header-row">
          <div>
            <div className="catalog-breadcrumbs">
              <Link to="/home">Home</Link>
              <span>/</span>
              <span className="current-crumb">Shopping Bag</span>
            </div>
            <h1 className="cart-main-title">Shopping Bag</h1>
            <p className="cart-subtitle-text">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} ready for checkout
            </p>
          </div>
          <Link to="/products" className="btn-continue-shopping-pill">
            ← Continue Shopping
          </Link>
        </div>

        {notification && (
          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <span>ℹ️</span>
            <span>{notification}</span>
          </div>
        )}

        {/* 2-Column Cart Layout */}
        <div className="storefront-cart-layout">
          {/* Left Column: Items List */}
          <div className="cart-items-column">
            <div className="cart-items-list-card">
              <div className="items-card-header">
                <span>Product</span>
                <span>Quantity</span>
                <span>Subtotal</span>
              </div>

              <div className="items-card-body">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.product?._id || item._id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                    isUpdating={actionLoadingId === item.product?._id}
                  />
                ))}
              </div>

              <div className="items-card-footer">
                <button
                  type="button"
                  onClick={handleClearCart}
                  className="btn-clear-bag-subtle"
                >
                  Empty Entire Bag
                </button>
                <Link to="/products" className="link-browse-more">
                  + Add more products
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary Sidebar */}
          <div className="cart-summary-column">
            <div className="storefront-summary-card">
              <h2 className="summary-card-title">Order Summary</h2>

              <div className="summary-breakdown-list">
                <div className="summary-breakdown-row">
                  <span className="breakdown-label">Total Units</span>
                  <span className="breakdown-val">{totalItems} units</span>
                </div>
                <div className="summary-breakdown-row">
                  <span className="breakdown-label">Bag Subtotal</span>
                  <span className="breakdown-val">
                    ₹{Number(subtotal).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="summary-breakdown-row">
                  <span className="breakdown-label">Standard Shipping</span>
                  <span className="breakdown-val text-shipping-free">FREE</span>
                </div>
                <div className="summary-divider-line"></div>
                <div className="summary-breakdown-row total-row">
                  <span className="total-label">Estimated Total</span>
                  <span className="total-amount-display">
                    ₹{Number(subtotal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="btn-checkout-primary"
              >
                Proceed to Checkout →
              </button>

              <div className="summary-trust-perks">
                <div className="trust-perk-item">
                  <span>🔒</span>
                  <span>256-Bit SSL Encrypted Razorpay Checkout</span>
                </div>
                <div className="trust-perk-item">
                  <span>🚚</span>
                  <span>Free Express Delivery across India</span>
                </div>
                <div className="trust-perk-item">
                  <span>↩️</span>
                  <span>Hassle-Free 30-Day Return Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
