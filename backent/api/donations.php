<?php
require_once '../config/config.php';
require_once '../config/database.php';

class DonationAPI {
    private $conn;
    private $db;

    public function __construct() {
        $this->db = new Database();
        $this->conn = $this->db->getConnection();
    }

    // Get all donations (public endpoint for statistics)
    public function getAllDonations() {
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

    // Get donation statistics
    public function getDonationStatistics() {
        $stats = [];

        // Total donations
        $query = "SELECT COUNT(*) as count FROM donations";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['total_donations'] = $stmt->fetch()['count'];

        // Completed donations
        $query = "SELECT COUNT(*) as count FROM donations WHERE status = 'completed'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['completed_donations'] = $stmt->fetch()['count'];

        // Pending donations
        $query = "SELECT COUNT(*) as count FROM donations WHERE status = 'pending'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['pending_donations'] = $stmt->fetch()['count'];

        // Donations this month
        $query = "SELECT COUNT(*) as count FROM donations WHERE MONTH(donation_date) = MONTH(NOW()) AND YEAR(donation_date) = YEAR(NOW())";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['donations_this_month'] = $stmt->fetch()['count'];

        // Blood group distribution
        $query = "SELECT blood_group, COUNT(*) as count FROM donations GROUP BY blood_group ORDER BY count DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['blood_group_distribution'] = $stmt->fetchAll();

        // Monthly trends (last 12 months)
        $query = "SELECT DATE_FORMAT(donation_date, '%Y-%m') as month, COUNT(*) as count 
                  FROM donations 
                  WHERE donation_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH) 
                  GROUP BY DATE_FORMAT(donation_date, '%Y-%m') 
                  ORDER BY month";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['monthly_trends'] = $stmt->fetchAll();

        // Top hospitals by donations
        $query = "SELECT hd.hospital_name, COUNT(d.id) as donation_count 
                  FROM donations d 
                  JOIN hospital_details hd ON d.hospital_id = hd.user_id 
                  GROUP BY d.hospital_id, hd.hospital_name 
                  ORDER BY donation_count DESC 
                  LIMIT 10";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['top_hospitals'] = $stmt->fetchAll();

        // Top donors
        $query = "SELECT u.name, COUNT(d.id) as donation_count, SUM(d.credits_awarded) as total_credits
                  FROM donations d 
                  JOIN users u ON d.donor_id = u.id 
                  GROUP BY d.donor_id, u.name 
                  ORDER BY donation_count DESC 
                  LIMIT 10";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $stats['top_donors'] = $stmt->fetchAll();

        sendResponse($stats);
    }

    // Get blood requests (public endpoint)
    public function getBloodRequests() {
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

    // Get emergency blood requests
    public function getEmergencyRequests() {
        $query = "SELECT br.*, hd.hospital_name, hd.location as hospital_location, hd.contact_phone, hd.contact_email
                  FROM blood_requests br 
                  JOIN hospital_details hd ON br.hospital_id = hd.user_id 
                  JOIN users u ON br.hospital_id = u.id 
                  WHERE br.status = 'active' AND br.urgency = 'high' 
                  AND u.status = 'active' AND hd.verification_status = 'verified'
                  AND br.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                  ORDER BY br.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $requests = $stmt->fetchAll();

        sendResponse($requests);
    }

    // Get donation by ID
    public function getDonationById() {
        $donation_id = $_GET['id'] ?? null;
        
        if (!$donation_id) {
            sendError("Donation ID required", 400);
        }

        $query = "SELECT d.*, 
                  u1.name as donor_name, u1.email as donor_email, u1.phone as donor_phone,
                  u2.name as hospital_name, hd.hospital_name as hospital_display_name, hd.contact_phone, hd.contact_email,
                  br.blood_group as requested_blood_group, br.units_required, br.description as request_description
                  FROM donations d 
                  JOIN users u1 ON d.donor_id = u1.id 
                  JOIN users u2 ON d.hospital_id = u2.id 
                  LEFT JOIN hospital_details hd ON d.hospital_id = hd.user_id 
                  LEFT JOIN blood_requests br ON d.blood_request_id = br.id 
                  WHERE d.id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$donation_id]);
        $donation = $stmt->fetch();

