import React, { useState, useEffect } from 'react';
import './App.css';
import WelcomePage from './components/WelcomePage';
import AdminDashboard from './components/AdminDashboard';
import HospitalDashboard from './components/HospitalDashboard';
import UserDashboard from './components/UserDashboard';
import LoginModal from './components/LoginModal';
import SignUpPage from './components/SignUpPage';
import authService from './services/authService';

function App() {
  const [currentPage, setCurrentPage] = useState('welcome');
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginType, setLoginType] = useState('');
  const [loading, setLoading] = useState(true);

  // Initialize authentication on app load
  useEffect(() => {
    const initAuth = async () => {
      try {
        authService.init();
        if (authService.isLoggedIn()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
          
          // Navigate to appropriate dashboard
          switch(currentUser.user_type) {
            case 'admin':
              setCurrentPage('admin');
              break;
            case 'hospital':
              setCurrentPage('hospital');
              break;
            case 'user':
              setCurrentPage('user');
              break;
            default:
              setCurrentPage('welcome');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLoginModal(false);
    
    // Navigate to appropriate dashboard based on user type
    switch(userData.type) {
      case 'admin':
        setCurrentPage('admin');
        break;
      case 'hospital':
        setCurrentPage('hospital');
        break;
      case 'user':
        setCurrentPage('user');
        break;
      default:
        setCurrentPage('welcome');
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentPage('welcome');
  };

  const openLoginModal = (type) => {
    setLoginType(type);
    setShowLoginModal(true);
  };

  const openSignUpPage = () => {
    setCurrentPage('signup');
  };

  const handleSignUpSuccess = () => {
    setCurrentPage('welcome');
    alert('Registration successful! Please login with your credentials.');
  };

  const handleBackToWelcome = () => {
    setCurrentPage('welcome');
  };

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'admin':
        return <AdminDashboard user={user} onLogout={handleLogout} />;
      case 'hospital':
        return <HospitalDashboard user={user} onLogout={handleLogout} />;
      case 'user':
        return <UserDashboard user={user} onLogout={handleLogout} />;
      case 'signup':
        return (
          <SignUpPage 
            onSignUpSuccess={handleSignUpSuccess}
            onBackToWelcome={handleBackToWelcome}
          />
        );
      default:
        return <WelcomePage onLoginClick={openLoginModal} onSignUpClick={openSignUpPage} />;
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '1.2rem'
        }}>
          Loading Blood Bridge...
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {renderCurrentPage()}
      
      {showLoginModal && (
        <LoginModal
          loginType={loginType}
          onLogin={handleLogin}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}

export default App;
