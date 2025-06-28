import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserComponent.css';

const BankComponent = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/bank/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/bank/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="user-bg">
      <div className="user-card">
        <div className="user-logo">
          <i className="fa-solid fa-building-columns"></i>
        </div>
        <div className="user-title">Bank Login</div>
        <div className="user-subtitle">Sign in to your bank account</div>
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
          <button 
            className="user-btn"
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {error && <div className="user-error">{error}</div>}
        <div style={{ marginTop: 24 }}>
          <button className="user-link" onClick={() => navigate('/bank/register')}>Register</button>
          <button className="user-link" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    </div>
  );
};

export default BankComponent; 