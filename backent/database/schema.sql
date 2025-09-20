-- Blood Bridge Database Schema
CREATE DATABASE IF NOT EXISTS blood_bridge;
USE blood_bridge;

-- Users table (for all user types: admin, hospital, user)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type ENUM('admin', 'hospital', 'user') NOT NULL,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User profiles table (extended information)
CREATE TABLE user_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    age INT,
    gender ENUM('male', 'female', 'other'),
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    location VARCHAR(255),
    address TEXT,
    emergency_contact VARCHAR(20),
    preferred_donation_days VARCHAR(100),
    preferred_donation_time ENUM('morning', 'afternoon', 'evening'),
    last_donation_date DATE,
    next_eligible_date DATE,
    total_donations INT DEFAULT 0,
    total_credits INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hospital details table
CREATE TABLE hospital_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    certification_number VARCHAR(100) UNIQUE,
    license_number VARCHAR(100),
    location VARCHAR(255),
    address TEXT,
    contact_person VARCHAR(255),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    blood_bank_contact VARCHAR(20),
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verification_date TIMESTAMP NULL,
    verified_by INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Blood requests table
CREATE TABLE blood_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_required INT NOT NULL,
    urgency ENUM('low', 'medium', 'high') DEFAULT 'medium',
    description TEXT,
    status ENUM('active', 'fulfilled', 'cancelled') DEFAULT 'active',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fulfilled_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Donations table
CREATE TABLE donations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT NOT NULL,
    hospital_id INT NOT NULL,
    blood_request_id INT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_donated INT DEFAULT 1,
    donation_date DATE NOT NULL,
    status ENUM('pending', 'completed', 'rejected') DEFAULT 'pending',
    credits_awarded INT DEFAULT 50,
    notes TEXT,
    verified_by INT NULL,
    verification_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (hospital_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (blood_request_id) REFERENCES blood_requests(id),
    FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Credits table (for tracking credit transactions)
CREATE TABLE credits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    transaction_type ENUM('earned', 'redeemed', 'adjusted', 'bonus') NOT NULL,
    amount INT NOT NULL,
    description VARCHAR(255),
    reference_id INT NULL, -- Can reference donation_id or other relevant ID
    reference_type ENUM('donation', 'bonus', 'adjustment', 'redemption') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL, -- NULL for system-wide notifications
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'warning', 'success', 'error', 'emergency') DEFAULT 'info',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    sent_via ENUM('app', 'email', 'sms', 'whatsapp') DEFAULT 'app',
    location_filter VARCHAR(255) NULL,
    blood_group_filter ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Blood inventory table (for hospitals)
CREATE TABLE blood_inventory (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hospital_id INT NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_available INT DEFAULT 0,
    units_reserved INT DEFAULT 0,
    expiry_date DATE,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (hospital_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_hospital_blood (hospital_id, blood_group)
);

-- Hospital exchanges table (for hospital-to-hospital blood exchanges)
CREATE TABLE hospital_exchanges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    requesting_hospital_id INT NOT NULL,
    providing_hospital_id INT NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    units_requested INT NOT NULL,
    units_provided INT DEFAULT 0,
    status ENUM('pending', 'approved', 'completed', 'rejected') DEFAULT 'pending',
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (requesting_hospital_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (providing_hospital_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Achievements table
CREATE TABLE achievements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    achievement_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    earned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System settings table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO users (email, password, name, user_type, status) VALUES 
('admin@bloodbridge.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 'active');

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES 
('credits_per_donation', '50', 'Credits awarded per blood donation'),
('donation_cooldown_days', '56', 'Minimum days between donations'),
('emergency_notification_radius', '50', 'Radius in km for emergency notifications'),
('max_blood_units_per_donation', '1', 'Maximum blood units per donation'),
('app_version', '1.0.0', 'Current application version');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_blood_requests_hospital ON blood_requests(hospital_id);
CREATE INDEX idx_blood_requests_status ON blood_requests(status);
CREATE INDEX idx_blood_requests_blood_group ON blood_requests(blood_group);
CREATE INDEX idx_donations_donor ON donations(donor_id);
CREATE INDEX idx_donations_hospital ON donations(hospital_id);
CREATE INDEX idx_donations_date ON donations(donation_date);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_credits_user ON credits(user_id);
