import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserComponent.css';

const RegisterComponent = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    fullname: '',
    avatar: '',
    email: '',
    password: '',
    phone: '',
    aadhaar: '',
    dataResidency: '',
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
      const res = await fetch('http://localhost:5000/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Registration successful! Check your email to verify your account.');
        setForm({ username: '', fullname: '', avatar: '', email: '', password: '', phone: '', aadhaar: '', dataResidency: '' });
        setTimeout(() => {
          navigate('/user');
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
          <i className="fa-solid fa-user-plus"></i>
        </div>
        <div className="user-title">User Registration</div>
        <div className="user-subtitle">Create your account</div>
        <form className="user-form user-form-grid" onSubmit={handleSubmit}>
          <div className="user-form-row">
            <input className="user-input" name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
            <input className="user-input" name="fullname" placeholder="Full Name" value={form.fullname} onChange={handleChange} required />
          </div>
          <div className="user-form-row">
            {/* <input className="user-input" name="avatar" placeholder="Avatar URL (optional)" value={form.avatar} onChange={handleChange} /> */}
            <input className="user-input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="user-form-row">
            <input className="user-input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
            <input className="user-input" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
          </div>
          <div className="user-form-row">
            <input className="user-input" name="aadhaar" placeholder="Aadhaar" value={form.aadhaar} onChange={handleChange} />
            <input className="user-input" name="dataResidency" placeholder="Data Residency" value={form.dataResidency} onChange={handleChange} />
          </div>
          <button className="user-btn" type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
          <button type="button" className="user-link" onClick={() => navigate('/user')}>Back to Login</button>
        </form>
        {message && <div className="user-success">{message}</div>}
        {error && <div className="user-error">{error}</div>}
      </div>
    </div>
  );
};

export default RegisterComponent; 