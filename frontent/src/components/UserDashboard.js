import React, { useState } from 'react';
import './UserDashboard.css';

function UserDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchBloodGroup, setSearchBloodGroup] = useState('');

  // Sample data - in real app, this would come from API
  const [donationHistory, setDonationHistory] = useState([
    { id: 1, hospital: 'City General Hospital', bloodGroup: 'O+', date: '2024-01-15', credits: 50, status: 'completed' },
    { id: 2, hospital: 'Metro Medical Center', bloodGroup: 'O+', date: '2024-01-10', credits: 50, status: 'completed' },
    { id: 3, hospital: 'Regional Health Hub', bloodGroup: 'O+', date: '2024-01-05', credits: 50, status: 'completed' }
  ]);

  const [availableRequests, setAvailableRequests] = useState([
    { id: 1, hospital: 'City General Hospital', location: 'Mumbai', bloodGroup: 'O+', units: 2, urgency: 'high', date: '2024-01-15', distance: '2.5 km' },
    { id: 2, hospital: 'Metro Medical Center', location: 'Mumbai', bloodGroup: 'A+', units: 1, urgency: 'medium', date: '2024-01-14', distance: '5.1 km' },
    { id: 3, hospital: 'Regional Health Hub', location: 'Mumbai', bloodGroup: 'B+', units: 3, urgency: 'high', date: '2024-01-13', distance: '8.3 km' }
  ]);

  const [achievements, setAchievements] = useState([
    { id: 1, title: 'First Donation', description: 'Completed your first blood donation', icon: '🎯', earned: true, date: '2024-01-05' },
    { id: 2, title: 'Life Saver', description: 'Donated blood 3 times', icon: '🩸', earned: true, date: '2024-01-15' },
    { id: 3, title: 'Regular Donor', description: 'Donated blood 5 times', icon: '⭐', earned: false, date: null },
    { id: 4, title: 'Emergency Hero', description: 'Responded to emergency blood request', icon: '🚨', earned: false, date: null }
  ]);

  const translations = {
    en: {
      title: "User Dashboard",
      overview: "Overview",
      findHospitals: "Find Hospitals",
      donationHistory: "Donation History",
      profile: "Profile",
      achievements: "Achievements",
      notifications: "Notifications",
      welcome: "Welcome, Donor",
      totalDonations: "Total Donations",
      totalCredits: "Total Credits",
      lastDonation: "Last Donation",
      nextEligible: "Next Eligible",
      searchLocation: "Search by Location",
      searchBloodGroup: "Blood Group",
      hospital: "Hospital",
      location: "Location",
      bloodGroup: "Blood Group",
      units: "Units",
      urgency: "Urgency",
      date: "Date",
      distance: "Distance",
      donate: "Donate",
      viewDetails: "View Details",
      contact: "Contact",
      high: "High",
      medium: "Medium",
      low: "Low",
      completed: "Completed",
      pending: "Pending",
      earned: "Earned",
      notEarned: "Not Earned",
      search: "Search...",
      filter: "Filter",
      updateProfile: "Update Profile",
      personalInfo: "Personal Information",
      name: "Full Name",
      email: "Email",
      phone: "Phone Number",
      age: "Age",
      gender: "Gender",
      bloodGroup: "Blood Group",
      location: "Location",
      preferences: "Donation Preferences",
      availableDays: "Available Days",
      preferredTime: "Preferred Time",
      emergencyContact: "Emergency Contact",
      save: "Save Changes"
    },
    ta: {
      title: "பயனர் டாஷ்போர்டு",
      overview: "கண்ணோட்டம்",
      findHospitals: "மருத்துவமனைகளைக் கண்டறியவும்",
      donationHistory: "தான வரலாறு",
      profile: "சுயவிவரம்",
      achievements: "சாதனைகள்",
      notifications: "அறிவிப்புகள்",
      welcome: "வரவேற்கிறோம், தானம் செய்பவர்",
      totalDonations: "மொத்த தானங்கள்",
      totalCredits: "மொத்த கடன்",
      lastDonation: "கடைசி தானம்",
      nextEligible: "அடுத்த தகுதி",
      searchLocation: "இடத்தின் அடிப்படையில் தேடு",
      searchBloodGroup: "ரத்த குழு",
      hospital: "மருத்துவமனை",
      location: "இடம்",
      bloodGroup: "ரத்த குழு",
      units: "அலகுகள்",
      urgency: "அவசரம்",
      date: "தேதி",
      distance: "தூரம்",
      donate: "தானம் செய்",
      viewDetails: "விவரங்களைக் காண்க",
      contact: "தொடர்பு",
      high: "உயர்",
      medium: "நடுத்தர",
      low: "குறைந்த",
      completed: "முடிந்தது",
      pending: "நிலுவையில்",
      earned: "பெற்றது",
      notEarned: "பெறவில்லை",
      search: "தேடு...",
      filter: "வடிகட்டு",
      updateProfile: "சுயவிவரத்தைப் புதுப்பிக்கவும்",
      personalInfo: "தனிப்பட்ட தகவல்",
      name: "முழு பெயர்",
      email: "மின்னஞ்சல்",
      phone: "தொலைபேசி எண்",
      age: "வயது",
      gender: "பாலினம்",
      bloodGroup: "ரத்த குழு",
      location: "இடம்",
      preferences: "தான விருப்பங்கள்",
      availableDays: "கிடைக்கும் நாட்கள்",
      preferredTime: "விரும்பிய நேரம்",
      emergencyContact: "அவசர தொடர்பு",
      save: "மாற்றங்களைச் சேமிக்கவும்"
    },
    hi: {
      title: "उपयोगकर्ता डैशबोर्ड",
      overview: "अवलोकन",
      findHospitals: "अस्पताल खोजें",
      donationHistory: "दान इतिहास",
      profile: "प्रोफाइल",
      achievements: "उपलब्धियां",
      notifications: "सूचनाएं",
      welcome: "स्वागत है, दाता",
      totalDonations: "कुल दान",
      totalCredits: "कुल क्रेडिट",
      lastDonation: "अंतिम दान",
      nextEligible: "अगली पात्रता",
      searchLocation: "स्थान से खोजें",
      searchBloodGroup: "रक्त समूह",
      hospital: "अस्पताल",
      location: "स्थान",
      bloodGroup: "रक्त समूह",
      units: "इकाइयां",
      urgency: "तात्कालिकता",
      date: "तारीख",
      distance: "दूरी",
      donate: "दान करें",
      viewDetails: "विवरण देखें",
      contact: "संपर्क",
      high: "उच्च",
      medium: "मध्यम",
      low: "कम",
      completed: "पूर्ण",
      pending: "लंबित",
      earned: "अर्जित",
      notEarned: "अर्जित नहीं",
      search: "खोजें...",
      filter: "फिल्टर",
      updateProfile: "प्रोफाइल अपडेट करें",
      personalInfo: "व्यक्तिगत जानकारी",
      name: "पूरा नाम",
      email: "ईमेल",
      phone: "फोन नंबर",
      age: "आयु",
      gender: "लिंग",
      bloodGroup: "रक्त समूह",
      location: "स्थान",
      preferences: "दान प्राथमिकताएं",
      availableDays: "उपलब्ध दिन",
      preferredTime: "पसंदीदा समय",
      emergencyContact: "आपातकालीन संपर्क",
      save: "परिवर्तन सहेजें"
    }
  };

  const t = translations[currentLanguage];

  const getStats = () => {
    const totalCredits = donationHistory.reduce((sum, donation) => sum + donation.credits, 0);
    const lastDonation = donationHistory.length > 0 ? donationHistory[0].date : 'Never';
    const nextEligible = donationHistory.length > 0 ? '2024-02-15' : 'Available now';
    
    return {
      totalDonations: donationHistory.length,
      totalCredits,
      lastDonation,
      nextEligible
    };
  };

  const stats = getStats();

  const filteredRequests = availableRequests.filter(request => {
    const matchesLocation = !searchLocation || request.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesBloodGroup = !searchBloodGroup || request.bloodGroup === searchBloodGroup;
    return matchesLocation && matchesBloodGroup;
  });

  const renderOverview = () => (
    <div className="overview-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🩸</div>
          <div className="stat-content">
            <h3>{stats.totalDonations}</h3>
            <p>{t.totalDonations}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{stats.totalCredits}</h3>
            <p>{t.totalCredits}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>{stats.lastDonation}</h3>
            <p>{t.lastDonation}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>{stats.nextEligible}</h3>
            <p>{t.nextEligible}</p>
          </div>
        </div>
      </div>

      <div className="achievements-section">
        <h3>Achievements</h3>
        <div className="achievements-grid">
          {achievements.map(achievement => (
            <div key={achievement.id} className={`achievement-card ${achievement.earned ? 'earned' : 'not-earned'}`}>
              <div className="achievement-icon">{achievement.icon}</div>
              <div className="achievement-content">
                <h4>{achievement.title}</h4>
                <p>{achievement.description}</p>
                {achievement.earned && (
                  <span className="achievement-date">Earned: {achievement.date}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderFindHospitals = () => (
    <div className="find-hospitals-section">
      <div className="section-header">
        <h2>Find Blood Donation Opportunities</h2>
        <div className="search-filters">
          <input
            type="text"
            placeholder={t.searchLocation}
            className="search-input"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
          />
          <select
            className="filter-select"
            value={searchBloodGroup}
            onChange={(e) => setSearchBloodGroup(e.target.value)}
          >
            <option value="">{t.searchBloodGroup}</option>
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
      </div>

      <div className="requests-grid">
        {filteredRequests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <div className="hospital-info">
                <h3>{request.hospital}</h3>
                <p className="location">📍 {request.location}</p>
              </div>
              <div className="distance-badge">{request.distance}</div>
            </div>
            
            <div className="request-content">
              <div className="blood-group-badge">{request.bloodGroup}</div>
              <p><strong>{request.units}</strong> units needed</p>
              <p className="request-date">Posted: {request.date}</p>
            </div>
            
            <div className="request-footer">
              <div className={`urgency-badge ${request.urgency}`}>
                {t[request.urgency]} Priority
              </div>
              <div className="request-actions">
                <button className="btn btn-primary btn-sm">{t.donate}</button>
                <button className="btn btn-secondary btn-sm">{t.contact}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDonationHistory = () => (
    <div className="donation-history-section">
      <div className="section-header">
        <h2>Your Donation History</h2>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>{t.hospital}</th>
              <th>{t.bloodGroup}</th>
              <th>{t.date}</th>
              <th>Credits</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {donationHistory.map(donation => (
              <tr key={donation.id}>
                <td>{donation.hospital}</td>
                <td><span className="badge badge-primary">{donation.bloodGroup}</span></td>
                <td>{donation.date}</td>
                <td>{donation.credits}</td>
                <td>
                  <span className={`badge ${donation.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                    {t[donation.status]}
                  </span>
                </td>
                <td>
                  <button className="btn btn-secondary btn-sm">{t.viewDetails}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-section">
      <div className="section-header">
        <h2>{t.updateProfile}</h2>
      </div>

      <div className="profile-form">
        <div className="form-section">
          <h3>{t.personalInfo}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t.name}</label>
              <input type="text" className="form-control" defaultValue={user?.name || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">{t.email}</label>
              <input type="email" className="form-control" defaultValue={user?.email || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">{t.phone}</label>
              <input type="tel" className="form-control" defaultValue={user?.phone || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">{t.age}</label>
              <input type="number" className="form-control" defaultValue={user?.age || ''} />
            </div>
            <div className="form-group">
              <label className="form-label">{t.gender}</label>
              <select className="form-select" defaultValue={user?.gender || ''}>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t.bloodGroup}</label>
              <select className="form-select" defaultValue={user?.bloodGroup || ''}>
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
          </div>
        </div>

        <div className="form-section">
          <h3>{t.preferences}</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t.availableDays}</label>
              <input type="text" className="form-control" placeholder="e.g., Monday, Wednesday, Friday" />
            </div>
            <div className="form-group">
              <label className="form-label">{t.preferredTime}</label>
              <select className="form-select">
                <option value="">Select Preferred Time</option>
                <option value="morning">Morning (8 AM - 12 PM)</option>
                <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                <option value="evening">Evening (5 PM - 8 PM)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t.emergencyContact}</label>
              <input type="tel" className="form-control" placeholder="Emergency contact number" />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary btn-large">{t.save}</button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'findHospitals': return renderFindHospitals();
      case 'donationHistory': return renderDonationHistory();
      case 'profile': return renderProfile();
      default: return renderOverview();
    }
  };

  return (
    <div className="user-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">👤</div>
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
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <h3>{t.welcome}</h3>
              <p>{user?.name}</p>
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
              className={`nav-item ${activeTab === 'findHospitals' ? 'active' : ''}`}
              onClick={() => setActiveTab('findHospitals')}
            >
              🏥 {t.findHospitals}
            </button>
            <button 
              className={`nav-item ${activeTab === 'donationHistory' ? 'active' : ''}`}
              onClick={() => setActiveTab('donationHistory')}
            >
              🩸 {t.donationHistory}
            </button>
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              ⚙️ {t.profile}
            </button>
            <button 
              className={`nav-item ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              🏆 {t.achievements}
            </button>
            <button 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 {t.notifications}
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-header">
            <h1>{t.title}</h1>
            <div className="content-actions">
              <button className="btn btn-primary">
                Emergency Alert
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

export default UserDashboard;
