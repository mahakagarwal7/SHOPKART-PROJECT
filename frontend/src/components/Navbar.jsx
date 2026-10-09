import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Navbar(){
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      // ignore
    } finally {
      navigate('/login');
    }
  };

  return (
    <nav style={{padding:10,display:'flex',gap:10}}>
      <Link to="/register">Register</Link>
      <Link to="/login">Login</Link>
      <Link to="/home">Home</Link>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}
