import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';

const BankDashboard = () => {
  const [section, setSection] = useState('home');
  const [bank, setBank] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/bank/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }
    navigate('/bank');
  };

  // Approved consents state
  const [approvedConsents, setApprovedConsents] = useState([]);
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [approvedErr, setApprovedErr] = useState(null);

  // Upload data form state
  const [uploadForm, setUploadForm] = useState({
    consentId: '',
    virtualUserId: '',
    partnerId: '',
    purpose: '',
    retentionDays: '',
    data: '', // JSON string
  });
  const [selectedFields, setSelectedFields] = useState([]);
  const [fetchingUserData, setFetchingUserData] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [uploadErr, setUploadErr] = useState(null);

  // Bank audit logs state
  const [bankAuditLogs, setBankAuditLogs] = useState([]);
  const [bankAuditLogsLoading, setBankAuditLogsLoading] = useState(false);
  const [bankAuditLogsErr, setBankAuditLogsErr] = useState(null);

  // Bank contracts state
  const [bankContracts, setBankContracts] = useState([]);
  const [bankContractsLoading, setBankContractsLoading] = useState(false);
  const [bankContractsErr, setBankContractsErr] = useState(null);

  useEffect(() => {
    if (section === 'approved') {
      setApprovedLoading(true);
      setApprovedErr(null);
      fetch('http://localhost:5000/consent/approved-for-bank', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setApprovedConsents(data.consents || []);
          setApprovedLoading(false);
        })
        .catch(() => {
          setApprovedErr('Failed to fetch approved consents');
          setApprovedLoading(false);
        });
    } else if (section === 'auditlogs') {
      setBankAuditLogsLoading(true);
      setBankAuditLogsErr(null);
      fetch('http://localhost:5000/bankauditlog/all', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setBankAuditLogs(data.logs || []);
          setBankAuditLogsLoading(false);
        })
        .catch(() => {
          setBankAuditLogsErr('Failed to fetch bank audit logs');
          setBankAuditLogsLoading(false);
        });
    } else if (section === 'contracts') {
      setBankContractsLoading(true);
      setBankContractsErr(null);
      fetch('http://localhost:5000/contract/bank', {
        credentials: 'include',
      })
        .then(res => res.json())
        .then(data => {
          setBankContracts(data.contracts || []);
          setBankContractsLoading(false);
        })
        .catch(() => {
          setBankContractsErr('Failed to fetch contracts');
          setBankContractsLoading(false);
        });
    }
  }, [section]);

  const handleUploadChange = (e) => {
    setUploadForm({ ...uploadForm, [e.target.name]: e.target.value });
  };

  const handleFieldCheckbox = (e) => {
    const { value, checked } = e.target;
    setSelectedFields((prev) =>
      checked ? [...prev, value] : prev.filter((f) => f !== value)
    );
  };

  const handleFetchUserData = async (e) => {
    e.preventDefault();
    if (!uploadForm.virtualUserId || selectedFields.length === 0) {
      alert('Please enter Virtual User ID and select at least one field.');
      return;
    }
    setFetchingUserData(true);
    try {
      const res = await fetch('http://localhost:5000/userbankdata/fetch-by-virtual-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          virtualUserId: uploadForm.virtualUserId,
          fields: selectedFields,
        }),
      });
      const result = await res.json();
      if (res.ok) {
        setUploadForm((form) => ({
          ...form,
          data: JSON.stringify(result.data, null, 2),
        }));
      } else {
        alert(result.message || 'Failed to fetch user data');
      }
    } catch (err) {
      alert('Network error');
    }
    setFetchingUserData(false);
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
      const res = await fetch('http://localhost:5000/contract/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...uploadForm,
          allowedFields: selectedFields,
          data: parsedData,
        }),
        credentials : 'include'
      });
      const data = await res.json();
      if (res.ok) {
        setUploadMsg('Contract created successfully!');
        setUploadForm({ consentId: '', virtualUserId: '', partnerId: '', purpose: '', retentionDays: '', data: '' });
        setSelectedFields([]);
      } else {
        setUploadErr(data.message || 'Failed to create contract');
      }
    } catch (err) {
      setUploadErr('Network error');
    }
    setUploadLoading(false);
  };

  const renderSection = () => {
    switch (section) {
      case 'upload':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Contract Form</h3>
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
              <input
                name="retentionDays"
                type="number"
                placeholder="Retention Days"
                value={uploadForm.retentionDays}
                onChange={handleUploadChange}
                style={{ padding: 10, fontSize: 16 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label><b>Select Data Fields to Fetch:</b></label>
                <label>
                  <input
                    type="checkbox"
                    value="income"
                    checked={selectedFields.includes('income')}
                    onChange={handleFieldCheckbox}
                  />{' '}
                  Income
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="txn_summary"
                    checked={selectedFields.includes('txn_summary')}
                    onChange={handleFieldCheckbox}
                  />{' '}
                  Transaction Summary
                </label>
                <button
                  type="button"
                  onClick={handleFetchUserData}
                  disabled={fetchingUserData}
                  style={{ marginTop: 8, padding: '8px 0', fontSize: 15 }}
                >
                  {fetchingUserData ? 'Fetching...' : 'Fetch Data'}
                </button>
              </div>
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
                {uploadLoading ? 'Creating Contract...' : 'Create Contract'}
              </button>
            {uploadMsg && <div style={{ color: 'green', marginTop: 16 }}>{uploadMsg}</div>}
            {uploadErr && <div style={{ color: 'red', marginTop: 16 }}>{uploadErr}</div>}
            </form>
          </div>
        );
      case 'approved':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Approved Consents</h3>
            {approvedLoading && <div>Loading...</div>}
            {approvedErr && <div style={{ color: 'red' }}>{approvedErr}</div>}
            {!approvedLoading && !approvedErr && approvedConsents.length === 0 && <div>No approved consents found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {approvedConsents.map((consent) => (
                <li key={consent._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Consent ID:</b> {consent._id}</div>
                  <div><b>Virtual User ID:</b> {consent.virtualUserId}</div>
                  <div><b>Partner Id:</b> {consent.partnerId}</div>
                  <div><b>Purpose:</b> {consent.purpose}</div>
                  <div><b>Fields:</b> {consent.dataFields?.join(', ')}</div>
                  <div><b>Status:</b> {consent.status}</div>
                  <div><b>Duration:</b> {consent.duration}</div>
                  <div><b>createdAt:</b> {consent.approvedAt ? new Date(consent.approvedAt).toLocaleString() : '-'}</div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'auditlogs':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>Bank Audit Logs</h3>
            {bankAuditLogsLoading && <div>Loading...</div>}
            {bankAuditLogsErr && <div style={{ color: 'red' }}>{bankAuditLogsErr}</div>}
            {!bankAuditLogsLoading && !bankAuditLogsErr && bankAuditLogs.length === 0 && <div>No audit logs found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {bankAuditLogs.map((log) => (
                <li key={log._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Action:</b> {log.action}</div>
                  <div><b>Virtual User ID:</b> {log.virtualUserId}</div>
                  <div><b>Partner ID:</b> {log.partnerId}</div>
                  <div><b>Purpose:</b> {log.purpose}</div>
                  <div><b>Status:</b> {log.status}</div>
                  <div><b>Timestamp:</b> {new Date(log.timestamp).toLocaleString()}</div>
                  <div><b>Context:</b> <pre style={{ margin: 0 }}>{JSON.stringify(log.context, null, 2)}</pre></div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'contracts':
        return (
          <div style={{ marginTop: 32 }}>
            <h3>All Contracts</h3>
            {bankContractsLoading && <div>Loading...</div>}
            {bankContractsErr && <div style={{ color: 'red' }}>{bankContractsErr}</div>}
            {!bankContractsLoading && !bankContractsErr && bankContracts.length === 0 && <div>No contracts found.</div>}
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {bankContracts.map((contract) => (
                <li key={contract._id} style={{ border: '1px solid #ddd', borderRadius: 6, margin: '12px 0', padding: 16 }}>
                  <div><b>Contract ID:</b> {contract._id}</div>
                  <div><b>Partner ID:</b> {contract.partnerId}</div>
                  <div><b>Virtual User ID:</b> {contract.virtualUserId}</div>
                  <div><b>Purpose:</b> {contract.purpose}</div>
                  <div><b>Status:</b> {contract.status}</div>
                  <div><b>Allowed Fields:</b> {contract.allowedFields && contract.allowedFields.join(', ')}</div>
                  <div><b>Created At:</b> {new Date(contract.createdAt).toLocaleString()}</div>
                  <div><b>Documents:</b> <pre style={{ margin: 0 }}>{JSON.stringify(contract.documents, null, 2)}</pre></div>
                </li>
              ))}
            </ul>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '20vh' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', marginTop: '20vh', color: 'red' }}>{error}</div>;
  }

  return (
    <div className="dashboard-bg">
      <nav className="dashboard-navbar">
        <div className="dashboard-logo">CyberSuraksha</div>
        <div>
          <button className="dashboard-link" onClick={handleLogout}>Logout</button>
        </div>
      </nav>
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="dashboard-avatar">
            <i className="fa-solid fa-building-columns"></i>
          </div>
          <div className="dashboard-title">Welcome, {bank?.name || 'Bank'}!</div>
          <div className="dashboard-email">{bank?.email}</div>
        </div>
        <div className="dashboard-menu">
          <button className={`dashboard-menu-btn${section === 'upload' ? ' active' : ''}`} onClick={() => setSection('upload')}>Create Contract</button>
          <button className={`dashboard-menu-btn${section === 'approved' ? ' active' : ''}`} onClick={() => setSection('approved')}>View Approved Consents</button>
          <button className={`dashboard-menu-btn${section === 'auditlogs' ? ' active' : ''}`} onClick={() => setSection('auditlogs')}>View Bank Audit Logs</button>
          <button className={`dashboard-menu-btn${section === 'contracts' ? ' active' : ''}`} onClick={() => setSection('contracts')}>View All Contracts</button>
        </div>
        <div className="dashboard-section">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default BankDashboard; 