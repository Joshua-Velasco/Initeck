import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../../modules/shell/components/Navbar';
import LogoutModal from '../../../modules/shell/components/LogoutModal';
import { useState } from 'react';
import { useAuth } from '../../../modules/auth/AuthProvider';

const WebLayout = ({ children }) => {
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutRequest = () => setShowLogoutModal(true);
  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar onLogout={handleLogoutRequest} />
      
      <main style={{ marginTop: "75px" }} className="flex-grow-1 d-flex flex-column">
        {children}
      </main>

      <LogoutModal 
        show={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
        onConfirm={confirmLogout} 
      />
    </div>
  );
};

export default WebLayout;
