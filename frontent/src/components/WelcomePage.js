import React, { useState } from 'react';
import './WelcomePage.css';

function WelcomePage({ onLoginClick, onSignUpClick }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const translations = {
    en: {
      title: "Blood Bridge",
      subtitle: "Connecting Lives Through Blood Donation",
      whoWeAre: "Who We Are",
      whoWeAreText: "Blood Bridge is a revolutionary platform that connects hospitals, blood banks, and donors to ensure timely blood availability when it matters most. We bridge the gap between those who need blood and those willing to donate, creating a network of life-saving connections.",
      whatWeDo: "What We Do",
      whatWeDoText: "Our platform facilitates seamless blood donation coordination between hospitals and donors. We provide real-time blood requirement tracking, donor management, and emergency notification systems to ensure no life is lost due to blood unavailability.",
      contactInfo: "Contact Information",
      address: "123 Health Street, Medical District, City - 123456",
      phone: "+91 98765 43210",
      email: "info@bloodbridge.com",
      adminLogin: "Admin Login",
      hospitalLogin: "Hospital Login",
      userLogin: "User Login",
      signUp: "Sign Up",
      emergency: "Emergency Blood Request?",
      emergencyText: "Contact us immediately for urgent blood requirements"
    },
    ta: {
      title: "ரத்த பாலம்",
      subtitle: "ரத்த தானம் மூலம் வாழ்க்கைகளை இணைத்தல்",
      whoWeAre: "நாங்கள் யார்",
      whoWeAreText: "ரத்த பாலம் என்பது மருத்துவமனைகள், ரத்த வங்கிகள் மற்றும் தானம் செய்பவர்களை இணைக்கும் ஒரு புரட்சிகரமான தளமாகும். ரத்தம் தேவைப்படும் நேரத்தில் சரியான நேரத்தில் கிடைக்கும் என்பதை உறுதி செய்கிறது.",
      whatWeDo: "நாங்கள் என்ன செய்கிறோம்",
      whatWeDoText: "எங்கள் தளம் மருத்துவமனைகள் மற்றும் தானம் செய்பவர்களுக்கு இடையே ஒழுங்கான ரத்த தான ஒருங்கிணைப்பை எளிதாக்குகிறது.",
      contactInfo: "தொடர்பு தகவல்",
      address: "123 சுகாதார தெரு, மருத்துவ மாவட்டம், நகரம் - 123456",
      phone: "+91 98765 43210",
      email: "info@bloodbridge.com",
      adminLogin: "நிர்வாகி உள்நுழைவு",
      hospitalLogin: "மருத்துவமனை உள்நுழைவு",
      userLogin: "பயனர் உள்நுழைவு",
      signUp: "பதிவு செய்க",
      emergency: "அவசர ரத்த கோரிக்கை?",
      emergencyText: "அவசர ரத்த தேவைகளுக்கு உடனடியாக எங்களைத் தொடர்பு கொள்ளுங்கள்"
    },
    hi: {
      title: "रक्त सेतु",
      subtitle: "रक्तदान के माध्यम से जीवन को जोड़ना",
      whoWeAre: "हम कौन हैं",
      whoWeAreText: "रक्त सेतु एक क्रांतिकारी प्लेटफॉर्म है जो अस्पतालों, रक्त बैंकों और दाताओं को जोड़ता है ताकि सबसे महत्वपूर्ण समय में समय पर रक्त उपलब्धता सुनिश्चित हो सके।",
      whatWeDo: "हम क्या करते हैं",
      whatWeDoText: "हमारा प्लेटफॉर्म अस्पतालों और दाताओं के बीच निर्बाध रक्तदान समन्वय को सुगम बनाता है।",
      contactInfo: "संपर्क जानकारी",
      address: "123 स्वास्थ्य सड़क, चिकित्सा जिला, शहर - 123456",
      phone: "+91 98765 43210",
      email: "info@bloodbridge.com",
      adminLogin: "एडमिन लॉगिन",
      hospitalLogin: "अस्पताल लॉगिन",
      userLogin: "उपयोगकर्ता लॉगिन",
      signUp: "साइन अप",
      emergency: "आपातकालीन रक्त अनुरोध?",
      emergencyText: "तत्काल रक्त आवश्यकताओं के लिए तुरंत हमसे संपर्क करें"
    }
  };

  const t = translations[currentLanguage];

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
  };

  return (
    <div className="welcome-page">
      {/* Header */}
      <header className="welcome-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">🩸</div>
              <span>{t.title}</span>
            </div>
            <div className="language-selector">
              <button className="language-btn">
                {currentLanguage === 'en' ? '🇺🇸 EN' : 
                 currentLanguage === 'ta' ? '🇮🇳 தமிழ்' : '🇮🇳 हिंदी'}
              </button>
              <div className="language-dropdown">
                <div className="language-option" onClick={() => handleLanguageChange('en')}>
                  🇺🇸 English
                </div>
                <div className="language-option" onClick={() => handleLanguageChange('ta')}>
                  🇮🇳 தமிழ்
                </div>
                <div className="language-option" onClick={() => handleLanguageChange('hi')}>
                  🇮🇳 हिंदी
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">{t.title}</h1>
            <p className="hero-subtitle">{t.subtitle}</p>
            <div className="hero-buttons">
              <button 
                className="btn btn-primary btn-large"
                onClick={() => onLoginClick('user')}
              >
                {t.userLogin}
              </button>
              <button 
                className="btn btn-outline btn-large"
                onClick={() => onLoginClick('hospital')}
              >
                {t.hospitalLogin}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          {/* Who We Are Section */}
          <section className="content-section">
            <div className="row">
              <div className="col-6">
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">{t.whoWeAre}</h2>
                  </div>
                  <p className="card-text">{t.whoWeAreText}</p>
                </div>
              </div>
              <div className="col-6">
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title">{t.whatWeDo}</h2>
                  </div>
                  <p className="card-text">{t.whatWeDoText}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Login Options */}
          <section className="login-section">
            <div className="row">
              <div className="col-4">
                <div className="login-card">
                  <div className="login-icon">👨‍💼</div>
                  <h3>Admin</h3>
                  <p>Manage hospitals, users, and platform operations</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => onLoginClick('admin')}
                  >
                    {t.adminLogin}
                  </button>
                </div>
              </div>
              <div className="col-4">
                <div className="login-card">
                  <div className="login-icon">🏥</div>
                  <h3>Hospital</h3>
                  <p>Post blood requirements and manage donations</p>
                  <button 
                    className="btn btn-success"
                    onClick={() => onLoginClick('hospital')}
                  >
                    {t.hospitalLogin}
                  </button>
                </div>
              </div>
              <div className="col-4">
                <div className="login-card">
                  <div className="login-icon">👤</div>
                  <h3>User</h3>
                  <p>Donate blood and track your contributions</p>
                  <button 
                    className="btn btn-outline"
                    onClick={() => onLoginClick('user')}
                  >
                    {t.userLogin}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Sign Up Section */}
            <div className="signup-section">
              <div className="signup-card">
                <div className="signup-icon">🌟</div>
                <h3>New to Blood Bridge?</h3>
                <p>Join our community and start making a difference today</p>
                <button 
                  className="btn btn-gradient"
                  onClick={onSignUpClick}
                >
                  {t.signUp}
                </button>
              </div>
            </div>
          </section>

          {/* Contact Information */}
          <section className="contact-section">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">{t.contactInfo}</h2>
              </div>
              <div className="row">
                <div className="col-4">
                  <div className="contact-item">
                    <div className="contact-icon">📍</div>
                    <h4>Address</h4>
                    <p>{t.address}</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="contact-item">
                    <div className="contact-icon">📞</div>
                    <h4>Phone</h4>
                    <p>{t.phone}</p>
                  </div>
                </div>
                <div className="col-4">
                  <div className="contact-item">
                    <div className="contact-icon">✉️</div>
                    <h4>Email</h4>
                    <p>{t.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Emergency Section */}
          <section className="emergency-section">
            <div className="alert alert-danger">
              <h3>{t.emergency}</h3>
              <p>{t.emergencyText}</p>
              <button className="btn btn-danger btn-large">
                Call Emergency: +91 98765 43210
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="welcome-footer">
        <div className="container">
          <div className="footer-content">
            <p>&copy; 2024 Blood Bridge. All rights reserved.</p>
            <p>Connecting lives, saving lives.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default WelcomePage;
