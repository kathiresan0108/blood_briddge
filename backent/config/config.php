<?php
// Application configuration
define('BASE_URL', 'http://localhost/backend/');
define('JWT_SECRET', 'blood_bridge_secret_key_2024');
define('JWT_ALGORITHM', 'HS256');

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Timezone
date_default_timezone_set('Asia/Kolkata');

// Response helper function
function sendResponse($data, $status = 200, $message = 'Success') {
    http_response_code($status);
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Error response helper function
function sendError($message, $status = 400) {
    http_response_code($status);
    echo json_encode([
        'status' => $status,
        'message' => $message,
        'data' => null,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

// Input validation helper
function validateInput($data, $required_fields) {
    $errors = [];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Field '$field' is required";
        }
    }
    
    return $errors;
}

// Sanitize input
function sanitizeInput($data) {
    if (is_array($data)) {
        return array_map('sanitizeInput', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)));
}
?>
