import React, { useState, useEffect } from 'react';

const BankDashboard = ({ bank }) => {
  const [section, setSection] = useState('home');

  // Pending consents state
  const [pendingConsents, setPendingConsents] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingErr, setPendingErr] = useState(null);

  // Upload data form state
  const [uploadForm, setUploadForm] = useState({
    consentId: '',
    virtualUserId: '',
    partnerId: '',
    purpose: '',
    data: '', // JSON string
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [uploadErr, setUploadErr] = useState(null);

  useEffect(() => {
    if (section === 'pending') {
      setPendingLoading(true);
      setPendingErr(null);
      fetch('http://localhost:5000/bank/pending-consents')
        .then(res => res.json())
        .then(data => {
          setPendingConsents(data.consents || []);
          setPendingLoading(false);
        })
        .catch(() => {
          setPendingErr('Failed to fetch pending consents');
          setPendingLoading(false);
        });
    }
  }, [section]);

  const handleUploadChange = (e) => {
    setUploadForm({ ...uploadForm, [e.target.name]: e.target.value });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadLoading(true);
    setUploadMsg(null);
    setUploadErr(null);
    let parsedData = null;
    try {
      parsedData = JSON.parse(uploadForm.data);
    } catch (err) {
      setUploadErr('Data must be valid JSON');
      setUploadLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/bank/upload-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...uploadForm,
          data: parsedData,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUploadMsg('Data uploaded successfully!');
        setUploadForm({ consentId: '', virtualUserId: '', partnerId: '', purpose: '', data: '' });
      } else {
        setUploadErr(data.message || 'Failed to upload data');
      }
    } catch (err) {
      setUploadErr('Network error');
    }
    setUploadLoading(false);
  };

  const renderSection = () => {
    switch (section) {
      case 'pending':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>View Pending Consents</h3>
            {pendingLoading && <div>Loading...</div>}
            {pendingErr && <div style={{ color: 'red' }}>{pendingErr}</div>}
            {!pendingLoading && !pendingErr && pendingConsents.length === 0 && <div>No pending consents found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {pendingConsents.map((consent) => (
                <li key={consent._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Virtual User ID:</b> {consent.virtualUserId?.virtualId || consent.virtualUserId}</div>
                  <div><b>Partner:</b> {consent.partnerId?.name || consent.partnerId}</div>
                  <div><b>Purpose:</b> {consent.purpose}</div>
                  <div><b>Status:</b> {consent.status}</div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'upload':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Upload Data</h3>
            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', width: 350, gap: 14 }}>
              <input
                name="consentId"
                placeholder="Consent ID"
                value={uploadForm.consentId}
                onChange={handleUploadChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                name="virtualUserId"
                placeholder="Virtual User ID"
                value={uploadForm.virtualUserId}
                onChange={handleUploadChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                name="partnerId"
                placeholder="Partner ID"
                value={uploadForm.partnerId}
                onChange={handleUploadChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                name="purpose"
                placeholder="Purpose"
                value={uploadForm.purpose}
                onChange={handleUploadChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <textarea
                name="data"
                placeholder="Data (JSON)"
                value={uploadForm.data}
                onChange={handleUploadChange}
                required
                rows={5}
                style={{ padding: 10, fontSize: 16 }}
              />
              <button type="submit" disabled={uploadLoading} style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
                {uploadLoading ? 'Uploading...' : 'Upload Data'}
              </button>
            </form>
            {uploadMsg && <div style={{ color: 'green', marginTop: 16 }}>{uploadMsg}</div>}
            {uploadErr && <div style={{ color: 'red', marginTop: 16 }}>{uploadErr}</div>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', marginTop: 40 }}>
      <h2>Welcome, {bank?.name || 'Bank'}!</h2>
      <div style={{ color: '#555', marginBottom: 24 }}>{bank?.email}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <button onClick={() => setSection('pending')} style={{ padding: '16px 24px', fontSize: 16 }}>View Pending Consents</button>
        <button onClick={() => setSection('upload')} style={{ padding: '16px 24px', fontSize: 16 }}>Upload Data</button>
      </div>
      {renderSection()}
    </div>
  );
};

export default BankDashboard; 