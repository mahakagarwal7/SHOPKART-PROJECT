import React from 'react';
import { Link } from 'react-router-dom';

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
    <div className={`cart-item-card ${isUpdating ? 'item-updating' : ''}`}>
      <div className="cart-item-image-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://placehold.co/150x150?text=Product';
          }}
        />
      </div>

      <div className="cart-item-details">
        <div className="cart-item-header">
          <Link to={`/products/${product._id}`} className="cart-item-title">
            {product.name}
          </Link>
          <span className="cart-item-category">{product.category}</span>
        </div>

        <div className="cart-item-price-unit">
          ₹{Number(product.price).toLocaleString('en-IN')} <span className="text-unit">/ unit</span>
        </div>

        <div className="cart-item-stock-info">
          {product.stock <= 5 ? (
            <span className="stock-warning">Only {product.stock} units left in stock</span>
          ) : (
            <span className="stock-available">In stock ({product.stock} available)</span>
          )}
        </div>

        <div className="cart-item-footer">
          <div className="cart-quantity-controls">
            <span className="quantity-label">Quantity:</span>
            <div className="stepper-group">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={isMinQuantity || isUpdating}
                className="btn-stepper btn-decrement"
                title={isMinQuantity ? 'Minimum quantity is 1' : 'Decrease quantity'}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="stepper-value">{quantity}</span>
              <button
                type="button"
                onClick={handleIncrease}
                disabled={isMaxQuantity || isUpdating}
                className="btn-stepper btn-increment"
                title={isMaxQuantity ? `Max available stock is ${product.stock}` : 'Increase quantity'}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <div className="cart-item-actions">
            <button
              type="button"
              onClick={handleRemove}
              disabled={isUpdating}
              className="btn-remove-cart"
              title="Remove item from cart"
            >
              {isUpdating ? '⏳' : '🗑️'} Remove
            </button>
          </div>
        </div>
      </div>

      <div className="cart-item-total-col">
        <span className="item-total-label">Subtotal</span>
        <span className="item-total-amount">
          ₹{Number(itemTotal).toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  );
}
