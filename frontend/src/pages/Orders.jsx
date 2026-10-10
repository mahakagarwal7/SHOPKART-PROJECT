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
      <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Loading order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
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
      <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-container empty-orders-state">
          <div className="empty-orders-icon">📦</div>
          <h2>You have not placed any orders yet</h2>
          <p>Once you purchase items from our catalog, track them here.</p>
          <Link to="/products" className="btn-browse-empty">
            Start Shopping →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="storefront-orders-page">
      <div className="storefront-container">
        {/* Header Block */}
        <div className="orders-header-row">
          <div>
            <div className="catalog-breadcrumbs">
              <Link to="/home">Home</Link>
              <span>/</span>
              <span className="current-crumb">My Orders</span>
            </div>
            <h1 className="orders-main-title">My Orders</h1>
            <p className="orders-subtitle-text">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed with ShopKart
            </p>
          </div>
          <Link to="/products" className="btn-continue-shopping-pill">
            ← Continue Shopping
          </Link>
        </div>

        {/* Orders List */}
        <div className="orders-history-list">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div key={order._id} className="storefront-order-card">
                <div className="order-card-header-bar">
                  <div className="order-meta-info">
                    <span className="order-code">Order #{order._id}</span>
                    <span className="order-date-badge">• Placed on {dateStr}</span>
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

                <div className="order-card-items-box">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-snapshot-row">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="snapshot-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop';
                        }}
                      />
                      <div className="snapshot-info">
                        <span className="snapshot-title">{item.name}</span>
                        <span className="snapshot-quantity">
                          Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="snapshot-line-total">
                        ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer-bar">
                  <div className="order-total-group">
                    <span className="total-label-muted">Order Total:</span>
                    <span className="total-value-strong">
                      ₹{Number(order.totalAmount).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Link to={`/orders/${order._id}`} className="btn-view-invoice">
                    View Details & Track →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
