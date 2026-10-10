import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function WishlistCard({ product, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const isOutOfStock = product.stock <= 0;

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    try {
      await onRemove(product._id);
    } catch (err) {
      setRemoving(false);
    }
  };

  return (
    <div className="wishlist-card">
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

        <div className="wishlist-card-buttons">
          <Link to={`/products/${product._id}`} className="btn-view-details">
            View Details
          </Link>
          <button
            type="button"
            onClick={handleRemove}
            disabled={removing}
            className="btn-remove-wishlist"
          >
            {removing ? '⏳ Removing...' : 'Remove ♥'}
          </button>
        </div>
      </div>
    </div>
  );
}
