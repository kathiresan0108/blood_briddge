<?php
require_once '../config/config.php';
require_once '../config/database.php';

class AuthAPI {
    private $conn;
    private $db;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    // User registration
    public function register() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['email', 'password', 'name', 'user_type'];
        $errors = validateInput($data, $required_fields);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors));
        }

        $email = sanitizeInput($data['email']);
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        $name = sanitizeInput($data['name']);
        $user_type = sanitizeInput($data['user_type']);
        $phone = isset($data['phone']) ? sanitizeInput($data['phone']) : null;

        // Check if email already exists
        $query = "SELECT id FROM users WHERE email = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$email]);
        
        if ($stmt->rowCount() > 0) {
            sendError("Email already exists", 409);
        }

        try {
            $this->conn->beginTransaction();

            // Insert user
            $query = "INSERT INTO users (email, password, name, phone, user_type) VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$email, $password, $name, $phone, $user_type]);
            $user_id = $this->conn->lastInsertId();

            // Insert user profile
            $query = "INSERT INTO user_profiles (user_id, age, gender, blood_group, location, address, emergency_contact, preferred_donation_days, preferred_donation_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $user_id,
                isset($data['age']) ? $data['age'] : null,
                isset($data['gender']) ? $data['gender'] : null,
                isset($data['blood_group']) ? $data['blood_group'] : null,
                isset($data['location']) ? $data['location'] : null,
                isset($data['address']) ? $data['address'] : null,
                isset($data['emergency_contact']) ? $data['emergency_contact'] : null,
                isset($data['preferred_donation_days']) ? $data['preferred_donation_days'] : null,
                isset($data['preferred_donation_time']) ? $data['preferred_donation_time'] : null
            ]);

            // Insert hospital details if user_type is hospital
            if ($user_type === 'hospital') {
                $query = "INSERT INTO hospital_details (user_id, hospital_name, certification_number, license_number, location, address, contact_person, contact_phone, contact_email, blood_bank_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([
                    $user_id,
                    isset($data['hospital_name']) ? $data['hospital_name'] : $name,
                    isset($data['certification_number']) ? $data['certification_number'] : null,
                    isset($data['license_number']) ? $data['license_number'] : null,
                    isset($data['location']) ? $data['location'] : null,
                    isset($data['address']) ? $data['address'] : null,
                    isset($data['contact_person']) ? $data['contact_person'] : $name,
                    isset($data['contact_phone']) ? $data['contact_phone'] : $phone,
                    isset($data['contact_email']) ? $data['contact_email'] : $email,
                    isset($data['blood_bank_contact']) ? $data['blood_bank_contact'] : null
                ]);
            }

            $this->conn->commit();
            
            sendResponse([
                'user_id' => $user_id,
                'message' => 'User registered successfully'
            ], 201, 'Registration successful');

        } catch (Exception $e) {
            $this->conn->rollBack();
            sendError("Registration failed: " . $e->getMessage(), 500);
        }
    }

    // User login
   // User login
