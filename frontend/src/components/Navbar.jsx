import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [wishlistCount, setWishlistCount] = useState(null);

  // Fetch dynamic wishlist count from backend (Bonus Challenge +5 Marks)
  useEffect(() => {
    let mounted = true;
    api
      .get('/wishlist/count')
      .then((res) => {
        if (mounted && res.data?.success && typeof res.data.count === 'number') {
          setWishlistCount(res.data.count);
        }
      })
      .catch(() => {
        if (mounted) setWishlistCount(null);
      });

    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      navigate('/login');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/home" className="navbar-brand">
          🛒 <span>ShopKart</span>
        </Link>
        <nav className="navbar-links">
          <NavLink
            to="/register"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Register
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Login
          </NavLink>
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Products
          </NavLink>
          <NavLink
            to="/wishlist"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Wishlist {wishlistCount !== null && wishlistCount > 0 ? `(${wishlistCount})` : ''}
          </NavLink>
          <button type="button" onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
