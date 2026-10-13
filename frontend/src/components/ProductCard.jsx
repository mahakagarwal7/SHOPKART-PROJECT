import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { HeartIcon, CartIcon, StarIcon, CheckIcon, ArrowRightIcon } from './Icons';

export default function ProductCard({ product, initialWishlisted = false, onWishlistChange }) {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const navigate = useNavigate();
  const { addToCart, isInCart, actionLoadingId } = useCart();

  const isOutOfStock = product.stock <= 0;
  const isCartLoading = actionLoadingId === product._id;
  const inCart = isInCart(product._id);

  // Compute dummy original MRP to display discount tag like leading stores
  const originalPrice = Math.round(product.price * 1.25);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || isCartLoading) return;

    setFeedbackMsg('');
    const res = await addToCart(product._id);
    if (res.status === 401) {
      navigate('/login');
    } else if (res.success) {
      setFeedbackMsg('Added to bag!');
    } else {
      setFeedbackMsg(res.message || 'Unable to add to cart.');
    }

    setTimeout(() => {
      setFeedbackMsg('');
    }, 2500);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loadingWishlist) return;

    setLoadingWishlist(true);
    setFeedbackMsg('');

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product._id}`);
        setIsWishlisted(false);
        setFeedbackMsg('Removed from saved items');
        if (onWishlistChange) onWishlistChange(product._id, false);
      } else {
        await api.post(`/wishlist/${product._id}`);
        setIsWishlisted(true);
        setFeedbackMsg('Saved to wishlist!');
        if (onWishlistChange) onWishlistChange(product._id, true);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 409) {
        setIsWishlisted(true);
        setFeedbackMsg('Already in wishlist');
      } else {
        setFeedbackMsg('Unable to update wishlist.');
      }
    } finally {
      setLoadingWishlist(false);
      setTimeout(() => setFeedbackMsg(''), 2500);
    }
  };

  return (
    <div className="storefront-product-card group">
      {/* Product Image Stage */}
      <div className="card-image-stage">
        <Link to={`/products/${product._id}`} className="image-stage-link">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="product-main-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=500&auto=format&fit=crop';
            }}
          />
        </Link>

        {/* Top Badges */}
        <div className="stage-top-overlay">
          <div className="stage-badges-left">
            {product.stock <= 5 && !isOutOfStock ? (
              <span className="stage-badge badge-warning">Low Stock</span>
            ) : isOutOfStock ? (
              <span className="stage-badge badge-danger">Out of Stock</span>
            ) : (
              <span className="stage-badge badge-discount">-{discountPercent}%</span>
            )}
          </div>

          {/* Floating Heart Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={loadingWishlist}
            className={`stage-heart-btn ${isWishlisted ? 'heart-active' : ''}`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
            aria-label="Wishlist toggle"
          >
            <HeartIcon filled={isWishlisted} size={18} />
          </button>
        </div>

        {/* Quick View Floating Overlay on Hover */}
        <div className="stage-hover-overlay">
          <Link to={`/products/${product._id}`} className="btn-quick-view">
            <span>Quick View</span>
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>

      {/* Card Content & Details */}
      <div className="card-body-content">
        <div className="card-meta-row">
          <span className="card-meta-category">{product.category}</span>
          <div className="card-rating-mini">
            <StarIcon size={13} filled={true} />
            <span>4.9</span>
          </div>
        </div>

        <h3 className="card-product-title">
          <Link to={`/products/${product._id}`} title={product.name}>
            {product.name}
          </Link>
        </h3>

        {/* Price & Stock info */}
        <div className="card-pricing-row">
          <div className="pricing-group">
            <span className="price-amount">₹{Number(product.price).toLocaleString('en-IN')}</span>
            <span className="original-mrp-price">₹{Number(originalPrice).toLocaleString('en-IN')}</span>
          </div>
          <span className="stock-hint">
            {isOutOfStock ? (
              <span className="text-out">Sold Out</span>
            ) : product.stock <= 5 ? (
              <span className="text-low">Only {product.stock} left</span>
            ) : (
              <span className="text-in">In Stock</span>
            )}
          </span>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div
            className={`card-feedback-pill ${
              feedbackMsg.includes('Unable') || feedbackMsg.includes('failed')
                ? 'feedback-pill-err'
                : 'feedback-pill-ok'
            }`}
          >
            {feedbackMsg.includes('Added') || feedbackMsg.includes('Saved') ? (
              <CheckIcon size={13} />
            ) : null}
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Primary Action Button */}
        <div className="card-actions-wrapper">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isCartLoading}
            className={`btn-storefront-add ${inCart ? 'btn-in-bag' : ''}`}
          >
            {isOutOfStock ? (
              'Sold Out'
            ) : isCartLoading ? (
              <span className="loading-inline">
                <span className="spinner-sm"></span> Adding...
              </span>
            ) : inCart ? (
              <>
                <CheckIcon size={16} /> In Bag (+1)
              </>
            ) : (
              <>
                <CartIcon size={16} /> Add to Bag
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
