import React, { useState } from 'react';

const PartnerRegisterComponent = ({ onBack }) => {
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
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '8vh' }}>
      <h2>Partner Registration</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: 350, gap: 14 }}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required style={{ padding: 10, fontSize: 16 }} />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ padding: 10, fontSize: 16 }} />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{ padding: 10, fontSize: 16 }} />
        <input name="description" placeholder="Description" value={form.description} onChange={handleChange} style={{ padding: 10, fontSize: 16 }} />
        <input name="purpose" placeholder="Purpose" value={form.purpose} onChange={handleChange} style={{ padding: 10, fontSize: 16 }} />
        <input name="trustScore" type="number" placeholder="Trust Score" value={form.trustScore} onChange={handleChange} style={{ padding: 10, fontSize: 16 }} />
        <button type="submit" disabled={loading} style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <button type="button" onClick={onBack} style={{ marginTop: 8, background: 'none', color: '#1976d2', border: 'none', cursor: 'pointer' }}>Back to Login</button>
      </form>
      {message && <div style={{ color: 'green', marginTop: 16 }}>{message}</div>}
      {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
    </div>
  );
};

export default PartnerRegisterComponent; 