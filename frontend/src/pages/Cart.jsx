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
  const [checkoutNotice, setCheckoutNotice] = useState(false);

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
      showNotification('Item removed from cart');
    } else {
      showNotification(res.message || 'Unable to remove item.');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to empty your shopping cart?')) {
      const res = await clearCart();
      if (res.success) {
        showNotification('Shopping cart cleared');
      }
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-page-wrapper">
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page-wrapper">
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <h2>Unable to load your cart.</h2>
          <p>{error}</p>
          <button type="button" onClick={fetchCart} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page-wrapper">
        <div className="state-container empty-cart-state">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="btn-browse-empty">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-wrapper">
      <div className="cart-header">
        <div>
          <h1 className="cart-title">My Cart</h1>
          <p className="cart-subtitle">
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Link to="/products" className="btn-continue-shopping">
          ← Continue Shopping
        </Link>
      </div>

      {notification && (
        <div className="alert alert-info">
          <span>ℹ️</span>
          <span>{notification}</span>
        </div>
      )}

      {checkoutNotice && (
        <div className="alert alert-success">
          <span>🎉</span>
          <span>Checkout & Order Creation will be introduced in Lab-06! Your cart is persisted and ready.</span>
        </div>
      )}

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="cart-items-section">
          <div className="cart-items-list">
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

          <div className="cart-items-footer">
            <button
              type="button"
              onClick={handleClearCart}
              className="btn-clear-cart"
            >
              Empty Cart
            </button>
            <Link to="/products" className="link-add-more">
              + Add more items
            </Link>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="cart-summary-section">
          <div className="order-summary-card">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Total Items</span>
                <span className="summary-val">{totalItems} units</span>
              </div>
              <div className="summary-row">
                <span>Subtotal</span>
                <span className="summary-val">
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="summary-val text-free">FREE</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span>Order Total</span>
                <span className="summary-total-val">
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="btn-proceed-checkout"
            >
              Proceed to Checkout →
            </button>

            <div className="summary-perks">
              <div className="perk-item">
                <span>🔒</span>
                <span>Secure 256-bit SSL encrypted checkout</span>
              </div>
              <div className="perk-item">
                <span>🚚</span>
                <span>Free delivery on all orders</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
