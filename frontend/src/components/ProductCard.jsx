import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, initialWishlisted = false, onWishlistChange }) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { addToCart, isInCart, actionLoadingId } = useCart();

  const isOutOfStock = product.stock <= 0;
  const isCartLoading = actionLoadingId === product._id;
  const inCart = isInCart(product._id);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock || isCartLoading) return;

    setMessage('');
    const res = await addToCart(product._id);
    if (res.status === 401) {
      navigate('/login');
    } else if (res.success) {
      setMessage('Added to cart! 🛒');
    } else {
      setMessage(res.message || 'Unable to add to cart.');
    }

    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

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
        setMessage('Added to Wishlist ❤️');
        if (onWishlistChange) onWishlistChange(product._id, true);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        // Not authenticated -> redirect to login
        navigate('/login');
      } else if (err.response?.status === 409) {
        // Already in wishlist
        setIsWishlisted(true);
        setMessage('Already in Wishlist ❤️');
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
              message.includes('Unable') || message.includes('failed')
                ? 'feedback-error'
                : 'feedback-success'
            }`}
          >
            {message}
          </div>
        )}

        <div className="product-card-actions">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isCartLoading}
            className={`btn-card-add-cart ${inCart ? 'in-cart' : ''}`}
          >
            {isOutOfStock
              ? 'Out of Stock'
              : isCartLoading
              ? '⏳ Adding...'
              : inCart
              ? '🛒 Add Another'
              : '🛒 Add to Cart'}
          </button>

          <div className="product-card-subactions">
            <Link to={`/products/${product._id}`} className="btn-view-details">
              Details
            </Link>
            <button
              type="button"
              onClick={handleWishlistClick}
              disabled={loading}
              className={`btn-card-wishlist ${isWishlisted ? 'wishlisted' : ''}`}
            >
              {loading ? '⏳' : isWishlisted ? '♥ Saved' : '♡ Wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
