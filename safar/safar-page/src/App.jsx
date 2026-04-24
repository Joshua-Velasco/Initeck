import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useScrollReveal } from './hooks/useScrollReveal';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import Experience from './sections/Experience';
import Booking from './sections/Booking';
import Membership from './sections/Membership';
import Login from './sections/Login';
import SignIn from './sections/SignIn';
import Dashboard from './sections/Dashboard';
import ProfileSetup from './sections/ProfileSetup';
import Footer from './sections/Footer';

function App() {
  const [activeView, setActiveView] = useState(() => {
    const saved = localStorage.getItem('safar_active_view');
    const savedAuth = localStorage.getItem('safar_auth_user');

    // If authenticated and trying to access login/signin, redirect to dashboard
    if (savedAuth && (saved === 'signin' || saved === 'login')) {
      return 'dashboard';
    }

    // Otherwise, respect the saved view or default to home
    return saved || 'home';
  });

  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem('safar_auth_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (authUser) {
      localStorage.setItem('safar_auth_user', JSON.stringify(authUser));
    } else {
      localStorage.removeItem('safar_auth_user');
    }
  }, [authUser]);

  useEffect(() => {
    localStorage.setItem('safar_active_view', activeView);
  }, [activeView]);

  const reveal = useScrollReveal();

  const GOOGLE_CLIENT_ID = '63132234655-4mm82pj14gisnqc3t0mln2c303gh6f38.apps.googleusercontent.com'; // User provided client ID


  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="app">
        <Navbar activeView={activeView} setActiveView={setActiveView} authUser={authUser} setAuthUser={setAuthUser} />
        
        <main>
        {activeView === 'home' && (
          <Hero revealRef={reveal} setActiveView={setActiveView} />
        )}
        
        {activeView === 'experience' && (
          <Experience revealRef={reveal} />
        )}
        
        {activeView === 'register' && (
          <Booking revealRef={reveal} />
        )}
        
        
        {activeView === 'membership' && (
          <Membership revealRef={reveal} />
        )}
        
        {activeView === 'login' && (
          <Login revealRef={reveal} setActiveView={setActiveView} />
        )}
        
        {activeView === 'signin' && (
          <SignIn revealRef={reveal} setActiveView={setActiveView} setAuthUser={setAuthUser} />
        )}
        
        {activeView === 'dashboard' && (
          <Dashboard revealRef={reveal} setActiveView={setActiveView} authUser={authUser} setAuthUser={setAuthUser} />
        )}

        {activeView === 'profile-setup' && (
          <ProfileSetup revealRef={reveal} authUser={authUser} setAuthUser={setAuthUser} setActiveView={setActiveView} />
        )}
      </main>

      {!['login', 'signin', 'dashboard', 'profile-setup'].includes(activeView) && <Footer />}
    </div>
    </GoogleOAuthProvider>
  );
}

export default App;
