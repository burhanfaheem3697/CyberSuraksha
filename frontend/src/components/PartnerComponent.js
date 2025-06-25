import React, { useState } from 'react';
import PartnerRegisterComponent from './PartnerRegisterComponent';
import PartnerDashboard from './PartnerDashboard';

const PartnerComponent = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loggedIn, setLoggedIn] = useState(false);
  const [partner, setPartner] = useState(null);
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
        setPartner(data.partner);
        setLoggedIn(true);
      } else {
        setLoginError(data.message || 'Login failed');
      }
    } catch (err) {
      setLoginError('Network error');
    }
  };

  if (showRegister) {
    return <PartnerRegisterComponent onBack={() => setShowRegister(false)} />;
  }

  if (loggedIn) {
    return <PartnerDashboard partner={partner} />;
  }

  return (
    <div>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <div style={{ fontWeight: 'bold', fontSize: 24 }}>CyberSuraksha</div>
        <div>
          <button style={{ marginRight: 16, padding: '8px 18px' }} onClick={() => setShowRegister(true)}>Register</button>
          <button style={{ padding: '8px 18px' }} onClick={() => window.location.reload()}>Back to Home</button>
        </div>
      </nav>

      {/* Hero Section with Login Form */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10vh' }}>
        <h2>Partner Login</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: 300, gap: 16 }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ padding: 10, fontSize: 16 }}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={{ padding: 10, fontSize: 16 }}
          />
          <button type="submit" style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>Login</button>
        </form>
        {loginError && <div style={{ color: 'red', marginTop: 16 }}>{loginError}</div>}
      </div>
    </div>
  );
};

export default PartnerComponent; 