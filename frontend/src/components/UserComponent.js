import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserComponent.css';

const UserComponent = () => {
  const navigate = useNavigate();
  const [showForgot, setShowForgot] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState(null);
  const [forgotError, setForgotError] = useState(null);
  const [loginError, setLoginError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('http://localhost:5000/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        // Redirect to dashboard page after successful login
        window.location.href = '/user/dashboard';
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg(null);
    setForgotError(null);
    try {
      const res = await fetch('http://localhost:5000/user/forgotPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg('Password reset email sent! Check your inbox.');
        setForgotEmail('');
      } else {
        setForgotError(data.message || 'Failed to send reset email');
      }
    } catch (err) {
      setForgotError('Network error');
    }
  };

  return (
    <div className="user-bg">
      <div className="user-card">
        <div className="user-logo">
          <i className="fa-solid fa-user"></i>
        </div>
        {!showForgot ? (
          <>
            <div className="user-title">User Login</div>
            <div className="user-subtitle">Sign in to your account</div>
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
            <button className="user-link" onClick={() => setShowForgot(true)}>Forgot Password?</button>
            {loginError && <div className="user-error">{loginError}</div>}
            <div style={{ marginTop: 24 }}>
              <button className="user-link" onClick={() => navigate('/user/register')}>Register</button>
              <button className="user-link" onClick={() => navigate('/')}>Back to Home</button>
            </div>
          </>
        ) : (
          <>
            <div className="user-title">Forgot Password</div>
            <div className="user-subtitle">Enter your email to reset password</div>
            <form className="user-form" onSubmit={handleForgotSubmit}>
              <input
                className="user-input"
                type="email"
                name="forgotEmail"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                required
              />
              <button className="user-btn" type="submit">Send Reset Email</button>
            </form>
            <button className="user-link" onClick={() => setShowForgot(false)}>Back to Login</button>
            {forgotMsg && <div className="user-success">{forgotMsg}</div>}
            {forgotError && <div className="user-error">{forgotError}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default UserComponent; 