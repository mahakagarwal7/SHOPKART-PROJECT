import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    api
      .get(`/products/${id}`)
      .then((res) => {
        if (mounted) {
          // res.data.product or res.data
          setProduct(res.data?.product || res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          console.error('Fetch product details error:', err);
          if (err.response?.status === 404) {
            setError('Product not found.');
          } else if (err.response?.status === 400) {
            setError('Invalid product ID provided.');
          } else {
            setError('Something went wrong while loading the product details.');
          }
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="state-container loading-state">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="details-container">
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <h2>Unable to Load Product</h2>
          <p>{error || 'Product not found.'}</p>
          <Link to="/products" className="btn-back">
            ← Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="details-container">
      <div className="details-navigation">
        <Link to="/products" className="btn-back-link">
          ← Back to All Products
        </Link>
      </div>

      <div className="details-card">
        <div className="details-image-section">
          <img
            src={product.image}
            alt={product.name}
            className="details-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://placehold.co/600x500?text=Product+Image';
            }}
          />
        </div>

        <div className="details-content-section">
          <span className="details-category-badge">{product.category}</span>
          <h1 className="details-title">{product.name}</h1>

          <div className="details-price">
            ₹{Number(product.price).toLocaleString('en-IN')}
          </div>

          <div className="details-stock-status">
            {isOutOfStock ? (
              <span className="stock-badge stock-badge-out">Out of Stock</span>
            ) : (
              <span className="stock-badge stock-badge-in">
                In Stock ({product.stock} units available)
              </span>
            )}
          </div>

          <div className="details-description-block">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="details-actions">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`btn-add-to-cart ${isOutOfStock ? 'disabled' : ''}`}
            >
              🛒 {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>

            {addedNotice && (
              <div className="alert alert-success" style={{ marginTop: '1rem' }}>
                <span>✅</span>
                <span>Added to cart! (Cart functionality will be introduced in Lab 04)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
