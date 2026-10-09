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

  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '' });
  const [pwdMsg, setPwdMsg] = useState({ error: '', success: '' });

  const onPwdChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    setPwdMsg({ error: '', success: '' });
    try {
      const res = await api.patch('/customers/change-password', passwords);
      setPwdMsg({ error: '', success: res.data?.message || 'Password changed successfully' });
      setPasswords({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setPwdMsg({ error: err.response?.data?.message || 'Failed to change password', success: '' });
    }
  };

  if(!user) return <div>Loading...</div>;

  return (
    <div style={{padding:20, maxWidth:500, margin:'20px auto'}}>
      <h1>Welcome, {user.fullName}</h1>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Phone:</strong> {user.phone}</p>

      <hr style={{margin: '20px 0'}} />

      <h3>Change Password (Bonus Challenge)</h3>
      <form onSubmit={submitPasswordChange}>
        <div style={{marginBottom: 10}}>
          <input
            name="oldPassword"
            type="password"
            placeholder="Old Password"
            value={passwords.oldPassword}
            onChange={onPwdChange}
            required
            style={{width: '100%', padding: 8}}
          />
        </div>
        <div style={{marginBottom: 10}}>
          <input
            name="newPassword"
            type="password"
            placeholder="New Password (min 6 chars)"
            value={passwords.newPassword}
            onChange={onPwdChange}
            required
            style={{width: '100%', padding: 8}}
          />
        </div>
        <button type="submit" style={{padding: '8px 16px'}}>Update Password</button>
      </form>
      {pwdMsg.success && <div style={{color:'green', marginTop:10}}>{pwdMsg.success}</div>}
      {pwdMsg.error && <div style={{color:'red', marginTop:10}}>{pwdMsg.error}</div>}
    </div>
  );
}
