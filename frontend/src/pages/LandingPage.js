import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'
// If you have a logo SVG, import it, else use an emoji or icon

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-bg">
      <div className="landing-card">
        <div className="landing-logo">
          {/* Replace with your logo if you have one */}
          <i className="fa-brands fa-react"></i>
          {/* or <img src={logo} alt="logo" style={{height: 48}} /> */}
        </div>
        <div className="landing-title">Welcome to <br />CyberSuraksha</div>
        <div className="landing-subtitle">Choose your portal to get started</div>
        <button className="landing-btn user" onClick={() => navigate('/user')}>User</button>
        <button className="landing-btn partner" onClick={() => navigate('/partner')}>Partner</button>
        <button className="landing-btn bank" onClick={() => navigate('/bank')}>Bank</button>
      </div>
    </div>
  );
};

export default LandingPage;