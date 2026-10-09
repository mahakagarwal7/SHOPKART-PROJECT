import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Home(){
  const [user,setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api.get('/customers/me')
      .then(res => { if(mounted) setUser(res.data); })
      .catch(err => { navigate('/login'); });
    return () => mounted = false;
  }, [navigate]);

  if(!user) return <div>Loading...</div>;

  return (
    <div style={{padding:20}}>
      <h1>Welcome, {user.fullName}</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>
    </div>
  );
}
