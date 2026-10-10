import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import WishlistCard from '../components/WishlistCard';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data?.wishlist || []);
    } catch (err) {
      console.error('Fetch wishlist error:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      } else {
        setError("We couldn't load your wishlist.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      // Remove product from state without page reload
      setWishlist((prev) => prev.filter((item) => item._id !== productId));
      setNotice('Product removed from your wishlist.');
      setTimeout(() => setNotice(''), 3000);
    } catch (err) {
      console.error('Remove error:', err);
      setNotice('Unable to remove product. Please try again.');
      setTimeout(() => setNotice(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="storefront-container wishlist-container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-container loading-state">
          <div className="spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="storefront-container wishlist-container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-container error-state">
          <div className="state-icon">⚠️</div>
          <h2>Something went wrong.</h2>
          <p>{error}</p>
          <button type="button" onClick={fetchWishlist} className="btn-retry">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="storefront-container wishlist-container" style={{ padding: '4rem 1.5rem' }}>
        <div className="state-container empty-wishlist-state">
          <div className="empty-heart-icon">❤️</div>
          <h2>Your wishlist is empty</h2>
          <p>Save products you love and find them here later.</p>
          <Link to="/products" className="btn-browse-empty">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="storefront-container wishlist-container" style={{ padding: '2.5rem 1.5rem 5rem' }}>
      <div className="catalog-breadcrumbs">
        <Link to="/home">Home</Link>
        <span>/</span>
        <span className="current-crumb">Wishlist</span>
      </div>

      <div className="wishlist-header">
        <div>
          <h1>My Wishlist</h1>
          <p className="wishlist-count-text">
            {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
          </p>
        </div>
        <Link to="/products" className="btn-continue-shopping-pill">
          ← Continue Shopping
        </Link>
      </div>

      {notice && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <span>ℹ️</span>
          <span>{notice}</span>
        </div>
      )}

      <div className="products-grid">
        {wishlist.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </div>
  );
}
