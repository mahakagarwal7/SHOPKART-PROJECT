import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/orders');
      if (res.data?.success && Array.isArray(res.data.orders)) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="orders-page-wrapper">
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page-wrapper">
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <h2>Unable to Load Orders</h2>
          <p>{error}</p>
          <button type="button" onClick={fetchOrders} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="orders-page-wrapper">
        <div className="state-container empty-orders-state">
          <div className="empty-orders-icon">📦</div>
          <h2>You have not placed any orders yet.</h2>
          <p>Once you purchase items from our catalog, you can track them here.</p>
          <Link to="/products" className="btn-browse-empty">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page-wrapper">
      <div className="orders-header">
        <div>
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
          </p>
        </div>
        <Link to="/products" className="btn-continue-shopping">
          ← Continue Shopping
        </Link>
      </div>

      <div className="orders-list">
        {orders.map((order) => {
          const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={order._id} className="order-history-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id-label">Order #{order._id}</span>
                  <span className="order-date-text">{dateStr}</span>
                </div>
                <div className="order-status-badges">
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                  <span className={`status-badge status-${order.paymentStatus.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="order-items-grid">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="order-item-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/60x60?text=Product';
                      }}
                    />
                    <div className="order-item-desc">
                      <span className="order-item-title">{item.name}</span>
                      <span className="order-item-qty">
                        Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="order-item-line-total">
                      ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-card-footer">
                <div className="order-footer-total">
                  <span className="footer-total-label">Total Amount:</span>
                  <span className="footer-total-val">
                    ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                  </span>
                </div>
                <Link to={`/orders/${order._id}`} className="btn-order-details">
                  View Details →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
