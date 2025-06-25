import React, { useState } from 'react';
// Import the respective components (to be created)
import UserComponent from '../components/UserComponent';
import PartnerComponent from '../components/PartnerComponent';
import BankComponent from '../components/BankComponent';

const LandingPage = () => {
  const [selected, setSelected] = useState(null);

  const renderComponent = () => {
    switch (selected) {
      case 'user':
        return <UserComponent />;
      case 'partner':
        return <PartnerComponent />;
      case 'bank':
        return <BankComponent />;
      default:
        return null;
    }
  };

  if (selected) {
    return renderComponent();    
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '10vh' }}>
      <h1>Welcome to CyberSuraksha</h1>
      <div style={{ marginTop: 40 }}>
        <button onClick={() => setSelected('user')} style={{ margin: 10, padding: '10px 30px' }}>User</button>
        <button onClick={() => setSelected('partner')} style={{ margin: 10, padding: '10px 30px' }}>Partner</button>
        <button onClick={() => setSelected('bank')} style={{ margin: 10, padding: '10px 30px' }}>Bank</button>
      </div>
    </div>
  );
};

export default LandingPage; 