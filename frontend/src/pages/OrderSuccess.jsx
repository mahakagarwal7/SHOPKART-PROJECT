import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    api
      .get(`/orders/${id}`)
      .then((res) => {
        if (mounted && res.data?.success) {
          setOrder(res.data.order);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Fetch order success details error:', err);
          setError('Unable to load order details.');
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="order-success-wrapper">
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Confirming your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-wrapper">
      <div className="order-success-card">
        <div className="success-icon-badge">✅</div>
        <h1 className="success-title">Order Placed Successfully!</h1>
        <p className="success-subtitle">
          Thank you for your purchase. Your payment was verified and your order is confirmed.
        </p>

        <div className="order-details-box">
          <div className="detail-row">
            <span className="detail-label">Order ID:</span>
            <span className="detail-value order-id-highlight">{id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className="status-badge status-placed">{order?.status || 'PLACED'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Payment Status:</span>
            <span className="status-badge status-paid">{order?.paymentStatus || 'PAID'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Total Amount:</span>
            <span className="detail-value text-price">
              ₹{Number(order?.totalAmount || 0).toLocaleString('en-IN')}
            </span>
          </div>
          {order?.shippingAddress && (
            <div className="detail-row detail-row-block">
              <span className="detail-label">Delivering To:</span>
              <span className="detail-value">
                {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1},{' '}
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.pincode} (📞 {order.shippingAddress.phone})
              </span>
            </div>
          )}
        </div>

        {order?.items && order.items.length > 0 && (
          <div className="order-items-preview">
            <h3 className="preview-heading">Purchased Items</h3>
            <div className="preview-list">
              {order.items.map((item, idx) => (
                <div key={idx} className="preview-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="preview-item-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/60x60?text=Item';
                    }}
                  />
                  <div className="preview-item-info">
                    <span className="preview-item-name">{item.name}</span>
                    <span className="preview-item-meta">
                      Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className="preview-item-total">
                    ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="success-actions">
          <Link to="/orders" className="btn-view-orders">
            📦 View My Orders
          </Link>
          <Link to="/products" className="btn-continue-shopping-alt">
            🛒 Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
