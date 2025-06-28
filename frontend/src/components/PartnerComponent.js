import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserComponent.css';

const PartnerComponent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('http://localhost:5000/partner/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        // Redirect to dashboard page after successful login
        window.location.href = '/partner/dashboard';
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error');
    }
  };

  return (
    <div className="user-bg">
      <div className="user-card">
        <div className="user-logo">
          <i className="fa-solid fa-handshake"></i>
        </div>
        <div className="user-title">Partner Login</div>
        <div className="user-subtitle">Sign in to your partner account</div>
        <form className="user-form" onSubmit={handleSubmit}>
          <input
            className="user-input"
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="user-input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button className="user-btn" type="submit">Login</button>
        </form>
        {loginError && <div className="user-error">{loginError}</div>}
        <div style={{ marginTop: 24 }}>
          <button className="user-link" onClick={() => navigate('/partner/register')}>Register</button>
          <button className="user-link" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default PartnerComponent; 