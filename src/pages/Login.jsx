import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await loginUser({ email, password });
      // data now contains { token: "...", user: { role: "...", ... } }
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      navigate(`/dashboard/${data.user.role.toLowerCase()}`);
    } catch (err) {
      alert("Invalid credentials or banned user");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '40px', border: '1px solid #000', borderRadius: '12px', background: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 600 }}>Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={{ margin: 0, border: '1px solid #e0e0e0' }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ margin: 0, border: '1px solid #e0e0e0' }} />
        <button type="submit" style={{ marginTop: '10px', padding: '14px', fontSize: '1.05rem', background: '#000', color: '#fff', borderRadius: '8px', fontWeight: 600 }}>Login</button>
      </form>
    </div>
  );
}

export default Login;
