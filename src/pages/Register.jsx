import React, { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'TOURIST' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      alert("Registered successfully!");
      navigate('/login');
    } catch (err) {
      alert("Registration failed.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '40px', border: '1px solid #000', borderRadius: '12px', background: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 600 }}>Create an Account</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required style={{ margin: 0, border: '1px solid #e0e0e0' }} />
        <input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required style={{ margin: 0, border: '1px solid #e0e0e0' }} />
        <input type="password" placeholder="Secure Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required style={{ margin: 0, border: '1px solid #e0e0e0' }} />
        <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} style={{ margin: 0, border: '1px solid #e0e0e0', padding: '12px', borderRadius: '8px' }}>
          <option value="TOURIST">Tourist (Book Stays & Guides)</option>
          <option value="HOST">Host (List Properties)</option>
          <option value="GUIDE">Local Guide (List Services)</option>
        </select>
        <button type="submit" style={{ marginTop: '10px', padding: '14px', fontSize: '1.05rem', background: '#000', color: '#fff', borderRadius: '8px', fontWeight: 600 }}>Register Now</button>
      </form>
    </div>
  );
}

export default Register;
