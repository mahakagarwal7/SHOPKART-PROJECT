import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../services/api';

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
      // 1. Create Pending ShopKart Order & Razorpay Order on backend
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
            'Payment failed. Your shopping bag has been preserved. Please try again.'
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

  const handleOfflineCompletePayment = async (success) => {
    if (!offlineModalData) return;
    setIsSubmitting(true);

    if (!success) {
      setBackendError('Test payment was cancelled. Your bag has been preserved.');
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
      <div className="storefront-checkout-page">
        <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
          <div className="state-container loading-state">
            <div className="spinner"></div>
            <p>Preparing checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="storefront-checkout-page">
      <div className="storefront-container">
        {/* Breadcrumb & Header */}
        <div className="checkout-header-row">
          <div className="catalog-breadcrumbs">
            <Link to="/home">Home</Link>
            <span>/</span>
            <Link to="/cart">Shopping Bag</Link>
            <span>/</span>
            <span className="current-crumb">Checkout</span>
          </div>
          <h1 className="checkout-main-title">Fast Checkout</h1>
          <p className="checkout-subtitle-text">
            Enter your delivery details to complete your order securely
          </p>
        </div>

        {backendError && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <span>⚠️</span>
            <span>{backendError}</span>
          </div>
        )}

        {/* 2-Column Checkout Layout */}
        <div className="storefront-checkout-layout">
          {/* Left Column: Shipping Address Form */}
          <div className="checkout-form-column">
            <div className="checkout-box-card">
              <h2 className="box-card-title">📍 Shipping Information</h2>

              <form onSubmit={handlePlaceOrder} noValidate className="storefront-shipping-form">
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
                    Phone Number (10 digits) *
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
                    placeholder="e.g. Flat 302, Green Valley Apartments, MG Road"
                    className={`form-input ${errors.addressLine1 ? 'input-error' : ''}`}
                  />
                  {errors.addressLine1 && (
                    <span className="field-error">{errors.addressLine1}</span>
                  )}
                </div>

                <div className="form-row-three-grid">
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
                  className="btn-pay-razorpay-primary"
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-sm"></span> Processing Razorpay Order...
                    </>
                  ) : (
                    <>💳 Pay with Razorpay • ₹{Number(subtotal).toLocaleString('en-IN')}</>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Order Review Sidebar */}
          <div className="checkout-summary-column">
            <div className="storefront-review-card">
              <h2 className="review-card-title">Order Review ({totalItems} items)</h2>

              <div className="review-items-list-box">
                {cartItems.map((item) => (
                  <div key={item.product?._id || item._id} className="review-item-row">
                    <img
                      src={item.product?.image}
                      alt={item.product?.name}
                      className="review-item-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop';
                      }}
                    />
                    <div className="review-item-meta">
                      <span className="review-item-name">{item.product?.name}</span>
                      <span className="review-item-qty">
                        Qty: {item.quantity} × ₹{Number(item.product?.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="review-item-total">
                      ₹{Number((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="review-divider-line"></div>

              <div className="review-breakdown-rows">
                <div className="review-row">
                  <span>Subtotal</span>
                  <span>₹{Number(subtotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="review-row">
                  <span>Standard Shipping</span>
                  <span className="text-shipping-free">FREE</span>
                </div>
                <div className="review-divider-line"></div>
                <div className="review-row review-total-row">
                  <span>Total Amount</span>
                  <span className="review-total-val">
                    ₹{Number(subtotal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="review-security-banner">
                <span>🔒</span>
                <span>256-Bit SSL Encrypted Razorpay Test Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Offline / Test Mode Modal Simulation */}
        {offlineModalData && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <div className="modal-header">
                <h3>💳 Razorpay Test Mode Checkout</h3>
              </div>
              <div className="modal-body">
                <p>
                  <strong>ShopKart Order ID:</strong> {offlineModalData.shopKartOrderId}
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
    </div>
  );
}