        if (!$donation) {
            sendError("Donation not found", 404);
        }

        sendResponse($donation);
    }

    // Search donations
    public function searchDonations() {
        $donor_name = $_GET['donor_name'] ?? null;
        $hospital_name = $_GET['hospital_name'] ?? null;
        $blood_group = $_GET['blood_group'] ?? null;
        $date_from = $_GET['date_from'] ?? null;
        $date_to = $_GET['date_to'] ?? null;
        $status = $_GET['status'] ?? null;

        $query = "SELECT d.*, 
                  u1.name as donor_name, u1.email as donor_email,
                  u2.name as hospital_name, hd.hospital_name as hospital_display_name,
                  br.blood_group as requested_blood_group, br.units_required
                  FROM donations d 
                  JOIN users u1 ON d.donor_id = u1.id 
                  JOIN users u2 ON d.hospital_id = u2.id 
                  LEFT JOIN hospital_details hd ON d.hospital_id = hd.user_id 
                  LEFT JOIN blood_requests br ON d.blood_request_id = br.id 
                  WHERE 1=1";

        $params = [];

        if ($donor_name) {
            $query .= " AND u1.name LIKE ?";
            $params[] = "%$donor_name%";
        }

        if ($hospital_name) {
            $query .= " AND (u2.name LIKE ? OR hd.hospital_name LIKE ?)";
            $params[] = "%$hospital_name%";
            $params[] = "%$hospital_name%";
        }

        if ($blood_group) {
            $query .= " AND d.blood_group = ?";
            $params[] = $blood_group;
        }

        if ($date_from) {
            $query .= " AND d.donation_date >= ?";
            $params[] = $date_from;
        }

        if ($date_to) {
            $query .= " AND d.donation_date <= ?";
            $params[] = $date_to;
        }

        if ($status) {
            $query .= " AND d.status = ?";
            $params[] = $status;
        }

        $query .= " ORDER BY d.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        $donations = $stmt->fetchAll();

        sendResponse($donations);
    }

    // Get blood inventory summary
    public function getBloodInventorySummary() {
        $query = "SELECT blood_group, 
                  SUM(units_available) as total_available, 
                  SUM(units_reserved) as total_reserved,
                  COUNT(DISTINCT hospital_id) as hospital_count
                  FROM blood_inventory 
                  GROUP BY blood_group 
                  ORDER BY blood_group";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $inventory = $stmt->fetchAll();

        sendResponse($inventory);
    }

    // Get donation analytics
    public function getDonationAnalytics() {
        $analytics = [];

        // Donations by day of week
        $query = "SELECT DAYNAME(donation_date) as day_name, COUNT(*) as count 
                  FROM donations 
                  WHERE donation_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH) 
                  GROUP BY DAYOFWEEK(donation_date), DAYNAME(donation_date) 
                  ORDER BY DAYOFWEEK(donation_date)";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $analytics['donations_by_day'] = $stmt->fetchAll();

        // Donations by hour
        $query = "SELECT HOUR(created_at) as hour, COUNT(*) as count 
                  FROM donations 
                  WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) 
                  GROUP BY HOUR(created_at) 
                  ORDER BY hour";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $analytics['donations_by_hour'] = $stmt->fetchAll();

        // Age group distribution
        $query = "SELECT 
                    CASE 
                        WHEN up.age < 25 THEN '18-24'
                        WHEN up.age < 35 THEN '25-34'
                        WHEN up.age < 45 THEN '35-44'
                        WHEN up.age < 55 THEN '45-54'
                        ELSE '55+'
                    END as age_group,
                    COUNT(*) as count
                  FROM donations d 
                  JOIN user_profiles up ON d.donor_id = up.user_id 
                  WHERE up.age IS NOT NULL 
                  GROUP BY age_group 
                  ORDER BY age_group";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $analytics['age_group_distribution'] = $stmt->fetchAll();

        // Gender distribution
        $query = "SELECT up.gender, COUNT(*) as count 
                  FROM donations d 
                  JOIN user_profiles up ON d.donor_id = up.user_id 
                  WHERE up.gender IS NOT NULL 
                  GROUP BY up.gender";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $analytics['gender_distribution'] = $stmt->fetchAll();

        // Location distribution
        $query = "SELECT up.location, COUNT(*) as count 
                  FROM donations d 
                  JOIN user_profiles up ON d.donor_id = up.user_id 
                  WHERE up.location IS NOT NULL 
                  GROUP BY up.location 
                  ORDER BY count DESC 
                  LIMIT 10";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $analytics['location_distribution'] = $stmt->fetchAll();

        sendResponse($analytics);
    }

    // Export donations data
    public function exportDonations() {
        $format = $_GET['format'] ?? 'json';
        $date_from = $_GET['date_from'] ?? null;
        $date_to = $_GET['date_to'] ?? null;

        $query = "SELECT d.*, 
                  u1.name as donor_name, u1.email as donor_email, u1.phone as donor_phone,
                  u2.name as hospital_name, hd.hospital_name as hospital_display_name,
                  br.blood_group as requested_blood_group, br.units_required
                  FROM donations d 
                  JOIN users u1 ON d.donor_id = u1.id 
                  JOIN users u2 ON d.hospital_id = u2.id 
                  LEFT JOIN hospital_details hd ON d.hospital_id = hd.user_id 
                  LEFT JOIN blood_requests br ON d.blood_request_id = br.id 
                  WHERE 1=1";

        $params = [];

        if ($date_from) {
            $query .= " AND d.donation_date >= ?";
            $params[] = $date_from;
        }

        if ($date_to) {
            $query .= " AND d.donation_date <= ?";
            $params[] = $date_to;
        }

        $query .= " ORDER BY d.created_at DESC";

        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        $donations = $stmt->fetchAll();

        if ($format === 'csv') {
            $this->exportToCSV($donations);
        } else {
            sendResponse($donations);
        }
    }

    // Export to CSV
    private function exportToCSV($data) {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="donations_' . date('Y-m-d') . '.csv"');

        $output = fopen('php://output', 'w');
        
        // CSV headers
        fputcsv($output, [
            'ID', 'Donor Name', 'Donor Email', 'Donor Phone', 'Hospital Name', 
            'Blood Group', 'Units Donated', 'Donation Date', 'Status', 'Credits Awarded'
        ]);

        // CSV data
        foreach ($data as $row) {
            fputcsv($output, [
                $row['id'],
                $row['donor_name'],
                $row['donor_email'],
                $row['donor_phone'],
                $row['hospital_display_name'] ?: $row['hospital_name'],
                $row['blood_group'],
                $row['units_donated'],
                $row['donation_date'],
                $row['status'],
                $row['credits_awarded']
            ]);
        }

        fclose($output);
        exit();
    }
}

// Handle requests
$method = $_SERVER['REQUEST_METHOD'];
$donation = new DonationAPI();

switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? '';
        switch ($action) {
            case 'all':
                $donation->getAllDonations();
                break;
            case 'statistics':
                $donation->getDonationStatistics();
                break;
            case 'blood_requests':
                $donation->getBloodRequests();
                break;
            case 'emergency_requests':
                $donation->getEmergencyRequests();
                break;
            case 'by_id':
                $donation->getDonationById();
                break;
            case 'search':
                $donation->searchDonations();
                break;
            case 'inventory_summary':
                $donation->getBloodInventorySummary();
                break;
            case 'analytics':
                $donation->getDonationAnalytics();
                break;
            case 'export':
                $donation->exportDonations();
                break;
            default:
                sendError("Invalid action", 400);
        }
        break;
    default:
        sendError("Method not allowed", 405);
}
?>
