import React from 'react';

const BlockchainModal = ({ txData, onClose }) => {
  if (!txData) return null;
  
  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer'
          }}
        >
          ×
        </button>
        
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>
          Blockchain Verification
        </h2>
        
        {txData.status === 'confirmed' ? (
          <div>
            <div style={{
              backgroundColor: '#e8f5e9',
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <span role="img" aria-label="success" style={{ fontSize: '32px' }}>✅</span>
              <h3 style={{ margin: '8px 0' }}>Transaction Confirmed</h3>
              <p style={{ margin: 0 }}>Your consent has been successfully recorded on the blockchain!</p>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <h4 style={{ marginBottom: '8px' }}>Transaction Details:</h4>
              <div style={{ 
                padding: '12px', 
                backgroundColor: '#f5f5f5', 
                borderRadius: '4px',
                wordBreak: 'break-all'
              }}>
                <div style={{ marginBottom: '8px' }}><strong>Transaction Hash:</strong></div>
                <div style={{ fontSize: '14px', fontFamily: 'monospace' }}>
                  {txData.txHash}
                </div>
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <a
                href={txData.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  padding: '10px 16px',
                  textDecoration: 'none',
                  borderRadius: '4px',
                  display: 'inline-block',
                  fontWeight: 'bold'
                }}
              >
                View on Blockchain Explorer
              </a>
              <p style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
                You can always verify this consent later using the Blockchain Verification tool.
              </p>
            </div>
          </div>
        ) : txData.status === 'error' ? (
          <div>
            <div style={{
              backgroundColor: '#ffebee',
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <span role="img" aria-label="error" style={{ fontSize: '32px' }}>⚠️</span>
              <h3 style={{ margin: '8px 0' }}>Blockchain Error</h3>
              <p style={{ margin: 0 }}>Your consent was recorded in our database but couldn't be verified on the blockchain.</p>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <p>
                This might be due to network issues or blockchain unavailability. 
                Your consent is still valid in our system.
              </p>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: '#757575',
                  color: 'white',
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  marginTop: '16px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px' }}>⌛</div>
              <h3 style={{ margin: '8px 0' }}>Processing Transaction</h3>
              <p style={{ margin: 0 }}>Your consent is being recorded on the blockchain...</p>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <p>
                This process may take a few moments. You can close this modal and check the status later.
              </p>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: '#757575',
                  color: 'white',
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  marginTop: '16px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainModal; 