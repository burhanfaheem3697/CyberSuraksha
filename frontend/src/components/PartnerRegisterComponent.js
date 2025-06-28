import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserComponent.css';

const PartnerRegisterComponent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    description: '',
    purpose: '',
    trustScore: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/partner/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Registration successful! Your API key: ' + data.apiKey);
        setForm({ name: '', email: '', password: '', description: '', purpose: '', trustScore: '' });
        setTimeout(() => {
          navigate('/partner');
        }, 3000);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="user-bg">
      <div className="user-card user-card-wide">
        <div className="user-logo">
          <i className="fa-solid fa-handshake"></i>
        </div>
        <div className="user-title">Partner Registration</div>
        <div className="user-subtitle">Create your partner account</div>
        <form className="user-form user-form-grid" onSubmit={handleSubmit}>
          <div className="user-form-row">
            <input className="user-input" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <input className="user-input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="user-form-row">
            <input className="user-input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            <input className="user-input" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          </div>
          <div className="user-form-row">
            <input className="user-input" name="purpose" placeholder="Purpose" value={form.purpose} onChange={handleChange} />
            <input className="user-input" name="trustScore" type="number" placeholder="Trust Score" value={form.trustScore} onChange={handleChange} />
          </div>
          <button className="user-btn" type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <button type="button" className="user-link" onClick={() => navigate('/partner')}>Back to Login</button>
        </form>
        {message && <div className="user-success">{message}</div>}
        {error && <div className="user-error">{error}</div>}
      </div>
    </div>
  );
};

export default PartnerRegisterComponent; 