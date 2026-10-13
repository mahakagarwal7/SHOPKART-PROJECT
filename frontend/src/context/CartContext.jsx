import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Fetch cart from backend on mount
  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/cart');
      if (res.data?.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      }
    } catch (err) {
      // If 401 unauthenticated, keep empty cart without throwing error
      if (err.response?.status !== 401) {
        console.error('Fetch cart error:', err);
        setError('Unable to load your cart.');
      }
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Add product to cart
  const addToCart = async (productId) => {
    setActionLoadingId(productId);
    try {
      const res = await api.post(`/cart/${productId}`);
      if (res.data?.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      }
      return { success: true, message: res.data?.message || 'Added to cart' };
    } catch (err) {
      console.error('Add to cart error:', err);
      const message = err.response?.data?.message || 'Failed to add to cart';
      return { success: false, message, status: err.response?.status };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Update product quantity in cart
  const updateQuantity = async (productId, quantity) => {
    setActionLoadingId(productId);
    try {
      const res = await api.patch(`/cart/${productId}`, { quantity });
      if (res.data?.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      }
      return { success: true };
    } catch (err) {
      console.error('Update quantity error:', err);
      const message = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Remove product from cart
  const removeFromCart = async (productId) => {
    setActionLoadingId(productId);
    try {
      const res = await api.delete(`/cart/${productId}`);
      if (res.data?.success && Array.isArray(res.data.cart)) {
        setCartItems(res.data.cart);
      }
      return { success: true };
    } catch (err) {
      console.error('Remove from cart error:', err);
      const message = err.response?.data?.message || 'Failed to remove from cart';
      return { success: false, message };
    } finally {
      setActionLoadingId(null);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCartItems([]);
      return { success: true };
    } catch (err) {
      console.error('Clear cart error:', err);
      return { success: false };
    }
  };

  // Reset in-memory cart state (e.g. on customer logout) without wiping DB
  const resetCart = () => {
    setCartItems([]);
    setError('');
  };

  // Derived Values
  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * (item.quantity || 0),
    0
  );

  const isInCart = (productId) => {
    return cartItems.some((item) => item.product?._id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find((item) => item.product?._id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        actionLoadingId,
        totalItems,
        subtotal,
        isInCart,
        getItemQuantity,
        fetchCart,
        resetCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
