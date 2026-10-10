import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart, actionLoadingId } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartNotice, setCartNotice] = useState('');
  const [wishlisted, setWishlisted] = useState(false);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [wishlistNotice, setWishlistNotice] = useState('');

  const isAddingToCart = actionLoadingId === id;
  const inCart = isInCart(id);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');

    // Fetch product details
    api
      .get(`/products/${id}`)
      .then((res) => {
        if (mounted) {
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

    // Check if this product is already in user's wishlist
    api
      .get('/wishlist')
      .then((res) => {
        if (mounted && res.data?.wishlist) {
          const isSaved = res.data.wishlist.some((item) => item._id === id);
          setWishlisted(isSaved);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddToCart = async () => {
    if (isOutOfStock || isAddingToCart) return;
    setCartNotice('');

    const res = await addToCart(id);
    if (res.status === 401) {
      navigate('/login');
    } else if (res.success) {
      setCartNotice('Added to cart! 🛒');
    } else {
      setCartNotice(res.message || 'Unable to add to cart.');
    }

    setTimeout(() => {
      setCartNotice('');
    }, 3000);
  };

  const handleToggleWishlist = async () => {
    if (savingWishlist) return;
    setSavingWishlist(true);
    setWishlistNotice('');

    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${id}`);
        setWishlisted(false);
        setWishlistNotice('Removed from wishlist');
      } else {
        await api.post(`/wishlist/${id}`);
        setWishlisted(true);
        setWishlistNotice('Added to wishlist ❤️');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      } else if (err.response?.status === 409) {
        setWishlisted(true);
        setWishlistNotice('Already in wishlist ❤️');
      } else {
        setWishlistNotice('Unable to update wishlist. Please try again.');
      }
    } finally {
      setSavingWishlist(false);
      setTimeout(() => setWishlistNotice(''), 3000);
    }
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
            <div className="details-action-buttons">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className={`btn-add-to-cart ${isOutOfStock ? 'disabled' : ''}`}
              >
                {isOutOfStock
                  ? 'Out of Stock'
                  : isAddingToCart
                  ? '⏳ Adding to Cart...'
                  : inCart
                  ? '🛒 Add Another'
                  : '🛒 Add to Cart'}
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={savingWishlist}
                className={`btn-details-wishlist ${wishlisted ? 'active' : ''}`}
              >
                {savingWishlist
                  ? '⏳ Saving...'
                  : wishlisted
                  ? '❤️ Saved in Wishlist'
                  : '♡ Add to Wishlist'}
              </button>
            </div>

            {cartNotice && (
              <div
                className={`alert ${
                  cartNotice.includes('Unable') || cartNotice.includes('failed')
                    ? 'alert-error'
                    : 'alert-success'
                }`}
                style={{ marginTop: '1rem' }}
              >
                <span>{cartNotice.includes('Unable') ? '⚠️' : '✅'}</span>
                <span>{cartNotice}</span>
              </div>
            )}

            {wishlistNotice && (
              <div
                className={`alert ${
                  wishlistNotice.includes('Unable') ? 'alert-error' : 'alert-success'
                }`}
                style={{ marginTop: '1rem' }}
              >
                <span>ℹ️</span>
                <span>{wishlistNotice}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
