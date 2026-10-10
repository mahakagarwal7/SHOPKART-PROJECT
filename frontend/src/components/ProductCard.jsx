import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ProductCard({ product, initialWishlisted = false, onWishlistChange }) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const isOutOfStock = product.stock <= 0;

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    if (loading) return; // Prevent duplicate requests while saving

    setLoading(true);
    setMessage('');

    try {
      if (isWishlisted) {
        // Remove from wishlist
        await api.delete(`/wishlist/${product._id}`);
        setIsWishlisted(false);
        setMessage('Removed from Wishlist');
        if (onWishlistChange) onWishlistChange(product._id, false);
      } else {
        // Add to wishlist
        await api.post(`/wishlist/${product._id}`);
        setIsWishlisted(true);
        setMessage('Added to Wishlist');
        if (onWishlistChange) onWishlistChange(product._id, true);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Not authenticated -> redirect to login
        navigate('/login');
      } else if (err.response?.status === 409) {
        // Already in wishlist
        setIsWishlisted(true);
        setMessage('Already in Wishlist');
      } else {
        setMessage('Unable to save product. Please try again.');
      }
    } finally {
      setLoading(false);
      // Auto-clear notification message after 3 seconds
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/400x300?text=Product+Image';
          }}
        />
        <span className="product-category-badge">{product.category}</span>

        {/* Heart Icon Button overlay on image */}
        <button
          type="button"
          onClick={handleWishlistClick}
          disabled={loading}
          className={`wishlist-heart-btn ${isWishlisted ? 'active' : ''}`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Wishlist toggle"
        >
          {loading ? '⏳' : isWishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="product-info">
        <h3 className="product-title" title={product.name}>
          {product.name}
        </h3>

        <div className="product-price">
          ₹{Number(product.price).toLocaleString('en-IN')}
        </div>

        <div className="product-stock">
          {isOutOfStock ? (
            <span className="stock-out">Out of Stock</span>
          ) : (
            <span className="stock-in">{product.stock} units left</span>
          )}
        </div>

        {message && (
          <div
            className={`wishlist-card-feedback ${
              message.includes('Unable') ? 'feedback-error' : 'feedback-success'
            }`}
          >
            {message}
          </div>
        )}

        <div className="product-card-actions">
          <Link to={`/products/${product._id}`} className="btn-view-details">
            View Details
          </Link>
          <button
            type="button"
            onClick={handleWishlistClick}
            disabled={loading}
            className={`btn-card-wishlist ${isWishlisted ? 'wishlisted' : ''}`}
          >
            {loading ? '⏳ Saving...' : isWishlisted ? '♥ In Wishlist' : '♡ Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
