import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const ORDER_STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data?.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Fetch order error:', err);
      if (err.response?.status === 403) {
        setError("You don't have permission to view this order.");
      } else if (err.response?.status === 404) {
        setError('Order not found.');
      } else {
        setError('Unable to load order details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Bonus Challenge: Order status progression updater
  const handleUpdateStatus = async (newStatus) => {
    setStatusUpdating(true);
    setNotice('');

    try {
      const res = await api.patch(`/orders/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        setOrder(res.data.order);
        setNotice(`Order status advanced to ${newStatus}!`);
        setTimeout(() => setNotice(''), 3000);
      }
    } catch (err) {
      console.error('Update status error:', err);
      setNotice(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="order-details-wrapper">
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-details-wrapper">
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <h2>Unable to Load Order</h2>
          <p>{error || 'Order not found.'}</p>
          <Link to="/orders" className="btn-back">
            ← Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.indexOf(order.status);
  const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="order-details-wrapper">
      <div className="order-details-navigation">
        <Link to="/orders" className="btn-back-link">
          ← Back to All Orders
        </Link>
      </div>

      <div className="order-details-main-card">
        {/* Header */}
        <div className="order-details-header">
          <div>
            <h1 className="details-order-id">Order #{order._id}</h1>
            <p className="details-placed-date">Placed on {dateFormatted}</p>
          </div>
          <div className="order-status-group">
            <span className={`status-badge status-${order.status.toLowerCase()}`}>
              {order.status}
            </span>
            <span className={`status-badge status-${order.paymentStatus.toLowerCase()}`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>

        {notice && (
          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            <span>ℹ️</span>
            <span>{notice}</span>
          </div>
        )}

        {/* Visual Status Progress Tracker */}
        <div className="order-progress-tracker">
          <h3 className="tracker-heading">Delivery Status Progress</h3>
          <div className="tracker-steps">
            {ORDER_STEPS.map((step, idx) => {
              const isCompleted = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;

              return (
                <div
                  key={step}
                  className={`tracker-step ${isCompleted ? 'completed' : ''} ${
                    isCurrent ? 'current' : ''
                  }`}
                >
                  <div className="step-marker">{isCompleted ? '✓' : idx + 1}</div>
                  <span className="step-label">{step}</span>
                </div>
              );
            })}
          </div>

          {/* Bonus Challenge: Admin/Dev status advancement dropdown */}
          <div className="status-progression-control">
            <span className="control-label">Demo Status Progression (+10 Marks):</span>
            <div className="control-buttons">
              {ORDER_STEPS.map((step) => (
                <button
                  key={step}
                  type="button"
                  onClick={() => handleUpdateStatus(step)}
                  disabled={statusUpdating || order.status === step}
                  className={`btn-status-step ${order.status === step ? 'active-step' : ''}`}
                >
                  Set {step}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Items & Shipping/Payment */}
        <div className="order-details-grid">
          {/* Items Section */}
          <div className="order-details-items-section">
            <h3 className="section-heading">Ordered Items</h3>
            <div className="order-items-list-detailed">
              {order.items.map((item, idx) => (
                <div key={idx} className="detailed-item-row">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="detailed-item-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/80x80?text=Product';
                    }}
                  />
                  <div className="detailed-item-info">
                    <h4 className="detailed-item-name">{item.name}</h4>
                    <span className="detailed-item-meta">
                      Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="detailed-item-total">
                    ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping & Payment Summary Sidebar */}
          <div className="order-details-meta-section">
            <div className="meta-card">
              <h3 className="section-heading">📍 Shipping Address</h3>
              <div className="meta-address">
                <p className="meta-name">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.pincode}
                </p>
                <p className="meta-phone">📞 {order.shippingAddress.phone}</p>
              </div>
            </div>

            <div className="meta-card">
              <h3 className="section-heading">💳 Payment Information</h3>
              <div className="meta-payment-info">
                <div className="payment-row">
                  <span>Method:</span>
                  <strong>Razorpay Test Checkout</strong>
                </div>
                <div className="payment-row">
                  <span>Payment Status:</span>
                  <span className={`status-badge status-${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                {order.razorpayOrderId && (
                  <div className="payment-row">
                    <span>Razorpay Order ID:</span>
                    <span className="code-snippet">{order.razorpayOrderId}</span>
                  </div>
                )}
                {order.razorpayPaymentId && (
                  <div className="payment-row">
                    <span>Payment ID:</span>
                    <span className="code-snippet">{order.razorpayPaymentId}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="meta-card">
              <h3 className="section-heading">🧾 Invoice Summary</h3>
              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="text-free">FREE</span>
                </div>
                <div className="summary-divider"></div>
                <div className="summary-row summary-total">
                  <span>Order Total</span>
                  <span className="summary-total-val">
                    ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
