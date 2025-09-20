<?php
require_once 'config/config.php';

// API Documentation and Health Check
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/backend/', '', $path);

// Health check endpoint
if ($path === '' || $path === 'index.php') {
    sendResponse([
        'service' => 'Blood Bridge API',
        'version' => '1.0.0',
        'status' => 'healthy',
        'endpoints' => [
            'auth' => [
                'POST /api/auth.php?action=register' => 'User registration',
                'POST /api/auth.php?action=login' => 'User login',
                'GET /api/auth.php?action=profile' => 'Get user profile',
                'PUT /api/auth.php?action=profile' => 'Update user profile',
                'PUT /api/auth.php?action=password' => 'Change password'
            ],
            'admin' => [
                'GET /api/admin.php?action=overview' => 'Admin dashboard overview',
                'GET /api/admin.php?action=hospitals' => 'Get all hospitals',
                'GET /api/admin.php?action=users' => 'Get all users',
                'GET /api/admin.php?action=donations' => 'Get all donations',
                'GET /api/admin.php?action=credits' => 'Get credit reports',
                'GET /api/admin.php?action=analytics' => 'Get system analytics',
                'POST /api/admin.php?action=verify_hospital' => 'Verify hospital',
                'POST /api/admin.php?action=adjust_credits' => 'Adjust user credits',
                'POST /api/admin.php?action=send_notification' => 'Send system notification',
                'PUT /api/admin.php?action=user_status' => 'Update user status'
            ],
            'hospital' => [
                'GET /api/hospital.php?action=overview' => 'Hospital dashboard overview',
                'GET /api/hospital.php?action=blood_requests' => 'Get blood requests',
                'GET /api/hospital.php?action=donors' => 'Get available donors',
                'GET /api/hospital.php?action=donations' => 'Get donations',
                'GET /api/hospital.php?action=inventory' => 'Get blood inventory',
                'GET /api/hospital.php?action=statistics' => 'Get hospital statistics',
                'POST /api/hospital.php?action=create_request' => 'Create blood request',
                'POST /api/hospital.php?action=record_donation' => 'Record donation',
                'POST /api/hospital.php?action=update_inventory' => 'Update blood inventory',
                'POST /api/hospital.php?action=send_notification' => 'Send donor notification',
                'PUT /api/hospital.php?action=update_request' => 'Update blood request'
            ],
            'user' => [
                'GET /api/user.php?action=overview' => 'User dashboard overview',
                'GET /api/user.php?action=donation_history' => 'Get donation history',
                'GET /api/user.php?action=find_hospitals' => 'Find hospitals with blood requests',
                'GET /api/user.php?action=profile' => 'Get user profile',
                'GET /api/user.php?action=achievements' => 'Get achievements',
                'GET /api/user.php?action=notifications' => 'Get notifications',
                'GET /api/user.php?action=credit_history' => 'Get credit history',
                'GET /api/user.php?action=eligibility' => 'Check donation eligibility',
                'GET /api/user.php?action=emergency_alerts' => 'Get emergency alerts',
                'PUT /api/user.php?action=profile' => 'Update user profile',
                'PUT /api/user.php?action=mark_notification_read' => 'Mark notification as read'
            ],
            'donations' => [
                'GET /api/donations.php?action=all' => 'Get all donations',
                'GET /api/donations.php?action=statistics' => 'Get donation statistics',
                'GET /api/donations.php?action=blood_requests' => 'Get blood requests',
                'GET /api/donations.php?action=emergency_requests' => 'Get emergency requests',
                'GET /api/donations.php?action=by_id' => 'Get donation by ID',
                'GET /api/donations.php?action=search' => 'Search donations',
                'GET /api/donations.php?action=inventory_summary' => 'Get blood inventory summary',
                'GET /api/donations.php?action=analytics' => 'Get donation analytics',
                'GET /api/donations.php?action=export' => 'Export donations data'
            ]
        ],
        'authentication' => 'Bearer token required for protected endpoints',
        'database' => 'MySQL database required',
        'setup' => 'Import database/schema.sql to set up the database'
    ], 200, 'Blood Bridge API is running');
}

// Route to appropriate API endpoint
$api_path = 'api/' . $path . '.php';
if (file_exists($api_path)) {
    require_once $api_path;
} else {
    sendError("API endpoint not found: $path", 404);
}
?>
