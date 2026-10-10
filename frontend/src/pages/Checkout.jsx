import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

// Step 9: Helper function to dynamically load Razorpay Checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, totalItems, subtotal, clearCart, loading: cartLoading } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [backendError, setBackendError] = useState('');
  const [offlineModalData, setOfflineModalData] = useState(null);

  // If cart is empty and not loading, redirect to /cart
  useEffect(() => {
    if (!cartLoading && (!cartItems || cartItems.length === 0)) {
      navigate('/cart', { replace: true });
    }
  }, [cartItems, cartLoading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else {
      const cleanPhone = formData.phone.trim().replace(/[\s\-\+]/g, '');
      if (!/^\d{10,15}$/.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid phone number (at least 10 digits).';
      }
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Street address is required.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required.';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required.';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must contain exactly 6 digits.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setBackendError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Pending ShopKart Order & Razorpay Order on the backend
      const res = await api.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      if (!res.data?.success) {
        setBackendError(res.data?.message || 'Unable to create order.');
        setIsSubmitting(false);
        return;
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = res.data;

      // 2. Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || !window.Razorpay) {
        // Fallback for offline environments or environments where Razorpay CDN is blocked
        setOfflineModalData({
          shopKartOrderId,
          razorpayOrderId,
          amount,
        });
        setIsSubmitting(false);
        return;
      }

      // 3. Open Razorpay Checkout modal
      const options = {
        key: key || 'rzp_test_ShopKartKeyId',
        amount,
        currency: currency || 'INR',
        name: 'ShopKart',
        description: `ShopKart Order #${shopKartOrderId.slice(-6)}`,
        order_id: razorpayOrderId,
        handler: async function (paymentResponse) {
          try {
            // 4. Send signature to backend for verification
            const verifyRes = await api.post('/orders/verify-payment', {
              shopKartOrderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              // 5. Clear global cart state and navigate to Order Confirmation
              await clearCart();
              navigate(`/order-success/${shopKartOrderId}`);
            } else {
              setBackendError(verifyRes.data?.message || 'Payment verification failed.');
              setIsSubmitting(false);
            }
          } catch (verifyErr) {
            console.error('Payment verification error:', verifyErr);
            setBackendError(
              verifyErr.response?.data?.message || 'Payment verification failed on the server.'
            );
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName.trim(),
          contact: formData.phone.trim(),
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on('payment.failed', function (failResponse) {
        console.error('Payment failed:', failResponse.error);
        setBackendError(
          failResponse.error?.description ||
            'Payment failed. Your cart has been preserved. Please try again.'
        );
        setIsSubmitting(false);
      });

      rzpInstance.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setBackendError(
        err.response?.data?.message || 'Failed to initialize checkout. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  // Helper for offline / lab mock verification
  const handleOfflineCompletePayment = async (success) => {
    if (!offlineModalData) return;
    setIsSubmitting(true);

    if (!success) {
      setBackendError('Test payment was cancelled or failed. Your cart has been preserved.');
      setOfflineModalData(null);
      setIsSubmitting(false);
      return;
    }

    try {
      const verifyRes = await api.post('/orders/verify-payment', {
        shopKartOrderId: offlineModalData.shopKartOrderId,
        razorpay_order_id: offlineModalData.razorpayOrderId,
        razorpay_payment_id: `pay_test_${Date.now().toString().slice(-6)}`,
        razorpay_signature: 'test_mock_signature',
      });

      if (verifyRes.data?.success) {
        await clearCart();
        navigate(`/order-success/${offlineModalData.shopKartOrderId}`);
      } else {
        setBackendError(verifyRes.data?.message || 'Payment verification failed');
      }
    } catch (err) {
      setBackendError(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsSubmitting(false);
      setOfflineModalData(null);
    }
  };

  if (cartLoading) {
    return (
      <div className="checkout-page-wrapper">
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Loading checkout details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page-wrapper">
      <div className="checkout-header">
        <Link to="/cart" className="btn-back-link">
          ← Back to Cart
        </Link>
        <h1 className="checkout-title">Checkout & Payment</h1>
        <p className="checkout-subtitle">Complete your shipping details to place your order</p>
      </div>

      {backendError && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <span>⚠️</span>
          <span>{backendError}</span>
        </div>
      )}

      <div className="checkout-layout">
        {/* Left Column: Shipping Address Form */}
        <div className="checkout-form-section">
          <div className="checkout-card">
            <h2 className="section-title">📍 Shipping Details</h2>

            <form onSubmit={handlePlaceOrder} noValidate className="shipping-form">
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name *
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav Sharma"
                  className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className={`form-input ${errors.phone ? 'input-error' : ''}`}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="addressLine1">
                  Street Address / Apartment *
                </label>
                <input
                  id="addressLine1"
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="e.g. Flat 402, Sunshine Heights, MG Road"
                  className={`form-input ${errors.addressLine1 ? 'input-error' : ''}`}
                />
                {errors.addressLine1 && (
                  <span className="field-error">{errors.addressLine1}</span>
                )}
              </div>

              <div className="form-row-three">
                <div className="form-group">
                  <label className="form-label" htmlFor="city">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Bengaluru"
                    className={`form-input ${errors.city ? 'input-error' : ''}`}
                  />
                  {errors.city && <span className="field-error">{errors.city}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="state">
                    State *
                  </label>
                  <input
                    id="state"
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="e.g. Karnataka"
                    className={`form-input ${errors.state ? 'input-error' : ''}`}
                  />
                  {errors.state && <span className="field-error">{errors.state}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="pincode">
                    Pincode (6 digits) *
                  </label>
                  <input
                    id="pincode"
                    type="text"
                    name="pincode"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 560001"
                    className={`form-input ${errors.pincode ? 'input-error' : ''}`}
                  />
                  {errors.pincode && <span className="field-error">{errors.pincode}</span>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-submit-order"
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-sm"></span> Processing Order...
                  </>
                ) : (
                  <>💳 Pay with Razorpay (₹{Number(subtotal).toLocaleString('en-IN')})</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary Review */}
        <div className="checkout-summary-section">
          <div className="checkout-summary-card">
            <h2 className="summary-title">Review Order ({totalItems} items)</h2>

            <div className="checkout-items-list">
              {cartItems.map((item) => (
                <div key={item.product?._id || item._id} className="checkout-item-row">
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="checkout-item-thumb"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/80x80?text=Product';
                    }}
                  />
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.product?.name}</span>
                    <span className="checkout-item-meta">
                      Qty: {item.quantity} × ₹{Number(item.product?.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="checkout-item-total">
                    ₹{Number((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{Number(subtotal).toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="text-free">FREE</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row summary-total">
                <span>Total Amount</span>
                <span className="summary-total-val">
                  ₹{Number(subtotal).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="checkout-security-badge">
              <span>🔒</span>
              <span>100% Secure Checkout powered by Razorpay Test Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Offline / Test Mode Modal fallback if Razorpay CDN script is blocked */}
      {offlineModalData && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3>💳 Razorpay Test Mode Checkout</h3>
            </div>
            <div className="modal-body">
              <p>
                <strong>Order ID:</strong> {offlineModalData.shopKartOrderId}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹
                {Number(offlineModalData.amount / 100).toLocaleString('en-IN')}
              </p>
              <p className="modal-hint">
                Simulating Razorpay Test Mode payment response for automated lab testing.
              </p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-modal-success"
                onClick={() => handleOfflineCompletePayment(true)}
              >
                ✅ Simulate Successful Payment
              </button>
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => handleOfflineCompletePayment(false)}
              >
                ❌ Simulate Failed Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
