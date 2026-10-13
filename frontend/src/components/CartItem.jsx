import React from 'react';
import { Link } from 'react-router-dom';
import { TrashIcon, MinusIcon, PlusIcon } from './Icons';

export default function CartItem({ item, onUpdateQuantity, onRemove, isUpdating }) {
  const { product, quantity } = item;

  if (!product) return null;

  const isMinQuantity = quantity <= 1;
  const isMaxQuantity = quantity >= product.stock;
  const itemTotal = (product.price || 0) * quantity;

  const handleDecrease = () => {
    if (isMinQuantity || isUpdating) return;
    onUpdateQuantity(product._id, quantity - 1);
  };

  const handleIncrease = () => {
    if (isMaxQuantity || isUpdating) return;
    onUpdateQuantity(product._id, quantity + 1);
  };

  const handleRemove = () => {
    if (isUpdating) return;
    onRemove(product._id);
  };

  return (
    <div className={`storefront-cart-row ${isUpdating ? 'row-updating' : ''}`}>
      {/* Product Thumbnail */}
      <div className="cart-row-image-box">
        <Link to={`/products/${product._id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="cart-row-thumb"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop';
            }}
          />
        </Link>
      </div>

      {/* Product Details & Category */}
      <div className="cart-row-details">
        <span className="cart-row-category">{product.category}</span>
        <h4 className="cart-row-title">
          <Link to={`/products/${product._id}`}>{product.name}</Link>
        </h4>
        <div className="cart-row-unit-price">
          ₹{Number(product.price).toLocaleString('en-IN')} <span className="unit-label">each</span>
        </div>
        <div className="cart-row-stock-state">
          {product.stock <= 5 ? (
            <span className="stock-alert-low">⚡ Only {product.stock} units left in stock</span>
          ) : (
            <span className="stock-alert-ok">✓ In Stock</span>
          )}
        </div>
      </div>

      {/* Stepper Controls */}
      <div className="cart-row-controls">
        <div className="storefront-stepper-box">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={isMinQuantity || isUpdating}
            className="stepper-action-btn"
            title={isMinQuantity ? 'Minimum quantity is 1' : 'Decrease quantity'}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="stepper-count-display">{quantity}</span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={isMaxQuantity || isUpdating}
            className="stepper-action-btn"
            title={isMaxQuantity ? `Only ${product.stock} units available` : 'Increase quantity'}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isUpdating}
          className="btn-row-remove"
          title="Remove product"
        >
          {isUpdating ? <span className="spinner-sm"></span> : <TrashIcon size={15} />}
          <span>Remove</span>
        </button>
      </div>

      {/* Line Subtotal */}
      <div className="cart-row-subtotal">
        <span className="subtotal-label">Subtotal</span>
        <span className="subtotal-amount">
          ₹{Number(itemTotal).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
