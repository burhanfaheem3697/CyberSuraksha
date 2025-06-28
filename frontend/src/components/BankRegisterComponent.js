import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserComponent.css';

const BankRegisterComponent = () => {
  const [form, setForm] = useState({
    name: '',
    bankCode: '',
    email: '',
    password: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/bank/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Registration successful! Please check your email for verification.');
        setForm({ name: '', bankCode: '', email: '', password: '', description: '' });
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
          <i className="fa-solid fa-building-columns"></i>
        </div>
        <div className="user-title">Bank Registration</div>
        <div className="user-subtitle">Create your bank account</div>
        <form className="user-form user-form-grid" onSubmit={handleSubmit}>
          <div className="user-form-row">
            <input className="user-input" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <input className="user-input" name="bankCode" placeholder="Bank Code" value={form.bankCode} onChange={handleChange} required />
          </div>
          <div className="user-form-row">
            <input className="user-input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input className="user-input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="user-form-row">
            <input className="user-input" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
          </div>
          <button className="user-btn" type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <button type="button" className="user-link" onClick={() => navigate('/bank')}>Back to Login</button>
        </form>
        {message && <div className="user-success">{message}</div>}
        {error && <div className="user-error">{error}</div>}
      </div>
    </div>
  );
};

export default BankRegisterComponent; 