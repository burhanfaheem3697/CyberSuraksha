import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConsentDraftList = ({ virtualUserId }) => {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDraft, setSelectedDraft] = useState(null);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/consent-draft/partner', { withCredentials: true });
      setDrafts(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) return;
    try {
      await axios.delete(`http://localhost:5000/consent-draft/${id}`, { withCredentials: true });
      fetchDrafts();
      alert('Draft deleted successfully.');
    } catch {
      alert('Failed to delete draft.');
    }
  };

  const handleValidate = async (id) => {
    try {
      const res = await axios.post(`http://localhost:5000/consent-draft/validate/${id}`, {}, { withCredentials: true });
      alert(res.data.data.validation.approved ? 'Validation successful.' : `Validation failed: ${res.data.data.validation.reason}`);
      fetchDrafts();
    } catch {
      alert('Validation error.');
    }
  };

  const handleFinalize = async (id) => {
    try {
      await axios.post(`http://localhost:5000/consent-draft/finalize/${id}`, {}, { withCredentials: true });
      alert('Consent finalized successfully.');
      fetchDrafts();
    } catch {
      alert('Finalization error.');
    }
  };

  const handleSendApproval = async (id) => {
    try {
      await axios.post(`http://localhost:5000/consent/send-approval/${id}`, {}, { withCredentials: true });
      alert('Approval notification sent successfully.');
      fetchDrafts();
    } catch {
      alert('Failed to send approval notification.');
    }
  };

  const getBadge = (status) => {
    const colorMap = {
      DRAFT: '#9e9e9e',
      RULE_REJECTED: '#ef5350',
      LLM_REJECTED: '#ff9800',
      VALIDATED: '#66bb6a',
      FINALIZED: '#1976d2'
    };
    return (
      <span style={{
        backgroundColor: colorMap[status] || '#ccc',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        {status}
      </span>
    );
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 40 }}>Loading drafts...</div>;
  if (error) return <div style={{ backgroundColor: '#ffebee', padding: 12, borderRadius: 4, color: '#c62828' }}>{error}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ fontSize: 20 }}>Consent Drafts</h3>
        <button onClick={fetchDrafts} style={{ padding: '8px 16px', border: '1px solid #1976d2', borderRadius: 6, color: '#1976d2', background: 'white', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {drafts.length === 0 ? (
        <div style={{ padding: 12, backgroundColor: '#e3f2fd', borderRadius: 4, color: '#1976d2' }}>
          No consent drafts found. Create a new one to get started.
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f1f1f1' }}>
            <tr>
              <th style={th}>Purpose</th>
              <th style={th}>Category</th>
              <th style={th}>Status</th>
              <th style={th}>Created</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((draft) => (
              <tr key={draft._id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={td}>{draft.rawPurpose.length > 40 ? draft.rawPurpose.slice(0, 40) + '…' : draft.rawPurpose}</td>
                <td style={td}>{draft.mainCategory || '-'}</td>
                <td style={td}>{getBadge(draft.status)}</td>
                <td style={td}>{new Date(draft.createdAt).toLocaleDateString()}</td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={viewBtn} onClick={() => setSelectedDraft(draft)}>👁️</button>
                    {draft.status === 'FINALIZED' && (
                      <button style={btnBlue} onClick={() => handleSendApproval(draft._id)}>Send</button>
                    )}
                    {['DRAFT', 'RULE_REJECTED', 'LLM_REJECTED'].includes(draft.status) && (
                      <button style={btnGreen} onClick={() => handleValidate(draft._id)}>✔️</button>
                    )}
                    {draft.status === 'VALIDATED' && (
                      <button style={btnBlue} onClick={() => handleFinalize(draft._id)}>✅</button>
                    )}
                    {draft.status !== 'FINALIZED' && (
                      <button style={btnRed} onClick={() => handleDelete(draft._id)}>🗑️</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedDraft && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ marginTop: 0 }}>Consent Draft Details</h3>
            <div style={{ marginBottom: 16 }}>{getBadge(selectedDraft.status)}</div>
            <p><b>Purpose:</b> {selectedDraft.rawPurpose}</p>
            <p><b>Justification:</b> {selectedDraft.justification}</p>
            <p><b>Category:</b> {selectedDraft.mainCategory} / {selectedDraft.subCategory || '-'}</p>
            <p><b>Fields:</b> {selectedDraft.dataFields.join(', ')}</p>
            <p><b>Duration:</b> {selectedDraft.duration} days</p>
            <p><b>Data Residency:</b> {selectedDraft.dataResidency}</p>
            <p><b>Cross Border:</b> {selectedDraft.crossBorder ? 'Yes' : 'No'}</p>
            <p><b>Quantum Safe:</b> {selectedDraft.quantumSafe ? 'Yes' : 'No'}</p>
            <p><b>Anonymization:</b> {selectedDraft.anonymization ? 'Yes' : 'No'}</p>
            {selectedDraft.rejectionReason && (
              <div style={{ marginTop: 12, background: '#fff3e0', padding: 12, borderRadius: 4 }}>
                <b>Rejection:</b> {selectedDraft.rejectionReason}<br />
                <small>Source: {selectedDraft.rejectionSource}</small>
              </div>
            )}
            <div style={{ marginTop: 24 }}>
              <button onClick={() => setSelectedDraft(null)} style={btnPlain}>Close</button>
              {['DRAFT', 'RULE_REJECTED', 'LLM_REJECTED'].includes(selectedDraft.status) && (
                <button onClick={() => { handleValidate(selectedDraft._id); setSelectedDraft(null); }} style={btnGreen}>Validate</button>
              )}
              {selectedDraft.status === 'VALIDATED' && (
                <button onClick={() => { handleFinalize(selectedDraft._id); setSelectedDraft(null); }} style={btnBlue}>Finalize</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const th = { padding: '10px', textAlign: 'left', fontWeight: 'bold', fontSize: 14 };
const td = { padding: '10px', fontSize: 13, color: '#333' };

const viewBtn = {
  background: '#1976d2', color: 'white', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer'
};
const btnGreen = { ...viewBtn, background: '#43a047' };
const btnBlue = { ...viewBtn, background: '#1565c0' };
const btnRed = { ...viewBtn, background: '#e53935' };
const btnPlain = { marginRight: 12, padding: '8px 14px', background: '#ddd', border: 'none', borderRadius: 4 };

const modalOverlay = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
};
const modalBox = {
  background: 'white', padding: 24, borderRadius: 8, width: '600px', maxHeight: '80vh', overflowY: 'auto'
};

export default ConsentDraftList;
