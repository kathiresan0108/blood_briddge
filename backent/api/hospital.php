<?php
require_once '../config/config.php';
require_once '../config/database.php';

class HospitalAPI {
    private $conn;
    private $db;
    private $hospital_id;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
        $this->hospital_id = $this->verifyHospitalAccess();
    }

    // Verify hospital access
    private function verifyHospitalAccess() {
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
        if (!$payload || $payload['user_type'] !== 'hospital') {
            sendError("Hospital access required", 403);
        }

        return $payload['user_id'];
    }

    // Get hospital dashboard overview
    public function getDashboardOverview() {
        $stats = [];

        // Total blood requests
        $query = "SELECT COUNT(*) as count FROM blood_requests WHERE hospital_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id]);
        $stats['total_requests'] = $stmt->fetch()['count'];

        // Active requests
        $query = "SELECT COUNT(*) as count FROM blood_requests WHERE hospital_id = ? AND status = 'active'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id]);
        $stats['active_requests'] = $stmt->fetch()['count'];

        // Total donations received
        $query = "SELECT COUNT(*) as count FROM donations WHERE hospital_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id]);
        $stats['total_donations'] = $stmt->fetch()['count'];

        // Completed donations
        $query = "SELECT COUNT(*) as count FROM donations WHERE hospital_id = ? AND status = 'completed'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id]);
        $stats['completed_donations'] = $stmt->fetch()['count'];

        // Recent blood requests
        $query = "SELECT * FROM blood_requests WHERE hospital_id = ? ORDER BY created_at DESC LIMIT 5";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id]);
        $stats['recent_requests'] = $stmt->fetchAll();

        sendResponse($stats);
    }

    // Create blood request
    public function createBloodRequest() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['blood_group', 'units_required'];
        $errors = validateInput($data, $required_fields);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors));
        }

        $blood_group = $data['blood_group'];
        $units_required = $data['units_required'];
        $urgency = $data['urgency'] ?? 'medium';
        $description = isset($data['description']) ? sanitizeInput($data['description']) : null;

        $query = "INSERT INTO blood_requests (hospital_id, blood_group, units_required, urgency, description) 
                  VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id, $blood_group, $units_required, $urgency, $description]);

        $request_id = $this->conn->lastInsertId();
        sendResponse(['request_id' => $request_id], 201, 'Blood request created successfully');
    }

    // Get blood requests
    public function getBloodRequests() {
        $query = "SELECT * FROM blood_requests WHERE hospital_id = ? ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id]);
        $requests = $stmt->fetchAll();

        sendResponse($requests);
    }

    // Update blood request
    public function updateBloodRequest() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['request_id'];
        $errors = validateInput($data, $required_fields);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors));
        }

        $request_id = $data['request_id'];
        $status = $data['status'] ?? null;
        $description = isset($data['description']) ? sanitizeInput($data['description']) : null;

        // Verify request belongs to this hospital
        $query = "SELECT id FROM blood_requests WHERE id = ? AND hospital_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$request_id, $this->hospital_id]);
        
        if ($stmt->rowCount() === 0) {
            sendError("Blood request not found", 404);
        }

        $update_fields = [];
        $params = [];

        if ($status !== null) {
            $update_fields[] = "status = ?";
            $params[] = $status;
        }

        if ($description !== null) {
            $update_fields[] = "description = ?";
            $params[] = $description;
        }

        if (empty($update_fields)) {
            sendError("No fields to update", 400);
        }

        $params[] = $request_id;
        $query = "UPDATE blood_requests SET " . implode(', ', $update_fields) . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);

        sendResponse(null, 200, 'Blood request updated successfully');
    }

    // Get available donors
    public function getAvailableDonors() {
        $blood_group = $_GET['blood_group'] ?? null;
        $location = $_GET['location'] ?? null;

        $query = "SELECT u.id, u.name, u.phone, u.email, up.blood_group, up.location, 
                  up.last_donation_date, up.next_eligible_date, up.total_donations, up.total_credits
                  FROM users u 
                  JOIN user_profiles up ON u.id = up.user_id 
                  WHERE u.user_type = 'user' AND u.status = 'active'";

        $params = [];

        if ($blood_group) {
            $query .= " AND up.blood_group = ?";
            $params[] = $blood_group;
        }

        if ($location) {
            $query .= " AND up.location LIKE ?";
            $params[] = "%$location%";
        }

        $query .= " ORDER BY up.total_donations DESC, u.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        $donors = $stmt->fetchAll();

        sendResponse($donors);
    }

    // Get donations
    public function getDonations() {
        $query = "SELECT d.*, u.name as donor_name, u.phone as donor_phone, u.email as donor_email,
                  br.blood_group as requested_blood_group, br.units_required
                  FROM donations d 
                  JOIN users u ON d.donor_id = u.id 
                  LEFT JOIN blood_requests br ON d.blood_request_id = br.id 
                  WHERE d.hospital_id = ? 
                  ORDER BY d.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id]);
        $donations = $stmt->fetchAll();

        sendResponse($donations);
    }

    // Record donation
    public function recordDonation() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['donor_id', 'blood_group', 'donation_date'];
        $errors = validateInput($data, $required_fields);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors));
        }

        $donor_id = $data['donor_id'];
        $blood_group = $data['blood_group'];
        $donation_date = $data['donation_date'];
        $units_donated = $data['units_donated'] ?? 1;
        $blood_request_id = $data['blood_request_id'] ?? null;
        $notes = isset($data['notes']) ? sanitizeInput($data['notes']) : null;
        $credits_awarded = $data['credits_awarded'] ?? 50;

        try {
            $this->conn->beginTransaction();

            // Insert donation record
            $query = "INSERT INTO donations (donor_id, hospital_id, blood_request_id, blood_group, 
                      units_donated, donation_date, status, credits_awarded, notes, verified_by, verification_date) 
                      VALUES (?, ?, ?, ?, ?, ?, 'completed', ?, ?, ?, NOW())";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$donor_id, $this->hospital_id, $blood_request_id, $blood_group, 
                           $units_donated, $donation_date, $credits_awarded, $notes, $this->hospital_id]);

            $donation_id = $this->conn->lastInsertId();

            // Add credit transaction
            $query = "INSERT INTO credits (user_id, transaction_type, amount, description, reference_id, reference_type) 
                      VALUES (?, 'earned', ?, 'Blood donation', ?, 'donation')";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$donor_id, $credits_awarded, $donation_id]);

            // Update donor profile
            $query = "UPDATE user_profiles SET 
                      total_donations = total_donations + 1, 
                      total_credits = total_credits + ?, 
                      last_donation_date = ?, 
                      next_eligible_date = DATE_ADD(?, INTERVAL 56 DAY)
                      WHERE user_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$credits_awarded, $donation_date, $donation_date, $donor_id]);

            // Update blood request if applicable
            if ($blood_request_id) {
                $query = "UPDATE blood_requests SET 
                          units_required = units_required - ?, 
                          status = CASE WHEN units_required - ? <= 0 THEN 'fulfilled' ELSE status END,
                          fulfilled_date = CASE WHEN units_required - ? <= 0 THEN NOW() ELSE fulfilled_date END
                          WHERE id = ?";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$units_donated, $units_donated, $units_donated, $blood_request_id]);
            }

            $this->conn->commit();
            sendResponse(['donation_id' => $donation_id], 201, 'Donation recorded successfully');

        } catch (Exception $e) {
            $this->conn->rollBack();
            sendError("Donation recording failed: " . $e->getMessage(), 500);
        }
    }

    // Get blood inventory
    public function getBloodInventory() {
        $query = "SELECT * FROM blood_inventory WHERE hospital_id = ? ORDER BY blood_group";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id]);
        $inventory = $stmt->fetchAll();

        sendResponse($inventory);
    }

    // Update blood inventory
    public function updateBloodInventory() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['blood_group', 'units_available'];
        $errors = validateInput($data, $required_fields);
        
        if (!empty($errors)) {
            sendError(implode(', ', $errors));
        }

        $blood_group = $data['blood_group'];
        $units_available = $data['units_available'];
        $units_reserved = $data['units_reserved'] ?? 0;
        $expiry_date = $data['expiry_date'] ?? null;

        $query = "INSERT INTO blood_inventory (hospital_id, blood_group, units_available, units_reserved, expiry_date) 
                  VALUES (?, ?, ?, ?, ?) 
                  ON DUPLICATE KEY UPDATE 
                  units_available = VALUES(units_available), 
                  units_reserved = VALUES(units_reserved), 
                  expiry_date = VALUES(expiry_date)";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id, $blood_group, $units_available, $units_reserved, $expiry_date]);

        sendResponse(null, 200, 'Blood inventory updated successfully');
    }

    // Send notification to donors
    public function sendDonorNotification() {
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

        $query = "INSERT INTO notifications (title, message, type, priority, location_filter, blood_group_filter) 
                  VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$title, $message, $type, $priority, $location_filter, $blood_group_filter]);

        sendResponse(null, 200, 'Notification sent successfully');
    }

    // Get hospital statistics
    public function getStatistics() {
        $stats = [];

        // Donations by month (last 12 months)
        $query = "SELECT DATE_FORMAT(donation_date, '%Y-%m') as month, COUNT(*) as count 
                  FROM donations 
                  WHERE hospital_id = ? AND donation_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) 
                  GROUP BY DATE_FORMAT(donation_date, '%Y-%m') 
                  ORDER BY month";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id]);
        $stats['donations_by_month'] = $stmt->fetchAll();

        // Blood group distribution
        $query = "SELECT blood_group, COUNT(*) as count 
                  FROM donations 
                  WHERE hospital_id = ? 
                  GROUP BY blood_group 
                  ORDER BY count DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id]);
        $stats['blood_group_distribution'] = $stmt->fetchAll();

        // Top donors
        $query = "SELECT u.name, COUNT(d.id) as donation_count, SUM(d.credits_awarded) as total_credits
                  FROM donations d 
                  JOIN users u ON d.donor_id = u.id 
                  WHERE d.hospital_id = ? 
                  GROUP BY d.donor_id, u.name 
                  ORDER BY donation_count DESC 
                  LIMIT 10";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$this->hospital_id]);
        $stats['top_donors'] = $stmt->fetchAll();

        sendResponse($stats);
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
$hospital = new HospitalAPI();

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'overview':
                $hospital->getDashboardOverview();
                break;
            case 'blood_requests':
                $hospital->getBloodRequests();
                break;
            case 'donors':
                $hospital->getAvailableDonors();
                break;
            case 'donations':
                $hospital->getDonations();
                break;
            case 'inventory':
                $hospital->getBloodInventory();
                break;
            case 'statistics':
                $hospital->getStatistics();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    case 'POST':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'create_request':
                $hospital->createBloodRequest();
                break;
            case 'record_donation':
                $hospital->recordDonation();
                break;
            case 'update_inventory':
                $hospital->updateBloodInventory();
                break;
            case 'send_notification':
                $hospital->sendDonorNotification();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    case 'PUT':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'update_request':
                $hospital->updateBloodRequest();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    default:
        sendError("Method not allowed", 405);
}
?>
