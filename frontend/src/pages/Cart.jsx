import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import {
  CartIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldIcon,
  TruckIcon,
  RefreshIcon,
  CheckIcon,
} from '../components/Icons';

const FREE_SHIPPING_THRESHOLD = 499;

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
            <div className="empty-cart-icon">
              <CartIcon size={48} />
            </div>
            <h2>Your Shopping Bag is Empty</h2>
            <p>Explore our curated collections and discover items you love.</p>
            <Link to="/products" className="btn-browse-empty">
              <span>Explore Catalog Now</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const freeShippingProgress = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

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
            <ArrowLeftIcon size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Free Shipping Progress Strip (Conversion Booster) */}
        <div className="shipping-progress-banner">
          <div className="progress-banner-text">
            {amountNeededForFreeShipping === 0 ? (
              <span className="free-shipping-unlocked">
                <CheckIcon size={16} />
                <strong>Free Standard Delivery Unlocked!</strong> You qualify for free shipping across India.
              </span>
            ) : (
              <span>
                Add <strong>₹{amountNeededForFreeShipping.toLocaleString('en-IN')}</strong> more to unlock <strong>FREE Standard Delivery</strong>!
              </span>
            )}
          </div>
          <div className="progress-bar-track">
            <div
              className={`progress-bar-fill ${amountNeededForFreeShipping === 0 ? 'fill-complete' : ''}`}
              style={{ width: `${freeShippingProgress}%` }}
            ></div>
          </div>
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
                  <span className="breakdown-val text-shipping-free">
                    {amountNeededForFreeShipping === 0 ? 'FREE' : '₹99'}
                  </span>
                </div>
                <div className="summary-divider-line"></div>
                <div className="summary-breakdown-row total-row">
                  <span className="total-label">Estimated Total</span>
                  <span className="total-amount-display">
                    ₹{Number(subtotal + (amountNeededForFreeShipping === 0 ? 0 : 99)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="btn-checkout-primary"
              >
                <span>Proceed to Checkout</span>
                <ArrowRightIcon size={16} />
              </button>

              <div className="summary-trust-perks">
                <div className="trust-perk-item">
                  <ShieldIcon size={16} />
                  <span>256-Bit SSL Encrypted Razorpay Checkout</span>
                </div>
                <div className="trust-perk-item">
                  <TruckIcon size={16} />
                  <span>Express Dispatch across all pin codes in India</span>
                </div>
                <div className="trust-perk-item">
                  <RefreshIcon size={16} />
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
