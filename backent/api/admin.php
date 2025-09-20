<?php
require_once '../config/config.php';
require_once '../config/database.php';

class AdminAPI {
    private $conn;
    private $db;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->verifyAdminAccess();
    }

    // Verify admin access
    private function verifyAdminAccess() {
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
        if (!$payload || $payload['user_type'] !== 'admin') {
            sendError("Admin access required", 403);
        }
    }

    // Get dashboard overview
    public function getDashboardOverview() {
        $stats = [];

        // Total hospitals
        $query = "SELECT COUNT(*) as count FROM users WHERE user_type = 'hospital'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total_hospitals'] = $stmt->fetch()['count'];

        // Total users
        $query = "SELECT COUNT(*) as count FROM users WHERE user_type = 'user'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total_users'] = $stmt->fetch()['count'];

        // Total donations
        $query = "SELECT COUNT(*) as count FROM donations";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total_donations'] = $stmt->fetch()['count'];

        // Pending hospital verifications
        $query = "SELECT COUNT(*) as count FROM hospital_details WHERE verification_status = 'pending'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['pending_verifications'] = $stmt->fetch()['count'];

        // Active blood requests
        $query = "SELECT COUNT(*) as count FROM blood_requests WHERE status = 'active'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['active_requests'] = $stmt->fetch()['count'];

        // Recent donations
        $query = "SELECT d.*, u.name as donor_name, h.hospital_name 
                  FROM donations d 
                  JOIN users u ON d.donor_id = u.id 
                  LEFT JOIN hospital_details h ON d.hospital_id = h.user_id 
                  ORDER BY d.created_at DESC 
                  LIMIT 10";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['recent_donations'] = $stmt->fetchAll();

        sendResponse($stats);
    }

    // Get all hospitals
    public function getHospitals() {
        $query = "SELECT u.*, hd.*, up.total_donations, up.total_credits 
                  FROM users u 
                  JOIN hospital_details hd ON u.id = hd.user_id 
                  LEFT JOIN user_profiles up ON u.id = up.user_id 
                  WHERE u.user_type = 'hospital' 
                  ORDER BY u.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $hospitals = $stmt->fetchAll();

        sendResponse($hospitals);
    }

    // Verify hospital
    public function verifyHospital() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['hospital_id', 'status'];
        $errors = validateInput($data, $required_fields);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors));
        }

        $hospital_id = $data['hospital_id'];
        $status = $data['status']; // 'verified' or 'rejected'
        $admin_id = $this->getUserIdFromToken();

        try {
            $this->conn->beginTransaction();

            // Update hospital verification status
            $query = "UPDATE hospital_details SET 
                      verification_status = ?, verification_date = NOW(), verified_by = ? 
                      WHERE user_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$status, $admin_id, $hospital_id]);

            // Update user status
            $user_status = ($status === 'verified') ? 'active' : 'inactive';
            $query = "UPDATE users SET status = ? WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$user_status, $hospital_id]);

            $this->conn->commit();
            sendResponse(null, 200, "Hospital verification updated successfully");

        } catch (Exception $e) {
            $this->conn->rollBack();
            sendError("Verification update failed: " . $e->getMessage(), 500);
        }
    }

    // Get all users
    public function getUsers() {
        $query = "SELECT u.*, up.*, 
                  (SELECT COUNT(*) FROM donations WHERE donor_id = u.id) as total_donations,
                  (SELECT SUM(credits_awarded) FROM donations WHERE donor_id = u.id) as total_credits
                  FROM users u 
                  LEFT JOIN user_profiles up ON u.id = up.user_id 
                  WHERE u.user_type = 'user' 
                  ORDER BY u.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $users = $stmt->fetchAll();

        sendResponse($users);
    }

    // Update user status
    public function updateUserStatus() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['user_id', 'status'];
        $errors = validateInput($data, $required_fields);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors));
        }

        $user_id = $data['user_id'];
        $status = $data['status'];

        $query = "UPDATE users SET status = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$status, $user_id]);

        sendResponse(null, 200, "User status updated successfully");
    }

    // Get all donations
    public function getDonations() {
        $query = "SELECT d.*, 
                  u1.name as donor_name, u1.email as donor_email,
                  u2.name as hospital_name, hd.hospital_name as hospital_display_name,
                  br.blood_group as requested_blood_group, br.units_required
                  FROM donations d 
                  JOIN users u1 ON d.donor_id = u1.id 
                  JOIN users u2 ON d.hospital_id = u2.id 
                  LEFT JOIN hospital_details hd ON d.hospital_id = hd.user_id 
                  LEFT JOIN blood_requests br ON d.blood_request_id = br.id 
                  ORDER BY d.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $donations = $stmt->fetchAll();

        sendResponse($donations);
    }

    // Get credit reports
    public function getCreditReports() {
        $query = "SELECT c.*, u.name as user_name, u.user_type 
                  FROM credits c 
                  JOIN users u ON c.user_id = u.id 
                  ORDER BY c.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $credits = $stmt->fetchAll();

        sendResponse($credits);
    }

    // Adjust user credits
    public function adjustCredits() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['user_id', 'amount', 'description'];
        $errors = validateInput($data, $required_fields);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors));
        }

        $user_id = $data['user_id'];
        $amount = $data['amount'];
        $description = sanitizeInput($data['description']);
        $transaction_type = $amount > 0 ? 'adjusted' : 'adjusted';

        try {
            $this->conn->beginTransaction();

            // Add credit transaction
            $query = "INSERT INTO credits (user_id, transaction_type, amount, description, reference_type) 
                      VALUES (?, ?, ?, ?, 'adjustment')";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$user_id, $transaction_type, $amount, $description]);

            // Update user total credits
            $query = "UPDATE user_profiles SET total_credits = total_credits + ? WHERE user_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$amount, $user_id]);

            $this->conn->commit();
            sendResponse(null, 200, "Credits adjusted successfully");

        } catch (Exception $e) {
            $this->conn->rollBack();
            sendError("Credit adjustment failed: " . $e->getMessage(), 500);
        }
    }

    // Send system notification
    public function sendNotification() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['title', 'message'];
        $errors = validateInput($data, $required_fields);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors));
        }

        $title = sanitizeInput($data['title']);
        $message = sanitizeInput($data['message']);
        $type = $data['type'] ?? 'info';
        $priority = $data['priority'] ?? 'medium';
        $location_filter = isset($data['location_filter']) ? sanitizeInput($data['location_filter']) : null;
        $blood_group_filter = $data['blood_group_filter'] ?? null;

        try {
            $this->conn->beginTransaction();

            // Insert notification
            $query = "INSERT INTO notifications (title, message, type, priority, location_filter, blood_group_filter) 
                      VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$title, $message, $type, $priority, $location_filter, $blood_group_filter]);

            $this->conn->commit();
            sendResponse(null, 200, "Notification sent successfully");

        } catch (Exception $e) {
            $this->conn->rollBack();
            sendError("Notification sending failed: " . $e->getMessage(), 500);
        }
    }

    // Get system analytics
    public function getAnalytics() {
        $analytics = [];

        // Donation trends (last 12 months)
        $query = "SELECT DATE_FORMAT(donation_date, '%Y-%m') as month, COUNT(*) as count 
                  FROM donations 
                  WHERE donation_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) 
                  GROUP BY DATE_FORMAT(donation_date, '%Y-%m') 
                  ORDER BY month";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $analytics['donation_trends'] = $stmt->fetchAll();

        // Blood group distribution
        $query = "SELECT blood_group, COUNT(*) as count 
                  FROM donations 
                  GROUP BY blood_group 
                  ORDER BY count DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $analytics['blood_group_distribution'] = $stmt->fetchAll();

        // Hospital performance
        $query = "SELECT hd.hospital_name, COUNT(d.id) as donations_count, 
                  SUM(d.credits_awarded) as total_credits_awarded
                  FROM hospital_details hd 
                  LEFT JOIN donations d ON hd.user_id = d.hospital_id 
                  GROUP BY hd.user_id, hd.hospital_name 
                  ORDER BY donations_count DESC 
                  LIMIT 10";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $analytics['hospital_performance'] = $stmt->fetchAll();

        // User demographics
        $query = "SELECT gender, COUNT(*) as count 
                  FROM user_profiles 
                  WHERE gender IS NOT NULL 
                  GROUP BY gender";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $analytics['user_demographics'] = $stmt->fetchAll();

        sendResponse($analytics);
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
$admin = new AdminAPI();

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'overview':
                $admin->getDashboardOverview();
                break;
            case 'hospitals':
                $admin->getHospitals();
                break;
            case 'users':
                $admin->getUsers();
                break;
            case 'donations':
                $admin->getDonations();
                break;
            case 'credits':
                $admin->getCreditReports();
                break;
            case 'analytics':
                $admin->getAnalytics();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    case 'POST':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'verify_hospital':
                $admin->verifyHospital();
                break;
            case 'adjust_credits':
                $admin->adjustCredits();
                break;
            case 'send_notification':
                $admin->sendNotification();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    case 'PUT':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'user_status':
                $admin->updateUserStatus();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    default:
        sendError("Method not allowed", 405);
}
?>
