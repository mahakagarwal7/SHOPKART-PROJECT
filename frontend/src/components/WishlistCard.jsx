import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { HeartIcon, CartIcon, TrashIcon, ArrowRightIcon, StarIcon, CheckIcon } from './Icons';

export default function WishlistCard({ product, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const [movingToCart, setMovingToCart] = useState(false);
  const [feedback, setFeedback] = useState('');
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const isOutOfStock = product.stock <= 0;
  const inCart = isInCart(product._id);
  const originalPrice = Math.round(product.price * 1.25);

  const handleRemove = async (e) => {
    e.preventDefault();
    if (removing) return;
    setRemoving(true);
    await onRemove(product._id);
    setRemoving(false);
  };

  const handleMoveToCart = async (e) => {
    e.preventDefault();
    if (isOutOfStock || movingToCart) return;

    setMovingToCart(true);
    const res = await addToCart(product._id);
    if (res.status === 401) {
      navigate('/login');
      return;
    }

    if (res.success) {
      setFeedback('Added to bag!');
      setTimeout(() => setFeedback(''), 2500);
    }
    setMovingToCart(false);
  };

  return (
    <div className="storefront-product-card group">
      {/* Product Image Stage */}
      <div className="card-image-stage">
        <Link to={`/products/${product._id}`} className="image-stage-link">
          <img
            src={product.image}
            alt={product.name}
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
              <span className="stage-badge badge-trending">Saved</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="stage-heart-btn heart-active"
            title="Remove from saved wishlist"
            aria-label="Remove from Wishlist"
          >
            <HeartIcon filled={true} size={18} />
          </button>
        </div>

        <div className="stage-hover-overlay">
          <Link to={`/products/${product._id}`} className="btn-quick-view">
            <span>Details</span>
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

        {feedback && (
          <div className="card-feedback-pill feedback-pill-ok">
            <CheckIcon size={13} />
            <span>{feedback}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="wishlist-action-row">
          <button
            type="button"
            onClick={handleMoveToCart}
            disabled={isOutOfStock || movingToCart}
            className={`btn-wishlist-cart ${inCart ? 'in-bag' : ''}`}
            title="Move to bag"
          >
            {movingToCart ? (
              <span className="spinner-sm"></span>
            ) : inCart ? (
              <>
                <CheckIcon size={15} /> In Bag
              </>
            ) : (
              <>
                <CartIcon size={15} /> Add to Bag
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="btn-wishlist-delete"
            title="Remove from wishlist"
            aria-label="Remove item"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
