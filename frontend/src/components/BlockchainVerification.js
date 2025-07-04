import React, { useState } from 'react';

const BlockchainVerification = () => {
  const [txHash, setTxHash] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!txHash || txHash.trim() === '') {
      setError('Please enter a valid transaction hash');
      return;
    }
    
    setLoading(true);
    setError(null);
    setVerificationResult(null);
    
    try {
      const response = await fetch(`http://localhost:5000/consent/verify-blockchain/${txHash.trim()}`);
      const data = await response.json();
      
      if (response.ok) {
        setVerificationResult(data);
      } else {
        setError(data.message || 'Failed to verify transaction');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="verification-container" style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Verify Consent on Blockchain</h2>
      <p style={{ textAlign: 'center', marginBottom: '20px' }}>
        Enter a transaction hash to verify that consent was recorded on the blockchain
      </p>
      
      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input
          type="text"
          value={txHash}
          onChange={(e) => setTxHash(e.target.value)}
          placeholder="Enter transaction hash (0x...)"
          style={{
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            fontSize: '16px'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? 'Verifying...' : 'Verify Consent'}
        </button>
      </form>
      
      {error && (
        <div style={{ 
          margin: '20px 0', 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}
      
      {verificationResult && verificationResult.verified && (
        <div style={{ 
          margin: '20px 0', 
          padding: '20px', 
          backgroundColor: '#e8f5e9', 
          borderRadius: '4px',
          border: '1px solid #c8e6c9' 
        }}>
          <h3 style={{ color: '#2e7d32', marginTop: 0 }}>✓ Verified on Blockchain</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Purpose:</strong> {verificationResult.consent.purpose}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Partner:</strong> {verificationResult.consent.partnerName}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Status:</strong> {verificationResult.consent.status}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Date:</strong> {new Date(verificationResult.consent.timestamp).toLocaleString()}
          </div>
          {verificationResult.consent.expiresAt && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Expires:</strong> {new Date(verificationResult.consent.expiresAt).toLocaleString()}
            </div>
          )}
          <div style={{ marginTop: '20px' }}>
            <strong>Blockchain Details:</strong>
            <div style={{ marginTop: '10px', fontSize: '0.9em' }}>
              <div style={{ marginBottom: '5px' }}>
                <strong>Network:</strong> {verificationResult.blockchain.network}
              </div>
              <div style={{ marginBottom: '5px', wordBreak: 'break-all' }}>
                <strong>TX Hash:</strong> {verificationResult.blockchain.txHash}
              </div>
              <div style={{ marginTop: '10px' }}>
                <a 
                  href={verificationResult.blockchain.explorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    color: '#1976d2', 
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 'bold'
                  }}
                >
                  View on Blockchain Explorer
                  <span style={{ fontSize: '0.8em' }}>↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {verificationResult && !verificationResult.verified && (
        <div style={{ 
          margin: '20px 0', 
          padding: '20px', 
          backgroundColor: '#ffebee', 
          borderRadius: '4px',
          border: '1px solid #ffcdd2' 
        }}>
          <h3 style={{ color: '#c62828', marginTop: 0 }}>✗ Verification Failed</h3>
          <p>{verificationResult.message}</p>
        </div>
      )}
    </div>
  );
};

export default BlockchainVerification; 