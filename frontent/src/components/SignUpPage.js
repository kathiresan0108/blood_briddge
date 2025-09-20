import React, { useState } from 'react';
import './SignUpPage.css';
import apiService from '../services/api';

function SignUpPage({ onSignUpSuccess, onBackToWelcome }) {
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    age: '',
    gender: '',
    bloodGroup: '',
    location: '',
    address: '',
    emergencyContact: '',
    preferredDonationDays: '',
    preferredDonationTime: '',
    hospitalName: '',
    certificationNumber: '',
    licenseNumber: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    bloodBankContact: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (userType === 'user') {
      if (!formData.name || !formData.phone || !formData.bloodGroup) {
        setError('Name, phone, and blood group are required for user registration');
        return false;
      }
    }

    if (userType === 'hospital') {
      if (!formData.hospitalName || !formData.certificationNumber) {
        setError('Hospital name and certification number are required');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        email: formData.email,
        password: formData.password,
        name: formData.name || formData.hospitalName,
        user_type: userType,
        phone: formData.phone,
        age: formData.age,
        gender: formData.gender,
        blood_group: formData.bloodGroup,
        location: formData.location,
        address: formData.address,
        emergency_contact: formData.emergencyContact,
        preferred_donation_days: formData.preferredDonationDays,
        preferred_donation_time: formData.preferredDonationTime,
        hospital_name: formData.hospitalName,
        certification_number: formData.certificationNumber,
        license_number: formData.licenseNumber,
        contact_person: formData.contactPerson,
        contact_phone: formData.contactPhone,
        contact_email: formData.contactEmail,
        blood_bank_contact: formData.bloodBankContact
      };

      await apiService.register(registrationData);
      alert('Registration successful! Please login with your credentials.');
      onSignUpSuccess();
    } catch (error) {
      setError(error.message || 'An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = (type) => {
    switch(type) {
      case 'admin': return '👨‍💼';
      case 'hospital': return '🏥';
      case 'user': return '👤';
      default: return '🔐';
    }
  };

  const getUserTypeDescription = (type) => {
    switch(type) {
      case 'admin': return 'Manage the entire Blood Bridge platform';
      case 'hospital': return 'Post blood requests and manage donations';
      case 'user': return 'Donate blood and help save lives';
      default: return '';
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <button className="back-button" onClick={onBackToWelcome}>
            ← Back to Welcome
          </button>
          <h1 className="signup-title">Join Blood Bridge</h1>
          <p className="signup-subtitle">Create your account and start making a difference</p>
        </div>

        <div className="user-type-selection">
          <h3>Choose your account type:</h3>
          <div className="user-type-cards">
            <div 
              className={`user-type-card ${userType === 'user' ? 'selected' : ''}`}
              onClick={() => handleUserTypeChange('user')}
            >
              <div className="user-type-icon">👤</div>
              <h4>Blood Donor</h4>
              <p>Donate blood and help save lives</p>
            </div>
            <div 
              className={`user-type-card ${userType === 'hospital' ? 'selected' : ''}`}
              onClick={() => handleUserTypeChange('hospital')}
            >
              <div className="user-type-icon">🏥</div>
              <h4>Hospital</h4>
              <p>Post blood requests and manage donations</p>
            </div>
            <div 
              className={`user-type-card ${userType === 'admin' ? 'selected' : ''}`}
              onClick={() => handleUserTypeChange('admin')}
            >
              <div className="user-type-icon">👨‍💼</div>
              <h4>Admin</h4>
              <p>Manage the entire platform</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="form-section">
            <h3>Account Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          {userType === 'user' && (
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    name="age"
                    className="form-control"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="65"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    className="form-control"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Blood Group *</label>
                  <select
                    name="bloodGroup"
                    className="form-control"
                    value={formData.bloodGroup}
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
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Emergency Contact</label>
                  <input
                    type="tel"
                    name="emergencyContact"
                    className="form-control"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Donation Days</label>
                  <input
                    type="text"
                    name="preferredDonationDays"
                    className="form-control"
                    value={formData.preferredDonationDays}
                    onChange={handleInputChange}
                    placeholder="e.g., Weekends, Monday-Friday"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Donation Time</label>
                <select
                  name="preferredDonationTime"
                  className="form-control"
                  value={formData.preferredDonationTime}
                  onChange={handleInputChange}
                >
                  <option value="">Select Preferred Time</option>
                  <option value="Morning">Morning (8 AM - 12 PM)</option>
                  <option value="Afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="Evening">Evening (5 PM - 8 PM)</option>
                  <option value="Any">Any Time</option>
                </select>
              </div>
            </div>
          )}

          {userType === 'hospital' && (
            <div className="form-section">
              <h3>Hospital Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Hospital Name *</label>
                  <input
                    type="text"
                    name="hospitalName"
                    className="form-control"
                    value={formData.hospitalName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Certification Number *</label>
                  <input
                    type="text"
                    name="certificationNumber"
                    className="form-control"
                    value={formData.certificationNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">License Number</label>
                  <input
                    type="text"
                    name="licenseNumber"
                    className="form-control"
                    value={formData.licenseNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    className="form-control"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    name="contactPhone"
                    className="form-control"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Contact Email</label>
                  <input
                    type="email"
                    name="contactEmail"
                    className="form-control"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Bank Contact</label>
                  <input
                    type="tel"
                    name="bloodBankContact"
                    className="form-control"
                    value={formData.bloodBankContact}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          {userType === 'admin' && (
            <div className="form-section">
              <h3>Admin Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  name="location"
                  className="form-control"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          <div className="form-footer">
            <p>
              Already have an account? 
              <button
                type="button"
                className="link-button"
                onClick={onBackToWelcome}
              >
                Login here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
