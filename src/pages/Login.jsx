import React, { useState, useEffect } from 'react';
import { loginUser, getCaptcha } from '../services/api';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const navigate = useNavigate();

  const fetchCaptcha = async () => {
    try {
      const { data } = await getCaptcha();
      setCaptchaId(data.captchaId);
      setCaptchaImage(data.image);
      setCaptchaAnswer('');
      setCaptchaError('');
    } catch (err) {
      console.error("Failed to load CAPTCHA", err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!captchaAnswer.trim()) {
      setCaptchaError('Please enter the CAPTCHA');
      return;
    }
    try {
      const { data } = await loginUser({ email, password, captchaId, captchaAnswer });
      // data now contains { token: "...", user: { role: "...", ... } }
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      navigate(`/dashboard/${data.user.role.toLowerCase()}`);
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message;
      if (errorMsg.includes("Invalid CAPTCHA") || err.response?.data?.error === "Internal Server Error") {
         alert("Invalid CAPTCHA. Please try again.");
      } else {
         alert("Invalid credentials or banned user");
      }
      fetchCaptcha(); // Refresh CAPTCHA on failure
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: '40px', border: '1px solid #000', borderRadius: '12px', background: '#fff' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: 600 }}>Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required style={{ margin: 0, border: '1px solid #e0e0e0' }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ margin: 0, border: '1px solid #e0e0e0' }} />
        
        {captchaImage && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <img src={captchaImage} alt="CAPTCHA" style={{ border: '1px solid #ccc', borderRadius: '4px', height: '50px' }} />
              <button type="button" onClick={fetchCaptcha} style={{ background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                Refresh
              </button>
            </div>
            <input 
              type="text" 
              placeholder="Enter CAPTCHA" 
              value={captchaAnswer} 
              onChange={e => {
                setCaptchaAnswer(e.target.value);
                setCaptchaError('');
              }} 
              required 
              style={{ margin: 0, border: captchaError ? '1px solid red' : '1px solid #e0e0e0' }} 
            />
            {captchaError && <span style={{ color: 'red', fontSize: '0.8rem' }}>{captchaError}</span>}
          </div>
        )}

        <button type="submit" style={{ marginTop: '10px', padding: '14px', fontSize: '1.05rem', background: '#000', color: '#fff', borderRadius: '8px', fontWeight: 600 }}>Login</button>
      </form>
    </div>
  );
}

export default Login;
