<?php
require_once '../config/config.php';
require_once '../config/database.php';

class UserAPI {
    private $conn;
    private $db;
    private $user_id;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->user_id = $this->verifyUserAccess();
    }

    // Verify user access
    private function verifyUserAccess() {
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
        if (!$payload || $payload['user_type'] !== 'user') {
            sendError("User access required", 403);
        }

        return $payload['user_id'];
    }

    // Get user dashboard overview
    public function getDashboardOverview() {
        $stats = [];

        // Get user profile
        $query = "SELECT up.*, u.name, u.email, u.phone 
                  FROM user_profiles up 
                  JOIN users u ON up.user_id = u.id 
                  WHERE up.user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $stats['profile'] = $stmt->fetch();

        // Total donations
        $query = "SELECT COUNT(*) as count FROM donations WHERE donor_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $stats['total_donations'] = $stmt->fetch()['count'];

        // Total credits
        $query = "SELECT SUM(amount) as total FROM credits WHERE user_id = ? AND transaction_type = 'earned'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $stats['total_credits'] = $stmt->fetch()['total'] ?? 0;

        // Last donation
        $query = "SELECT donation_date FROM donations WHERE donor_id = ? ORDER BY donation_date DESC LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $last_donation = $stmt->fetch();
        $stats['last_donation'] = $last_donation ? $last_donation['donation_date'] : null;

        // Next eligible date
        $query = "SELECT next_eligible_date FROM user_profiles WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $next_eligible = $stmt->fetch();
        $stats['next_eligible'] = $next_eligible ? $next_eligible['next_eligible_date'] : null;

        // Recent donations
        $query = "SELECT d.*, hd.hospital_name 
                  FROM donations d 
                  LEFT JOIN hospital_details hd ON d.hospital_id = hd.user_id 
                  WHERE d.donor_id = ? 
                  ORDER BY d.created_at DESC 
                  LIMIT 5";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $stats['recent_donations'] = $stmt->fetchAll();

        // Achievements
        $query = "SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $stats['achievements'] = $stmt->fetchAll();

        sendResponse($stats);
    }

    // Get donation history
    public function getDonationHistory() {
        $query = "SELECT d.*, hd.hospital_name, br.blood_group as requested_blood_group, br.units_required
                  FROM donations d 
                  LEFT JOIN hospital_details hd ON d.hospital_id = hd.user_id 
                  LEFT JOIN blood_requests br ON d.blood_request_id = br.id 
                  WHERE d.donor_id = ? 
                  ORDER BY d.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $donations = $stmt->fetchAll();

        sendResponse($donations);
    }

    // Find hospitals with blood requests
    public function findHospitals() {
        $blood_group = $_GET['blood_group'] ?? null;
        $location = $_GET['location'] ?? null;
        $urgency = $_GET['urgency'] ?? null;

        $query = "SELECT br.*, hd.hospital_name, hd.location as hospital_location, hd.contact_phone, hd.contact_email
                  FROM blood_requests br 
                  JOIN hospital_details hd ON br.hospital_id = hd.user_id 
                  JOIN users u ON br.hospital_id = u.id 
                  WHERE br.status = 'active' AND u.status = 'active' AND hd.verification_status = 'verified'";

        $params = [];

        if ($blood_group) {
            $query .= " AND br.blood_group = ?";
            $params[] = $blood_group;
        }

        if ($location) {
            $query .= " AND hd.location LIKE ?";
            $params[] = "%$location%";
        }

        if ($urgency) {
            $query .= " AND br.urgency = ?";
            $params[] = $urgency;
        }

        $query .= " ORDER BY br.urgency DESC, br.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        $requests = $stmt->fetchAll();

        sendResponse($requests);
    }

    // Get user profile
    public function getProfile() {
        $query = "SELECT u.*, up.*, hd.hospital_name, hd.verification_status 
                  FROM users u 
                  LEFT JOIN user_profiles up ON u.id = up.user_id 
                  LEFT JOIN hospital_details hd ON u.id = hd.user_id 
                  WHERE u.id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $user = $stmt->fetch();

        if (!$user) {
            sendError("User not found", 404);
        }

        unset($user['password']);
        sendResponse($user);
    }

    // Update user profile
    public function updateProfile() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        try {
            $this->conn->beginTransaction();

            // Update user basic info
            $query = "UPDATE users SET name = ?, phone = ? WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([
                sanitizeInput($data['name']),
                sanitizeInput($data['phone']),
                $this->user_id
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
                $this->user_id
            ]);

            $this->conn->commit();
            sendResponse(null, 200, 'Profile updated successfully');

        } catch (Exception $e) {
            $this->conn->rollBack();
            sendError("Profile update failed: " . $e->getMessage(), 500);
        }
    }

    // Get achievements
    public function getAchievements() {
        $query = "SELECT * FROM achievements WHERE user_id = ? ORDER BY earned_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $achievements = $stmt->fetchAll();

        // Get available achievements
        $available_achievements = $this->getAvailableAchievements();
        
        sendResponse([
            'earned' => $achievements,
            'available' => $available_achievements
        ]);
    }

    // Get available achievements
    private function getAvailableAchievements() {
        $available = [];

        // Get user stats
        $query = "SELECT total_donations, total_credits FROM user_profiles WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $stats = $stmt->fetch();

        // Check for First Donation
        if ($stats['total_donations'] >= 1) {
            $available[] = [
                'type' => 'first_donation',
                'title' => 'First Donation',
                'description' => 'Completed your first blood donation',
                'icon' => '🎯',
                'earned' => true
            ];
        } else {
            $available[] = [
                'type' => 'first_donation',
                'title' => 'First Donation',
                'description' => 'Complete your first blood donation',
                'icon' => '🎯',
                'earned' => false
            ];
        }

        // Check for Life Saver (3 donations)
        if ($stats['total_donations'] >= 3) {
            $available[] = [
                'type' => 'life_saver',
                'title' => 'Life Saver',
                'description' => 'Donated blood 3 times',
                'icon' => '🩸',
                'earned' => true
            ];
        } else {
            $available[] = [
                'type' => 'life_saver',
                'title' => 'Life Saver',
                'description' => 'Donate blood 3 times',
                'icon' => '🩸',
                'earned' => false
            ];
        }

        // Check for Regular Donor (5 donations)
        if ($stats['total_donations'] >= 5) {
            $available[] = [
                'type' => 'regular_donor',
                'title' => 'Regular Donor',
                'description' => 'Donated blood 5 times',
                'icon' => '⭐',
                'earned' => true
            ];
        } else {
            $available[] = [
                'type' => 'regular_donor',
                'title' => 'Regular Donor',
                'description' => 'Donate blood 5 times',
                'icon' => '⭐',
                'earned' => false
            ];
        }

        return $available;
    }

    // Get notifications
    public function getNotifications() {
        $query = "SELECT * FROM notifications 
                  WHERE (user_id IS NULL OR user_id = ?) 
                  AND (location_filter IS NULL OR location_filter = (SELECT location FROM user_profiles WHERE user_id = ?))
                  AND (blood_group_filter IS NULL OR blood_group_filter = (SELECT blood_group FROM user_profiles WHERE user_id = ?))
                  ORDER BY created_at DESC 
                  LIMIT 50";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id, $this->user_id, $this->user_id]);
        $notifications = $stmt->fetchAll();

        sendResponse($notifications);
    }

    // Mark notification as read
    public function markNotificationRead() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['notification_id'];
        $errors = validateInput($data, $required_fields);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors));
        }

        $notification_id = $data['notification_id'];

        $query = "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND (user_id IS NULL OR user_id = ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$notification_id, $this->user_id]);

        sendResponse(null, 200, 'Notification marked as read');
    }

    // Get credit history
    public function getCreditHistory() {
        $query = "SELECT * FROM credits WHERE user_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $credits = $stmt->fetchAll();

        sendResponse($credits);
    }

    // Check donation eligibility
    public function checkEligibility() {
        $query = "SELECT next_eligible_date, last_donation_date FROM user_profiles WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id]);
        $profile = $stmt->fetch();

        if (!$profile) {
            sendError("User profile not found", 404);
        }

        $eligible = false;
        $message = "";

        if ($profile['next_eligible_date'] === null || strtotime($profile['next_eligible_date']) <= time()) {
            $eligible = true;
            $message = "You are eligible to donate blood";
        } else {
            $message = "You are not eligible to donate blood yet. Next eligible date: " . $profile['next_eligible_date'];
        }

        sendResponse([
            'eligible' => $eligible,
            'message' => $message,
            'next_eligible_date' => $profile['next_eligible_date'],
            'last_donation_date' => $profile['last_donation_date']
        ]);
    }

    // Get emergency alerts
    public function getEmergencyAlerts() {
        $query = "SELECT * FROM notifications 
                  WHERE type = 'emergency' AND priority = 'urgent'
                  AND (user_id IS NULL OR user_id = ?) 
                  AND (location_filter IS NULL OR location_filter = (SELECT location FROM user_profiles WHERE user_id = ?))
                  AND (blood_group_filter IS NULL OR blood_group_filter = (SELECT blood_group FROM user_profiles WHERE user_id = ?))
                  AND created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                  ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->user_id, $this->user_id, $this->user_id]);
        $alerts = $stmt->fetchAll();

        sendResponse($alerts);
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
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$user = new UserAPI();

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'overview':
                $user->getDashboardOverview();
                break;
            case 'donation_history':
                $user->getDonationHistory();
                break;
            case 'find_hospitals':
                $user->findHospitals();
                break;
            case 'profile':
                $user->getProfile();
                break;
            case 'achievements':
                $user->getAchievements();
                break;
            case 'notifications':
                $user->getNotifications();
                break;
            case 'credit_history':
                $user->getCreditHistory();
                break;
            case 'eligibility':
                $user->checkEligibility();
                break;
            case 'emergency_alerts':
                $user->getEmergencyAlerts();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    case 'PUT':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'profile':
                $user->updateProfile();
                break;
            case 'mark_notification_read':
                $user->markNotificationRead();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    default:
        sendError("Method not allowed", 405);
}
?>
