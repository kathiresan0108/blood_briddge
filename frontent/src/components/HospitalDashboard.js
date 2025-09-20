import React, { useState } from 'react';
import './HospitalDashboard.css';

function HospitalDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showBloodRequestModal, setShowBloodRequestModal] = useState(false);

  // Sample data - in real app, this would come from API
  const [bloodRequests, setBloodRequests] = useState([
    { id: 1, bloodGroup: 'O+', units: 2, urgency: 'high', date: '2024-01-15', status: 'active', description: 'Emergency surgery required' },
    { id: 2, bloodGroup: 'A+', units: 1, urgency: 'medium', date: '2024-01-14', status: 'fulfilled', description: 'Regular blood bank refill' },
    { id: 3, bloodGroup: 'B-', units: 3, urgency: 'high', date: '2024-01-13', status: 'active', description: 'Accident victim treatment' }
  ]);

  const [donors, setDonors] = useState([
    { id: 1, name: 'Rajesh Kumar', phone: '+91 98765 43210', bloodGroup: 'O+', lastDonation: '2024-01-10', credits: 150, status: 'available' },
    { id: 2, name: 'Priya Sharma', phone: '+91 98765 43211', bloodGroup: 'A+', lastDonation: '2024-01-08', credits: 200, status: 'available' },
    { id: 3, name: 'Amit Singh', phone: '+91 98765 43212', bloodGroup: 'B+', lastDonation: '2024-01-05', credits: 100, status: 'unavailable' }
  ]);

  const [donations, setDonations] = useState([
    { id: 1, donor: 'Rajesh Kumar', bloodGroup: 'O+', date: '2024-01-15', units: 1, status: 'completed', credits: 50 },
    { id: 2, donor: 'Priya Sharma', bloodGroup: 'A+', date: '2024-01-14', units: 1, status: 'completed', credits: 50 },
    { id: 3, donor: 'Amit Singh', bloodGroup: 'B+', date: '2024-01-13', units: 1, status: 'pending', credits: 0 }
  ]);

  const [newBloodRequest, setNewBloodRequest] = useState({
    bloodGroup: '',
    units: '',
    urgency: 'medium',
    description: ''
  });

  const translations = {
    en: {
      title: "Hospital Dashboard",
      overview: "Overview",
      bloodRequests: "Blood Requests",
      donors: "Donors",
      donations: "Donations",
      notifications: "Notifications",
      profile: "Profile",
      welcome: "Welcome, Hospital",
      totalRequests: "Total Requests",
      activeRequests: "Active Requests",
      totalDonors: "Total Donors",
      completedDonations: "Completed Donations",
      postRequest: "Post Blood Request",
      bloodGroup: "Blood Group",
      units: "Units Required",
      urgency: "Urgency Level",
      description: "Description",
      high: "High",
      medium: "Medium",
      low: "Low",
      active: "Active",
      fulfilled: "Fulfilled",
      available: "Available",
      unavailable: "Unavailable",
      completed: "Completed",
      pending: "Pending",
      contact: "Contact",
      viewDetails: "View Details",
      edit: "Edit",
      delete: "Delete",
      sendNotification: "Send Notification",
      search: "Search...",
      filter: "Filter"
    },
    ta: {
      title: "மருத்துவமனை டாஷ்போர்டு",
      overview: "கண்ணோட்டம்",
      bloodRequests: "ரத்த கோரிக்கைகள்",
      donors: "தானம் செய்பவர்கள்",
      donations: "தானங்கள்",
      notifications: "அறிவிப்புகள்",
      profile: "சுயவிவரம்",
      welcome: "வரவேற்கிறோம், மருத்துவமனை",
      totalRequests: "மொத்த கோரிக்கைகள்",
      activeRequests: "செயலில் உள்ள கோரிக்கைகள்",
      totalDonors: "மொத்த தானம் செய்பவர்கள்",
      completedDonations: "முடிந்த தானங்கள்",
      postRequest: "ரத்த கோரிக்கையை இடுகையிடு",
      bloodGroup: "ரத்த குழு",
      units: "தேவையான அலகுகள்",
      urgency: "அவசர நிலை",
      description: "விளக்கம்",
      high: "உயர்",
      medium: "நடுத்தர",
      low: "குறைந்த",
      active: "செயலில்",
      fulfilled: "நிறைவேற்றப்பட்டது",
      available: "கிடைக்கும்",
      unavailable: "கிடைக்காத",
      completed: "முடிந்தது",
      pending: "நிலுவையில்",
      contact: "தொடர்பு",
      viewDetails: "விவரங்களைக் காண்க",
      edit: "திருத்து",
      delete: "நீக்கு",
      sendNotification: "அறிவிப்பு அனுப்பு",
      search: "தேடு...",
      filter: "வடிகட்டு"
    },
    hi: {
      title: "अस्पताल डैशबोर्ड",
      overview: "अवलोकन",
      bloodRequests: "रक्त अनुरोध",
      donors: "दाता",
      donations: "दान",
      notifications: "सूचनाएं",
      profile: "प्रोफाइल",
      welcome: "स्वागत है, अस्पताल",
      totalRequests: "कुल अनुरोध",
      activeRequests: "सक्रिय अनुरोध",
      totalDonors: "कुल दाता",
      completedDonations: "पूर्ण दान",
      postRequest: "रक्त अनुरोध पोस्ट करें",
      bloodGroup: "रक्त समूह",
      units: "आवश्यक इकाइयां",
      urgency: "तात्कालिकता स्तर",
      description: "विवरण",
      high: "उच्च",
      medium: "मध्यम",
      low: "कम",
      active: "सक्रिय",
      fulfilled: "पूर्ण",
      available: "उपलब्ध",
      unavailable: "अनुपलब्ध",
      completed: "पूर्ण",
      pending: "लंबित",
      contact: "संपर्क",
      viewDetails: "विवरण देखें",
      edit: "संपादित करें",
      delete: "हटाएं",
      sendNotification: "सूचना भेजें",
      search: "खोजें...",
      filter: "फिल्टर"
    }
  };

  const t = translations[currentLanguage];

  const handlePostBloodRequest = (e) => {
    e.preventDefault();
    const newRequest = {
      id: bloodRequests.length + 1,
      ...newBloodRequest,
      date: new Date().toISOString().split('T')[0],
      status: 'active'
    };
    setBloodRequests(prev => [newRequest, ...prev]);
    setNewBloodRequest({ bloodGroup: '', units: '', urgency: 'medium', description: '' });
    setShowBloodRequestModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBloodRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStats = () => {
    return {
      totalRequests: bloodRequests.length,
      activeRequests: bloodRequests.filter(r => r.status === 'active').length,
      totalDonors: donors.length,
      completedDonations: donations.filter(d => d.status === 'completed').length
    };
  };

  const stats = getStats();

  const renderOverview = () => (
    <div className="overview-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🩸</div>
          <div className="stat-content">
            <h3>{stats.totalRequests}</h3>
            <p>{t.totalRequests}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{stats.activeRequests}</h3>
            <p>{t.activeRequests}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalDonors}</h3>
            <p>{t.totalDonors}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.completedDonations}</h3>
            <p>{t.completedDonations}</p>
          </div>
        </div>
      </div>

      <div className="recent-activities">
        <h3>Recent Blood Requests</h3>
        <div className="activity-list">
          {bloodRequests.slice(0, 5).map(request => (
            <div key={request.id} className="activity-item">
              <div className="activity-icon">🩸</div>
              <div className="activity-content">
                <p><strong>{request.bloodGroup}</strong> - {request.units} units needed</p>
                <span className="activity-date">{request.date} - {request.urgency} priority</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderBloodRequests = () => (
    <div className="blood-requests-section">
      <div className="section-header">
        <h2>Blood Requests</h2>
        <div className="section-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowBloodRequestModal(true)}
          >
            {t.postRequest}
          </button>
        </div>
      </div>

      <div className="requests-grid">
        {bloodRequests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <div className="blood-group-badge">{request.bloodGroup}</div>
              <div className={`urgency-badge ${request.urgency}`}>
                {t[request.urgency]}
              </div>
            </div>
            <div className="request-content">
              <p><strong>{request.units}</strong> units required</p>
              <p>{request.description}</p>
              <p className="request-date">Posted: {request.date}</p>
            </div>
            <div className="request-actions">
              <span className={`status-badge ${request.status}`}>
                {t[request.status]}
              </span>
              <div className="action-buttons">
                <button className="btn btn-secondary btn-sm">{t.edit}</button>
                <button className="btn btn-primary btn-sm">{t.sendNotification}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDonors = () => (
    <div className="donors-section">
      <div className="section-header">
        <h2>Available Donors</h2>
        <div className="section-actions">
          <input type="text" placeholder={t.search} className="search-input" />
          <select className="filter-select">
            <option value="">{t.filter}</option>
            <option value="O+">O+</option>
            <option value="A+">A+</option>
            <option value="B+">B+</option>
            <option value="AB+">AB+</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Blood Group</th>
              <th>Last Donation</th>
              <th>Credits</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donors.map(donor => (
              <tr key={donor.id}>
                <td>{donor.name}</td>
                <td>{donor.phone}</td>
                <td><span className="badge badge-primary">{donor.bloodGroup}</span></td>
                <td>{donor.lastDonation}</td>
                <td>{donor.credits}</td>
                <td>
                  <span className={`badge ${donor.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                    {t[donor.status]}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-success btn-sm">{t.contact}</button>
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

  const renderDonations = () => (
    <div className="donations-section">
      <div className="section-header">
        <h2>Donation History</h2>
        <div className="section-actions">
          <input type="text" placeholder={t.search} className="search-input" />
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Donor</th>
              <th>Blood Group</th>
              <th>Date</th>
              <th>Units</th>
              <th>Status</th>
              <th>Credits</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donations.map(donation => (
              <tr key={donation.id}>
                <td>{donation.donor}</td>
                <td><span className="badge badge-primary">{donation.bloodGroup}</span></td>
                <td>{donation.date}</td>
                <td>{donation.units}</td>
                <td>
                  <span className={`badge ${donation.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {t[donation.status]}
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
      case 'bloodRequests': return renderBloodRequests();
      case 'donors': return renderDonors();
      case 'donations': return renderDonations();
      default: return renderOverview();
    }
  };

  return (
    <div className="hospital-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">🏥</div>
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
            <div className="user-avatar">🏥</div>
            <div className="user-details">
              <h3>{t.welcome}</h3>
              <p>{user?.hospitalName || user?.name}</p>
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
              className={`nav-item ${activeTab === 'bloodRequests' ? 'active' : ''}`}
              onClick={() => setActiveTab('bloodRequests')}
            >
              🩸 {t.bloodRequests}
            </button>
            <button 
              className={`nav-item ${activeTab === 'donors' ? 'active' : ''}`}
              onClick={() => setActiveTab('donors')}
            >
              👥 {t.donors}
            </button>
            <button 
              className={`nav-item ${activeTab === 'donations' ? 'active' : ''}`}
              onClick={() => setActiveTab('donations')}
            >
              ✅ {t.donations}
            </button>
            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 {t.notifications}
            </button>
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              ⚙️ {t.profile}
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

      {/* Blood Request Modal */}
      {showBloodRequestModal && (
        <div className="modal-overlay" onClick={() => setShowBloodRequestModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{t.postRequest}</h2>
              <button className="modal-close" onClick={() => setShowBloodRequestModal(false)}>×</button>
            </div>

            <form onSubmit={handlePostBloodRequest} className="blood-request-form">
              <div className="form-group">
                <label className="form-label">{t.bloodGroup}</label>
                <select
                  name="bloodGroup"
                  className="form-select"
                  value={newBloodRequest.bloodGroup}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.units}</label>
                <input
                  type="number"
                  name="units"
                  className="form-control"
                  value={newBloodRequest.units}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.urgency}</label>
                <select
                  name="urgency"
                  className="form-select"
                  value={newBloodRequest.urgency}
                  onChange={handleInputChange}
                >
                  <option value="low">{t.low}</option>
                  <option value="medium">{t.medium}</option>
                  <option value="high">{t.high}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.description}</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={newBloodRequest.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Describe the need for blood..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-large">
                  Post Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalDashboard;
