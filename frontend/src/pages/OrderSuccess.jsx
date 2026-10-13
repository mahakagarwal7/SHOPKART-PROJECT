import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  CheckIcon,
  PackageIcon,
  CartIcon,
  ArrowRightIcon,
  TruckIcon,
} from '../components/Icons';

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
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Fetch order success error:', err);
          setError('Unable to load order details.');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Confirming your order receipt...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="storefront-success-page">
      <div className="storefront-container">
        <div className="storefront-success-card">
          <div className="success-badge-icon">
            <CheckIcon size={36} />
          </div>
          <h1 className="success-main-title">Order Placed Successfully!</h1>
          <p className="success-main-subtitle">
            Thank you for shopping with ShopKart. Your payment was verified and your order is confirmed.
          </p>

          <div className="success-meta-box">
            <div className="meta-line">
              <span className="meta-line-label">Order Reference:</span>
              <span className="meta-line-id">#{id}</span>
            </div>
            <div className="meta-line">
              <span className="meta-line-label">Order Status:</span>
              <span className="status-pill-small pill-placed">{order?.status || 'PLACED'}</span>
            </div>
            <div className="meta-line">
              <span className="meta-line-label">Payment Status:</span>
              <span className="status-pill-small pill-paid">{order?.paymentStatus || 'PAID'}</span>
            </div>
            <div className="meta-line">
              <span className="meta-line-label">Total Amount Paid:</span>
              <span className="meta-line-price">
                ₹{Number(order?.totalAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>
            {order?.shippingAddress && (
              <div className="meta-line meta-delivery-block">
                <span className="meta-line-label">Shipping Destination:</span>
                <span className="meta-line-address">
                  {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1},{' '}
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                  {order.shippingAddress.pincode} (📞 {order.shippingAddress.phone})
                </span>
              </div>
            )}
          </div>

          {/* Purchased Items Snapshot */}
          {order?.items && order.items.length > 0 && (
            <div className="success-items-preview">
              <h3 className="items-preview-title">Purchased Items</h3>
              <div className="items-preview-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="preview-receipt-row">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="receipt-thumb"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=100&auto=format&fit=crop';
                      }}
                    />
                    <div className="receipt-meta">
                      <span className="receipt-name">{item.name}</span>
                      <span className="receipt-qty">
                        Qty: {item.quantity} × ₹{Number(item.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="receipt-total">
                      ₹{Number(item.price * item.quantity).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="success-action-buttons">
            <Link to="/orders" className="btn-success-orders">
              <PackageIcon size={16} />
              <span>View My Orders</span>
            </Link>
            <Link to="/products" className="btn-success-catalog">
              <CartIcon size={16} />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
