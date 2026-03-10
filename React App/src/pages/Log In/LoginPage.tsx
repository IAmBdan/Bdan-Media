// ── LoginPage.tsx ─────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/login`,
        { email, password }
      );
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate(`/profile/${user.username}`);
    } catch (error) {
      console.error('Login error:', error);
      alert('Invalid email or password');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0d0d0d', border: '1px solid #181818', borderRadius: '4px', padding: '48px 40px' }}
      >
        <p style={{ fontFamily: 'Montserrat', fontSize: '0.6rem', fontWeight: 600, letterSpacing: '0.26em', color: '#4db0f2', textTransform: 'uppercase', margin: '0 0 12px' }}>
          Welcome back
        </p>
        <h1 style={{ fontFamily: 'Azonix, sans-serif', fontSize: '1.8rem', color: '#fff', margin: '0 0 8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Sign In
        </h1>
        <div style={{ width: 32, height: 2, background: '#4db0f2', marginBottom: 36 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ padding: '12px 14px', background: '#0a0a0a', color: '#c0c0c0', border: '1px solid #181818', borderRadius: 3, fontFamily: 'Montserrat', fontSize: '0.8rem', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = '#4db0f2'}
            onBlur={(e) => e.target.style.borderColor = '#181818'}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ padding: '12px 14px', background: '#0a0a0a', color: '#c0c0c0', border: '1px solid #181818', borderRadius: 3, fontFamily: 'Montserrat', fontSize: '0.8rem', outline: 'none', transition: 'border-color 0.2s' }}
            onFocus={(e) => e.target.style.borderColor = '#4db0f2'}
            onBlur={(e) => e.target.style.borderColor = '#181818'}
          />
          <button
            onClick={handleLogin}
            style={{ padding: '13px', background: '#0d0d0d', color: '#a6d7f8', border: '1px solid #4db0f2', borderRadius: 3, fontFamily: 'Montserrat', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', marginTop: 8, transition: 'background 0.2s, color 0.2s' }}
            onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0f1f2e'; (e.currentTarget as HTMLButtonElement).style.color = '#fff'; }}
            onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#0d0d0d'; (e.currentTarget as HTMLButtonElement).style.color = '#a6d7f8'; }}
          >
            Sign In
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;