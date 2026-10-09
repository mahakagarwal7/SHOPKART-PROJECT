import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register(){
  const [form,setForm] = useState({ fullName:'', email:'', password:'', phone:'' });
  const [error,setError] = useState('');
  const navigate = useNavigate();

  const onChange = e => setForm({...form, [e.target.name]: e.target.value});

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if(!form.fullName || !form.email || !form.password || !form.phone){
      setError('All fields are required');
      return;
    }
    if(form.password.length < 6){ setError('Password must be at least 6 chars'); return; }

    try {
      await api.post('/customers/register', form);
      navigate('/login');
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{maxWidth:420,margin:'40px auto'}}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <div><input name="fullName" placeholder="Full name" value={form.fullName} onChange={onChange} /></div>
        <div><input name="email" placeholder="Email" value={form.email} onChange={onChange} /></div>
        <div><input name="password" placeholder="Password" type="password" value={form.password} onChange={onChange} /></div>
        <div><input name="phone" placeholder="Phone" value={form.phone} onChange={onChange} /></div>
        <div><button type="submit">Create Account</button></div>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
    </div>
  );
}
