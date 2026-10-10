import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
          onError={(e) => {
            // Fallback placeholder image if URL fails
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

        <Link to={`/products/${product._id}`} className="btn-view-details">
          View Details
        </Link>
      </div>
    </div>
  );
}
