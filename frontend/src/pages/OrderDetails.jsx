import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  PackageIcon,
  TruckIcon,
  CheckIcon,
  CreditCardIcon,
  ArrowLeftIcon,
  ShieldIcon,
  ChevronDownIcon,
} from '../components/Icons';

const ORDER_STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [notice, setNotice] = useState('');
  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyRef = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

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

  // Order status progression updater
  const handleUpdateStatus = async (newStatus) => {
    setStatusUpdating(true);
    setNotice('');

    try {
      const res = await api.patch(`/orders/${id}/status`, { status: newStatus });
      if (res.data?.success) {
        setOrder(res.data.order);
        setNotice(`Order delivery status advanced to ${newStatus}!`);
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
      <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <h2>Unable to Load Order</h2>
          <p>{error || 'Order not found.'}</p>
          <Link to="/orders" className="btn-back">
            <ArrowLeftIcon size={16} />
            <span>Back to My Orders</span>
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
    <div className="storefront-order-details-page">
      <div className="storefront-container">
        {/* Navigation Breadcrumbs */}
        <div className="catalog-breadcrumbs">
          <Link to="/home">Home</Link>
          <span>/</span>
          <Link to="/orders">My Orders</Link>
          <span>/</span>
          <span className="current-crumb">Order #{order._id}</span>
        </div>

        <div className="storefront-details-main-box">
          {/* Header Bar */}
          <div className="order-details-top-bar">
            <div>
              <h1 className="order-heading-code">Order #{order._id}</h1>
              <p className="order-placed-timestamp">Placed on {dateFormatted}</p>
            </div>
            <div className="order-status-pills-row">
              <span className={`status-pill-small pill-${order.status.toLowerCase()}`}>
                {order.status}
              </span>
              <span className={`status-pill-small pill-${order.paymentStatus.toLowerCase()}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {notice && (
            <div className="alert alert-info" style={{ marginTop: '1rem' }}>
              <CheckIcon size={16} />
              <span>{notice}</span>
            </div>
          )}

          {/* Delivery Progress Timeline */}
          <div className="delivery-timeline-card">
            <div className="timeline-header-flex">
              <TruckIcon size={20} />
              <h3 className="timeline-title">Live Delivery Status Timeline</h3>
            </div>

            <div className="timeline-steps-track">
              {ORDER_STEPS.map((step, idx) => {
                const isCompleted = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div
                    key={step}
                    className={`timeline-step-node ${isCompleted ? 'node-completed' : ''} ${
                      isCurrent ? 'node-current' : ''
                    }`}
                  >
                    <div className="step-circle">
                      {isCompleted ? <CheckIcon size={14} /> : idx + 1}
                    </div>
                    <span className="step-text">{step}</span>
                  </div>
                );
              })}
            </div>

            {/* Admin / Dev status progression controls */}
            <div className="timeline-admin-control">
              <span className="admin-control-label">Demo Status Progression:</span>
              <div className="admin-buttons-row">
                {ORDER_STEPS.map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleUpdateStatus(step)}
                    disabled={statusUpdating || order.status === step}
                    className={`btn-step-advance ${order.status === step ? 'advance-active' : ''}`}
                  >
                    Set {step}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2-Column Grid: Ordered Items & Shipping/Invoice */}
          <div className="order-details-content-grid">
            {/* Left: Ordered Items Snapshot */}
            <div className="order-items-table-card">
              <h3 className="card-subheading">Purchased Items ({order.items.length})</h3>
              <div className="items-snapshot-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="snapshot-item-card">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="snapshot-item-img"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=120&auto=format&fit=crop';
                      }}
                    />
                    <div className="snapshot-item-details">
                      <h4 className="snapshot-name">{item.name}</h4>
                      <span className="snapshot-unit">
                        Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="snapshot-total-price">
                      ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Shipping & Invoice Summary */}
            <div className="order-sidebar-meta">
              <div className="meta-box-card">
                <h3 className="card-subheading">📍 Destination Address</h3>
                <div className="address-text-block">
                  <p className="recipient-name">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                    {order.shippingAddress.pincode}
                  </p>
                  <p className="recipient-phone">📞 {order.shippingAddress.phone}</p>
                </div>
              </div>

              <div className="meta-box-card payment-summary-card">
                <div className="card-subheading-row">
                  <div className="subheading-left">
                    <CreditCardIcon size={18} />
                    <h3 className="card-subheading">Payment & Transaction</h3>
                  </div>
                  <span className={`status-pill-small pill-${order.paymentStatus.toLowerCase()}`}>
                    <CheckIcon size={12} /> {order.paymentStatus}
                  </span>
                </div>

                <div className="payment-meta-list">
                  <div className="payment-meta-row">
                    <span className="meta-row-label">Payment Method</span>
                    <div className="meta-row-val-highlight">
                      <ShieldIcon size={14} className="text-primary" />
                      <span>Razorpay Online Payment</span>
                    </div>
                  </div>

                  <div className="payment-meta-row">
                    <span className="meta-row-label">Security</span>
                    <span className="verified-ssl-text">256-Bit SSL Encrypted</span>
                  </div>

                  {order.razorpayPaymentId && (
                    <div className="payment-meta-row receipt-row">
                      <span className="meta-row-label">Receipt Reference</span>
                      <div className="receipt-pill-group">
                        <span className="receipt-masked-code" title={order.razorpayPaymentId}>
                          {order.razorpayPaymentId.length > 14
                            ? `${order.razorpayPaymentId.slice(0, 8)}•••${order.razorpayPaymentId.slice(-4)}`
                            : order.razorpayPaymentId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyRef(order.razorpayPaymentId)}
                          className="btn-copy-receipt"
                          title="Copy Payment Reference ID"
                        >
                          {copiedRef ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Collapsible Technical Reference Drawer */}
                {(order.razorpayOrderId || order.razorpayPaymentId) && (
                  <details className="tech-details-disclosure">
                    <summary className="tech-details-summary">
                      <span>Gateway Reference Details</span>
                      <ChevronDownIcon size={14} className="disclosure-chevron" />
                    </summary>
                    <div className="tech-details-drawer">
                      {order.razorpayOrderId && (
                        <div className="tech-detail-item">
                          <span className="tech-detail-key">Order Ref:</span>
                          <code className="tech-detail-code">{order.razorpayOrderId}</code>
                        </div>
                      )}
                      {order.razorpayPaymentId && (
                        <div className="tech-detail-item">
                          <span className="tech-detail-key">Payment Ref:</span>
                          <code className="tech-detail-code">{order.razorpayPaymentId}</code>
                        </div>
                      )}
                      <p className="tech-detail-hint">
                        Reference tokens used for automated backend reconciliation and gateway verification.
                      </p>
                    </div>
                  </details>
                )}
              </div>

              <div className="meta-box-card">
                <h3 className="card-subheading">🧾 Order Summary</h3>
                <div className="invoice-rows-list">
                  <div className="invoice-row">
                    <span>Items Subtotal</span>
                    <span>₹{Number(order.totalAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="invoice-row">
                    <span>Standard Shipping</span>
                    <span className="text-shipping-free">FREE</span>
                  </div>
                  <div className="summary-divider-line"></div>
                  <div className="invoice-row total-row">
                    <span>Total Amount Paid</span>
                    <span className="invoice-total-amount">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
