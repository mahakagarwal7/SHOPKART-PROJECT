import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import {
  CartIcon,
  HeartIcon,
  TruckIcon,
  ShieldIcon,
  RefreshIcon,
  StarIcon,
  CheckIcon,
  ArrowLeftIcon,
} from '../components/Icons';

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
  const [selectedQuantity, setSelectedQuantity] = useState(1);

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
    if (!product || product.stock <= 0 || isAddingToCart) return;
    setCartNotice('');

    // Call addToCart
    const res = await addToCart(id);
    if (res.status === 401) {
      navigate('/login');
    } else if (res.success) {
      setCartNotice('Item added to your shopping bag!');
    } else {
      setCartNotice(res.message || 'Unable to add to cart.');
    }

    setTimeout(() => {
      setCartNotice('');
    }, 3200);
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
        setWishlistNotice('Unable to update wishlist.');
      }
    } finally {
      setSavingWishlist(false);
      setTimeout(() => setWishlistNotice(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="storefront-container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <h2>Unable to Load Product</h2>
          <p>{error || 'Product not found.'}</p>
          <Link to="/products" className="btn-back">
            <ArrowLeftIcon size={16} />
            <span>Back to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  const originalPrice = Math.round(product.price * 1.25);
  const discountPercent = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <div className="storefront-details-page">
      <div className="storefront-container">
        {/* Breadcrumb Navigation */}
        <div className="details-breadcrumbs">
          <Link to="/home">Home</Link>
          <span>/</span>
          <Link to="/products">Catalog</Link>
          <span>/</span>
          <Link to={`/products?category=${product.category}`}>{product.category}</Link>
          <span>/</span>
          <span className="current-crumb">{product.name}</span>
        </div>

        {/* 2-Column Product Showcase Card */}
        <div className="storefront-details-card">
          {/* Left Column: Visual Showcase */}
          <div className="details-visual-col">
            <div className="details-image-frame">
              <img
                src={product.image}
                alt={product.name}
                className="details-hero-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=700&auto=format&fit=crop';
                }}
              />
              <span className="details-category-tag">{product.category}</span>
              <span className="details-discount-tag">Save {discountPercent}%</span>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="details-info-col">
            <div className="details-rating-strip">
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} size={16} filled={true} />
                ))}
              </div>
              <span className="rating-score">4.9 / 5.0</span>
              <span className="rating-count">• 128 Verified Ratings</span>
            </div>

            <h1 className="details-title-heading">{product.name}</h1>

            <div className="details-price-row">
              <div className="price-tag-wrap">
                <span className="details-price-tag">
                  ₹{Number(product.price).toLocaleString('en-IN')}
                </span>
                <span className="details-mrp-tag">
                  ₹{Number(originalPrice).toLocaleString('en-IN')}
                </span>
              </div>
              <span className="tax-inclusive-tag">Inclusive of all taxes</span>
            </div>

            <div className="details-stock-status-row">
              {isOutOfStock ? (
                <span className="status-pill pill-out">Out of Stock</span>
              ) : (
                <span className="status-pill pill-in">
                  <CheckIcon size={14} /> In Stock ({product.stock} units available)
                </span>
              )}
            </div>

            <div className="details-description-box">
              <h3>Product Overview</h3>
              <p>{product.description}</p>
            </div>

            {/* Notification Alerts */}
            {cartNotice && (
              <div
                className={`alert ${
                  cartNotice.includes('Unable') || cartNotice.includes('failed')
                    ? 'alert-error'
                    : 'alert-success'
                }`}
              >
                <span>{cartNotice.includes('Unable') ? '⚠️' : '✅'}</span>
                <span>{cartNotice}</span>
              </div>
            )}

            {wishlistNotice && (
              <div className="alert alert-info">
                <span>ℹ️</span>
                <span>{wishlistNotice}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="details-action-buttons-group">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAddingToCart}
                className={`btn-details-primary-cart ${isOutOfStock ? 'disabled' : ''}`}
              >
                {isOutOfStock ? (
                  'Out of Stock'
                ) : isAddingToCart ? (
                  <span className="loading-inline">
                    <span className="spinner-sm"></span> Adding to Bag...
                  </span>
                ) : inCart ? (
                  <>
                    <CheckIcon size={18} /> In Bag (Add Another)
                  </>
                ) : (
                  <>
                    <CartIcon size={18} /> Add to Shopping Bag
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleToggleWishlist}
                disabled={savingWishlist}
                className={`btn-details-wishlist-toggle ${wishlisted ? 'is-saved' : ''}`}
              >
                {savingWishlist ? (
                  <span className="spinner-sm"></span>
                ) : (
                  <HeartIcon filled={wishlisted} size={18} />
                )}
                <span>{wishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
              </button>
            </div>

            {/* Reassurance Value Perks */}
            <div className="details-perks-checklist">
              <div className="checklist-item">
                <TruckIcon size={18} className="checklist-icon" />
                <span>Fast express delivery across all pin codes in India</span>
              </div>
              <div className="checklist-item">
                <ShieldIcon size={18} className="checklist-icon" />
                <span>100% Secure Checkout powered by Razorpay Test Mode</span>
              </div>
              <div className="checklist-item">
                <RefreshIcon size={18} className="checklist-icon" />
                <span>Easy 30-day hassle-free replacement warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
