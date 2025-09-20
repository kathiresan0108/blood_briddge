import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import apiService from '../services/api';

function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // State for API data
  const [hospitals, setHospitals] = useState([]);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load data from API
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.getAdminOverview();
      setDashboardData(response.data);
    } catch (error) {
      setError('Failed to load dashboard data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadHospitals = async () => {
    setLoading(true);
    try {
      const response = await apiService.getHospitals();
      setHospitals(response.data);
    } catch (error) {
      setError('Failed to load hospitals: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUsers();
      setUsers(response.data);
    } catch (error) {
      setError('Failed to load users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDonations = async () => {
    setLoading(true);
    try {
      const response = await apiService.getDonations();
      setDonations(response.data);
    } catch (error) {
      setError('Failed to load donations: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    en: {
      title: "Admin Dashboard",
      overview: "Overview",
      hospitals: "Hospitals",
      users: "Users",
      donations: "Donations",
      credits: "Credits",
      notifications: "Notifications",
      settings: "Settings",
      welcome: "Welcome, Admin",
      totalHospitals: "Total Hospitals",
      totalUsers: "Total Users",
      totalDonations: "Total Donations",
      pendingRequests: "Pending Requests",
      verify: "Verify",
      reject: "Reject",
      viewDetails: "View Details",
      edit: "Edit",
      delete: "Delete",
      search: "Search...",
      filter: "Filter",
      export: "Export Data",
      sendNotification: "Send Notification"
    },
    ta: {
      title: "நிர்வாகி டாஷ்போர்டு",
      overview: "கண்ணோட்டம்",
      hospitals: "மருத்துவமனைகள்",
      users: "பயனர்கள்",
      donations: "தானங்கள்",
      credits: "கடன்",
      notifications: "அறிவிப்புகள்",
      settings: "அமைப்புகள்",
      welcome: "வரவேற்கிறோம், நிர்வாகி",
      totalHospitals: "மொத்த மருத்துவமனைகள்",
      totalUsers: "மொத்த பயனர்கள்",
      totalDonations: "மொத்த தானங்கள்",
      pendingRequests: "நிலுவையில் உள்ள கோரிக்கைகள்",
      verify: "சரிபார்க்க",
      reject: "நிராகரிக்க",
      viewDetails: "விவரங்களைக் காண்க",
      edit: "திருத்து",
      delete: "நீக்கு",
      search: "தேடு...",
      filter: "வடிகட்டு",
      export: "தரவை ஏற்றுமதி செய்",
      sendNotification: "அறிவிப்பு அனுப்பு"
    },
    hi: {
      title: "एडमिन डैशबोर्ड",
      overview: "अवलोकन",
      hospitals: "अस्पताल",
      users: "उपयोगकर्ता",
      donations: "दान",
      credits: "क्रेडिट",
      notifications: "सूचनाएं",
      settings: "सेटिंग्स",
      welcome: "स्वागत है, एडमिन",
      totalHospitals: "कुल अस्पताल",
      totalUsers: "कुल उपयोगकर्ता",
      totalDonations: "कुल दान",
      pendingRequests: "लंबित अनुरोध",
      verify: "सत्यापित करें",
      reject: "अस्वीकार करें",
      viewDetails: "विवरण देखें",
      edit: "संपादित करें",
      delete: "हटाएं",
      search: "खोजें...",
      filter: "फिल्टर",
      export: "डेटा निर्यात करें",
      sendNotification: "सूचना भेजें"
    }
  };

  const t = translations[currentLanguage];

  const handleVerifyHospital = async (hospitalId, status) => {
    try {
      await apiService.verifyHospital(hospitalId, status);
      // Reload hospitals data
      loadHospitals();
      alert(`Hospital ${status} successfully`);
    } catch (error) {
      setError('Failed to update hospital status: ' + error.message);
    }
  };

  const handleRejectHospital = async (hospitalId) => {
    try {
      await apiService.verifyHospital(hospitalId, 'rejected');
      // Reload hospitals data
      loadHospitals();
      alert('Hospital rejected successfully');
    } catch (error) {
      setError('Failed to reject hospital: ' + error.message);
    }
  };

  const getStats = () => {
    if (dashboardData) {
      return {
        totalHospitals: dashboardData.total_hospitals || 0,
        totalUsers: dashboardData.total_users || 0,
        totalDonations: dashboardData.total_donations || 0,
        pendingRequests: dashboardData.pending_verifications || 0
      };
    }
    return {
      totalHospitals: 0,
      totalUsers: 0,
      totalDonations: 0,
      pendingRequests: 0
    };
  };

  const stats = getStats();

  const renderOverview = () => (
    <div className="overview-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏥</div>
          <div className="stat-content">
            <h3>{stats.totalHospitals}</h3>
            <p>{t.totalHospitals}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>{t.totalUsers}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🩸</div>
          <div className="stat-content">
            <h3>{stats.totalDonations}</h3>
            <p>{t.totalDonations}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>{stats.pendingRequests}</h3>
            <p>{t.pendingRequests}</p>
          </div>
        </div>
      </div>

        <div className="recent-activities">
        <h3>Recent Activities</h3>
        <div className="activity-list">
          {dashboardData && dashboardData.recent_donations ? 
            dashboardData.recent_donations.slice(0, 5).map(donation => (
              <div key={donation.id} className="activity-item">
                <div className="activity-icon">🩸</div>
                <div className="activity-content">
                  <p><strong>{donation.donor_name}</strong> donated {donation.blood_group} blood at <strong>{donation.hospital_name}</strong></p>
                  <span className="activity-date">{donation.donation_date}</span>
                </div>
              </div>
            )) : 
            <p>No recent activities</p>
          }
        </div>
      </div>
    </div>
  );

  const renderHospitals = () => {
    if (hospitals.length === 0 && !loading) {
      loadHospitals();
    }

    return (
      <div className="hospitals-section">
        <div className="section-header">
          <h2>Hospital Management</h2>
          <div className="section-actions">
            <input type="text" placeholder={t.search} className="search-input" />
            <button className="btn btn-primary" onClick={loadHospitals}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>Location</th>
                <th>Certification</th>
                <th>Status</th>
                <th>Donations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitals.map(hospital => (
                <tr key={hospital.id}>
                  <td>{hospital.hospital_name}</td>
                  <td>{hospital.location}</td>
                  <td>{hospital.certification_number}</td>
                  <td>
                    <span className={`badge ${hospital.verification_status === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                      {hospital.verification_status}
                    </span>
                  </td>
                  <td>{hospital.total_donations || 0}</td>
                  <td>
                    <div className="action-buttons">
                      {hospital.verification_status === 'pending' && (
                        <>
                          <button 
                            className="btn btn-success btn-sm"
                            onClick={() => handleVerifyHospital(hospital.id, 'verified')}
                          >
                            {t.verify}
                          </button>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRejectHospital(hospital.id)}
                          >
                            {t.reject}
                          </button>
                        </>
                      )}
                      <button className="btn btn-secondary btn-sm">{t.viewDetails}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="users-section">
      <div className="section-header">
        <h2>User Management</h2>
        <div className="section-actions">
          <input type="text" placeholder={t.search} className="search-input" />
          <button className="btn btn-primary">{t.export}</button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Blood Group</th>
              <th>Donations</th>
              <th>Credits</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><span className="badge badge-primary">{user.bloodGroup}</span></td>
                <td>{user.donations}</td>
                <td>{user.credits}</td>
                <td>
                  <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                    {user.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary btn-sm">{t.edit}</button>
                    <button className="btn btn-danger btn-sm">{t.delete}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDonations = () => (
    <div className="donations-section">
      <div className="section-header">
        <h2>Donation Management</h2>
        <div className="section-actions">
          <input type="text" placeholder={t.search} className="search-input" />
          <button className="btn btn-primary">{t.export}</button>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Hospital</th>
              <th>Blood Group</th>
              <th>Date</th>
              <th>Status</th>
              <th>Credits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(donation => (
              <tr key={donation.id}>
                <td>{donation.donor}</td>
                <td>{donation.hospital}</td>
                <td><span className="badge badge-primary">{donation.bloodGroup}</span></td>
                <td>{donation.date}</td>
                <td>
                  <span className={`badge ${donation.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {donation.status}
                  </span>
                </td>
                <td>{donation.credits}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-secondary btn-sm">{t.viewDetails}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'hospitals': return renderHospitals();
      case 'users': return renderUsers();
      case 'donations': return renderDonations();
      default: return renderOverview();
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">🩸</div>
              <span>Blood Bridge</span>
            </div>
            <div className="header-actions">
              <div className="language-selector">
                <button className="language-btn">
                  {currentLanguage === 'en' ? '🇺🇸 EN' : 
                   currentLanguage === 'ta' ? '🇮🇳 தமிழ்' : '🇮🇳 हिंदी'}
                </button>
                <div className="language-dropdown">
                  <div className="language-option" onClick={() => setCurrentLanguage('en')}>
                    🇺🇸 English
                  </div>
                  <div className="language-option" onClick={() => setCurrentLanguage('ta')}>
                    🇮🇳 தமிழ்
                  </div>
                  <div className="language-option" onClick={() => setCurrentLanguage('hi')}>
                    🇮🇳 हिंदी
                  </div>
                </div>
              </div>
              <button className="btn btn-outline" onClick={onLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="user-info">
            <div className="user-avatar">👨‍💼</div>
            <div className="user-details">
              <h3>{t.welcome}</h3>
              <p>{user?.email}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 {t.overview}
            </button>
            <button 
              className={`nav-item ${activeTab === 'hospitals' ? 'active' : ''}`}
              onClick={() => setActiveTab('hospitals')}
            >
              🏥 {t.hospitals}
            </button>
            <button 
              className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              👥 {t.users}
            </button>
            <button 
              className={`nav-item ${activeTab === 'donations' ? 'active' : ''}`}
              onClick={() => setActiveTab('donations')}
            >
              🩸 {t.donations}
            </button>
            <button 
              className={`nav-item ${activeTab === 'credits' ? 'active' : ''}`}
              onClick={() => setActiveTab('credits')}
            >
              💰 {t.credits}
            </button>
            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 {t.notifications}
            </button>
            <button 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ {t.settings}
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-header">
            <h1>{t.title}</h1>
            <div className="content-actions">
              <button className="btn btn-primary">
                {t.sendNotification}
              </button>
            </div>
          </div>

          <div className="content-body">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
