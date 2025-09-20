import React, { useState } from 'react';
import './LoginModal.css';
import apiService from '../services/api';
import authService from '../services/authService';

function LoginModal({ loginType, onLogin, onClose }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    hospitalName: '',
    certificationNumber: '',
    bloodGroup: '',
    age: '',
    gender: '',
    location: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    if (isRegistering) {
      // Additional validation for registration
      if (loginType === 'user' && (!formData.name || !formData.phone || !formData.bloodGroup)) {
        setError('Name, phone, and blood group are required for user registration');
        return;
      }
      if (loginType === 'hospital' && (!formData.hospitalName || !formData.certificationNumber)) {
        setError('Hospital name and certification number are required');
        return;
      }
    }

    try {
      if (isRegistering) {
        // Registration
        const registrationData = {
          email: formData.email,
          password: formData.password,
          name: formData.name || formData.hospitalName,
          user_type: loginType,
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
        setError('');
        alert('Registration successful! Please login with your credentials.');
        setIsRegistering(false);
      } else {
        // Login
        const response = await authService.login(formData.email, formData.password);
        onLogin(response.data.user);
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.');
    }
  };

  const getTitle = () => {
    if (isRegistering) {
      return `Register as ${loginType.charAt(0).toUpperCase() + loginType.slice(1)}`;
    }
    return `${loginType.charAt(0).toUpperCase() + loginType.slice(1)} Login`;
  };

  const getIcon = () => {
    switch(loginType) {
      case 'admin': return '👨‍💼';
      case 'hospital': return '🏥';
      case 'user': return '👤';
      default: return '🔐';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-container">
            <span className="modal-icon">{getIcon()}</span>
            <h2 className="modal-title">{getTitle()}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert-danger">{error}</div>}

          {/* Common fields */}
          <div className="form-group">
            <label className="form-label">Email</label>
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
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Registration fields */}
          {isRegistering && (
            <>
              {loginType === 'user' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
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
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select
                      name="bloodGroup"
                      className="form-select"
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
                      className="form-select"
                      value={formData.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
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
                </>
              )}

              {loginType === 'hospital' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Hospital Name</label>
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
                    <label className="form-label">Certification Number</label>
                    <input
                      type="text"
                      name="certificationNumber"
                      className="form-control"
                      value={formData.certificationNumber}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Person</label>
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
                </>
              )}
            </>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-large">
              {isRegistering ? 'Register' : 'Login'}
            </button>
          </div>

          <div className="form-footer">
            <p>
              {isRegistering ? 'Already have an account?' : "Don't have an account?"}
              <button
                type="button"
                className="link-button"
                onClick={() => setIsRegistering(!isRegistering)}
              >
                {isRegistering ? 'Login' : 'Register'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;
