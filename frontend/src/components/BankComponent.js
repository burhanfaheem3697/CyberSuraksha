import React, { useState } from 'react';
import BankRegisterComponent from './BankRegisterComponent';
import BankDashboard from './BankDashboard';

const BankComponent = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loggedIn, setLoggedIn] = useState(false);
  const [bank, setBank] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/bank/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setBank(data.bank);
        setLoggedIn(true);
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  if (showRegister) {
    return <BankRegisterComponent onBack={() => setShowRegister(false)} />;
  }

  if (loggedIn) {
    return <BankDashboard bank={bank} />;
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
        <h2>Bank Login</h2>
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
      </div>
    </div>
  );
};

export default BankComponent; 