public function login() {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $required_fields = ['email', 'password'];
    $errors = validateInput($data, $required_fields);
    
    if (!empty($errors)) {
        sendError(implode(', ', $errors));
    }

    $email = sanitizeInput($data['email']);
    $password = $data['password'];

    $query = "SELECT u.*, up.*, hd.hospital_name, hd.verification_status 
              FROM users u 
              LEFT JOIN user_profiles up ON u.id = up.user_id 
              LEFT JOIN hospital_details hd ON u.id = hd.user_id 
              WHERE u.email = ?";
    
    $stmt = $this->conn->prepare($query);
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        sendError("Invalid email or password", 401);
    }

    if (!password_verify($password, $user['password'])) {
        sendError("Invalid email or password", 401);
    }

    // Optional: Status check ONLY for hospital users
    if ($user['user_type'] === 'hospital') {
        // If using 'status' column
        if (isset($user['status']) && $user['status'] !== 'active') {
            sendError("Hospital account is not activated", 403);
        }

        // OR if using verification_status from hospital_details
        if (isset($user['verification_status']) && $user['verification_status'] !== 'verified') {
            sendError("Hospital account is not verified", 403);
        }
    }

    // Remove password before sending response
    unset($user['password']);

    // Generate JWT token
    $token = $this->generateToken($user['id'], $user['user_type']);

    sendResponse([
        'user' => $user,
        'token' => $token
    ], 200, 'Login successful');
}


    // Get user profile
    public function getProfile() {
        $user_id = $this->getUserIdFromToken();
        
        $query = "SELECT u.*, up.*, hd.hospital_name, hd.verification_status, hd.certification_number 
                  FROM users u 
                  LEFT JOIN user_profiles up ON u.id = up.user_id 
                  LEFT JOIN hospital_details hd ON u.id = hd.user_id 
                  WHERE u.id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        if (!$user) {
            sendError("User not found", 404);
        }

        unset($user['password']);
        sendResponse($user);
    }

    // Update user profile
    public function updateProfile() {
        $user_id = $this->getUserIdFromToken();
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $this->conn->beginTransaction();

            // Update user basic info
            $query = "UPDATE users SET name = ?, phone = ? WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                sanitizeInput($data['name']),
                sanitizeInput($data['phone']),
                $user_id
            ]);

            // Update user profile
            $query = "UPDATE user_profiles SET 
                      age = ?, gender = ?, blood_group = ?, location = ?, address = ?, 
                      emergency_contact = ?, preferred_donation_days = ?, preferred_donation_time = ?
                      WHERE user_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                $data['age'],
                $data['gender'],
                $data['blood_group'],
                sanitizeInput($data['location']),
                sanitizeInput($data['address']),
                sanitizeInput($data['emergency_contact']),
                sanitizeInput($data['preferred_donation_days']),
                $data['preferred_donation_time'],
                $user_id
            ]);

            // Update hospital details if user is hospital
            if (isset($data['hospital_name'])) {
                $query = "UPDATE hospital_details SET 
                          hospital_name = ?, location = ?, address = ?, contact_person = ?, 
                          contact_phone = ?, contact_email = ?, blood_bank_contact = ?
                          WHERE user_id = ?";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([
                    sanitizeInput($data['hospital_name']),
                    sanitizeInput($data['location']),
                    sanitizeInput($data['address']),
                    sanitizeInput($data['contact_person']),
                    sanitizeInput($data['contact_phone']),
                    sanitizeInput($data['contact_email']),
                    sanitizeInput($data['blood_bank_contact']),
                    $user_id
                ]);
            }

            $this->conn->commit();
            sendResponse(null, 200, 'Profile updated successfully');

        } catch (Exception $e) {
            $this->conn->rollBack();
            sendError("Profile update failed: " . $e->getMessage(), 500);
        }
    }

    // Change password
    public function changePassword() {
        $user_id = $this->getUserIdFromToken();
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['current_password', 'new_password'];
        $errors = validateInput($data, $required_fields);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors));
        }

        // Verify current password
        $query = "SELECT password FROM users WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$user_id]);
        $user = $stmt->fetch();

        if (!password_verify($data['current_password'], $user['password'])) {
            sendError("Current password is incorrect", 400);
        }

        // Update password
        $new_password = password_hash($data['new_password'], PASSWORD_DEFAULT);
        $query = "UPDATE users SET password = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$new_password, $user_id]);

        sendResponse(null, 200, 'Password changed successfully');
    }

    // Generate JWT token (simplified)
    private function generateToken($user_id, $user_type) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $user_id,
            'user_type' => $user_type,
            'exp' => time() + (24 * 60 * 60) // 24 hours
        ]);
        
        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, JWT_SECRET, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }

    // Verify JWT token
    private function verifyToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return false;
        }

        $header = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[0]));
        $payload = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1]));
        $signature = base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[2]));

        $expectedSignature = hash_hmac('sha256', $parts[0] . "." . $parts[1], JWT_SECRET, true);

        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }

        $payloadData = json_decode($payload, true);
        if ($payloadData['exp'] < time()) {
            return false;
        }

        return $payloadData;
    }

    // Get user ID from token
    private function getUserIdFromToken() {
        $headers = getallheaders();
        $token = null;

        if (isset($headers['Authorization'])) {
            $authHeader = $headers['Authorization'];
            if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            sendError("Access token required", 401);
        }

        $payload = $this->verifyToken($token);
        if (!$payload) {
            sendError("Invalid or expired token", 401);
        }

        return $payload['user_id'];
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$auth = new AuthAPI();

switch ($method) {
    case 'POST':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'register':
                $auth->register();
                break;
            case 'login':
                $auth->login();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    case 'GET':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'profile':
                $auth->getProfile();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    case 'PUT':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'profile':
                $auth->updateProfile();
                break;
            case 'password':
                $auth->changePassword();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    default:
        sendError("Method not allowed", 405);
}
?>
