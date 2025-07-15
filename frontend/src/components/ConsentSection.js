import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConsentSection = ({ virtualUserId }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/consent/pending-approvals/${virtualUserId}`, { withCredentials: true });
      setApprovals(res.data.approvals);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch approvals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprovalDecision = async (id, decision) => {
    try {
      await axios.post(`http://localhost:5000/consent/approve/${id}`, { decision }, { withCredentials: true });
      fetchApprovals();
    } catch {
      alert('Failed to update approval status.');
    }
  };

  if (loading) return <div>Loading approvals...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h3>Pending Approvals</h3>
      {approvals.length === 0 ? (
        <div>No pending approvals.</div>
      ) : (
        <ul>
          {approvals.map((approval) => (
            <li key={approval._id}>
              {approval.purpose} - {approval.status}
              <button onClick={() => handleApprovalDecision(approval._id, 'APPROVED')}>Approve</button>
              <button onClick={() => handleApprovalDecision(approval._id, 'REJECTED')}>Reject</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConsentSection;
