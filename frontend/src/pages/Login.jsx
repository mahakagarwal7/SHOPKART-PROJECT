import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login(){
  const [form,setForm] = useState({ email:'', password:'' });
  const [error,setError] = useState('');
  const navigate = useNavigate();

  const onChange = e => setForm({...form, [e.target.name]: e.target.value});

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if(!form.email || !form.password){ setError('All fields are required'); return; }

    try {
      await api.post('/customers/login', form);
      navigate('/home');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid Credentials');
    }
  };

  return (
    <div style={{maxWidth:420,margin:'40px auto'}}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div><input name="email" placeholder="Email" value={form.email} onChange={onChange} /></div>
        <div><input name="password" placeholder="Password" type="password" value={form.password} onChange={onChange} /></div>
        <div><button type="submit">Login</button></div>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
    </div>
  );
}
