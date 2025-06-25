import React, { useState, useEffect } from 'react';

const PartnerDashboard = ({ partner }) => {
  const [section, setSection] = useState('home');
  const [consentForm, setConsentForm] = useState({
    virtualUserId: '',
    purpose: '',
    dataFields: '',
    duration: '',
  });
  const [consentLoading, setConsentLoading] = useState(false);
  const [consentMsg, setConsentMsg] = useState(null);
  const [consentErr, setConsentErr] = useState(null);

  // Loan requests state
  const [loans, setLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [loansErr, setLoansErr] = useState(null);

  // Approved consents state
  const [approvedConsents, setApprovedConsents] = useState([]);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [approvedErr, setApprovedErr] = useState(null);

  useEffect(() => {
    if (section === 'loans') {
      setLoansLoading(true);
      setLoansErr(null);
      fetch('http://localhost:5000/partner/loan-requests')
        .then(res => res.json())
        .then(data => {
          setLoans(data.loanRequests || []);
          setLoansLoading(false);
        })
        .catch(() => {
          setLoansErr('Failed to fetch loan requests');
          setLoansLoading(false);
        });
    }
    if (section === 'approved') {
      setApprovedLoading(true);
      setApprovedErr(null);
      fetch('http://localhost:5000/partner/consents-approved')
        .then(res => res.json())
        .then(data => {
          setApprovedConsents(data.consents || []);
          setApprovedLoading(false);
        })
        .catch(() => {
          setApprovedErr('Failed to fetch approved consents');
          setApprovedLoading(false);
        });
    }
  }, [section]);

  const handleConsentChange = (e) => {
    setConsentForm({ ...consentForm, [e.target.name]: e.target.value });
  };

  const handleConsentSubmit = async (e) => {
    e.preventDefault();
    setConsentLoading(true);
    setConsentMsg(null);
    setConsentErr(null);
    try {
      const res = await fetch('http://localhost:5000/partner/create-consent-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...consentForm,
          dataFields: consentForm.dataFields.split(',').map(f => f.trim()),
          duration: Number(consentForm.duration),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setConsentMsg('Consent request created successfully!');
        setConsentForm({ virtualUserId: '', purpose: '', dataFields: '', duration: '' });
      } else {
        setConsentErr(data.message || 'Failed to create consent request');
      }
    } catch (err) {
      setConsentErr('Network error');
    }
    setConsentLoading(false);
  };

  const renderSection = () => {
    switch (section) {
      case 'consent':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Generate Consent Request</h3>
            <form onSubmit={handleConsentSubmit} style={{ display: 'flex', flexDirection: 'column', width: 350, gap: 14 }}>
              <input
                name="virtualUserId"
                placeholder="Virtual User ID"
                value={consentForm.virtualUserId}
                onChange={handleConsentChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                name="purpose"
                placeholder="Purpose"
                value={consentForm.purpose}
                onChange={handleConsentChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                name="dataFields"
                placeholder="Data Fields (comma separated)"
                value={consentForm.dataFields}
                onChange={handleConsentChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <input
                name="duration"
                type="number"
                placeholder="Duration (days)"
                value={consentForm.duration}
                onChange={handleConsentChange}
                required
                style={{ padding: 10, fontSize: 16 }}
              />
              <button type="submit" disabled={consentLoading} style={{ padding: '10px 0', fontSize: 16, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}>
                {consentLoading ? 'Submitting...' : 'Create Consent Request'}
              </button>
            </form>
            {consentMsg && <div style={{ color: 'green', marginTop: 16 }}>{consentMsg}</div>}
            {consentErr && <div style={{ color: 'red', marginTop: 16 }}>{consentErr}</div>}
          </div>
        );
      case 'loans':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>View Loan Requests</h3>
            {loansLoading && <div>Loading...</div>}
            {loansErr && <div style={{ color: 'red' }}>{loansErr}</div>}
            {!loansLoading && !loansErr && loans.length === 0 && <div>No loan requests found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {loans.map((loan) => (
                <li key={loan._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>User:</b> {loan.userId?.name || loan.userId}</div>
                  <div><b>Purpose:</b> {loan.purpose}</div>
                  <div><b>Status:</b> {loan.status}</div>
                  <div><b>Created At:</b> {new Date(loan.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'approved':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>View Approved Consents</h3>
            {approvedLoading && <div>Loading...</div>}
            {approvedErr && <div style={{ color: 'red' }}>{approvedErr}</div>}
            {!approvedLoading && !approvedErr && approvedConsents.length === 0 && <div>No approved consents found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {approvedConsents.map((consent) => (
                <li key={consent._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Virtual User ID:</b> {consent.virtualUserId?.virtualId || consent.virtualUserId}</div>
                  <div><b>Purpose:</b> {consent.purpose}</div>
                  <div><b>Fields:</b> {consent.dataFields?.join(', ')}</div>
                  <div><b>Status:</b> {consent.status}</div>
                  <div><b>Approved At:</b> {consent.approvedAt ? new Date(consent.approvedAt).toLocaleString() : '-'}</div>
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', marginTop: 40 }}>
      <h2>Welcome, {partner?.name || 'Partner'}!</h2>
      <div style={{ color: '#555', marginBottom: 24 }}>{partner?.email}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
        <button onClick={() => setSection('consent')} style={{ padding: '16px 24px', fontSize: 16 }}>Generate Consent Request</button>
        <button onClick={() => setSection('loans')} style={{ padding: '16px 24px', fontSize: 16 }}>View Loan Requests</button>
        <button onClick={() => setSection('approved')} style={{ padding: '16px 24px', fontSize: 16 }}>View Approved Consents</button>
      </div>
      {renderSection()}
    </div>
  );
};

export default PartnerDashboard; 