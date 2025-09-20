# Blood Bridge Backend API

A comprehensive PHP backend API for the Blood Bridge blood donation platform.

## Features

- **Authentication System**: JWT-based authentication for Admin, Hospital, and User roles
- **Admin Management**: Complete admin dashboard with hospital verification, user management, and analytics
- **Hospital Management**: Blood request posting, donor management, and donation tracking
- **User Management**: Profile management, donation history, and achievement system
- **Donation Tracking**: Complete donation lifecycle management
- **Credit System**: Points-based reward system for donations
- **Notification System**: Multi-channel notification support
- **Analytics**: Comprehensive reporting and analytics
- **Multi-language Support**: API responses support multiple languages

## Technology Stack

- **Backend**: PHP 7.4+
- **Database**: MySQL 5.7+
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API design
- **Security**: Password hashing, input sanitization, CORS support

## Installation

### Prerequisites

1. PHP 7.4 or higher
2. MySQL 5.7 or higher
3. Web server (Apache/Nginx)
4. PHP extensions: PDO, PDO_MySQL, JSON, OpenSSL

### Setup Instructions

1. **Clone/Download the backend files**
   ```bash
   # Place all backend files in your web server directory
   # Example: /var/www/html/backend/ or C:\xampp\htdocs\backend\
   ```

2. **Database Setup**
   ```sql
   -- Create database and import schema
   mysql -u root -p < database/schema.sql
   ```

3. **Configuration**
   - Update `config/database.php` with your database credentials
   - Update `config/config.php` with your server settings
   - Set proper file permissions

4. **Web Server Configuration**
   - Ensure mod_rewrite is enabled (for Apache)
   - Configure virtual host to point to backend directory
   - Set document root to backend folder

## API Endpoints

### Authentication (`/api/auth.php`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `?action=register` | User registration |
| POST | `?action=login` | User login |
| GET | `?action=profile` | Get user profile |
| PUT | `?action=profile` | Update user profile |
| PUT | `?action=password` | Change password |

### Admin (`/api/admin.php`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `?action=overview` | Dashboard overview |
| GET | `?action=hospitals` | Get all hospitals |
| GET | `?action=users` | Get all users |
| GET | `?action=donations` | Get all donations |
| GET | `?action=credits` | Get credit reports |
| GET | `?action=analytics` | Get system analytics |
| POST | `?action=verify_hospital` | Verify hospital |
| POST | `?action=adjust_credits` | Adjust user credits |
| POST | `?action=send_notification` | Send system notification |
| PUT | `?action=user_status` | Update user status |

### Hospital (`/api/hospital.php`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `?action=overview` | Dashboard overview |
| GET | `?action=blood_requests` | Get blood requests |
| GET | `?action=donors` | Get available donors |
| GET | `?action=donations` | Get donations |
| GET | `?action=inventory` | Get blood inventory |
| GET | `?action=statistics` | Get hospital statistics |
| POST | `?action=create_request` | Create blood request |
| POST | `?action=record_donation` | Record donation |
| POST | `?action=update_inventory` | Update blood inventory |
| POST | `?action=send_notification` | Send donor notification |
| PUT | `?action=update_request` | Update blood request |

### User (`/api/user.php`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `?action=overview` | Dashboard overview |
| GET | `?action=donation_history` | Get donation history |
| GET | `?action=find_hospitals` | Find hospitals with blood requests |
| GET | `?action=profile` | Get user profile |
| GET | `?action=achievements` | Get achievements |
| GET | `?action=notifications` | Get notifications |
| GET | `?action=credit_history` | Get credit history |
| GET | `?action=eligibility` | Check donation eligibility |
| GET | `?action=emergency_alerts` | Get emergency alerts |
| PUT | `?action=profile` | Update user profile |
| PUT | `?action=mark_notification_read` | Mark notification as read |

### Donations (`/api/donations.php`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `?action=all` | Get all donations |
| GET | `?action=statistics` | Get donation statistics |
| GET | `?action=blood_requests` | Get blood requests |
| GET | `?action=emergency_requests` | Get emergency requests |
| GET | `?action=by_id` | Get donation by ID |
| GET | `?action=search` | Search donations |
| GET | `?action=inventory_summary` | Get blood inventory summary |
| GET | `?action=analytics` | Get donation analytics |
| GET | `?action=export` | Export donations data |

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Request/Response Format

### Request Format
- **Content-Type**: `application/json`
- **Method**: GET, POST, PUT, DELETE
- **Body**: JSON format for POST/PUT requests

### Response Format
```json
{
    "status": 200,
    "message": "Success",
    "data": {...},
    "timestamp": "2024-01-15 10:30:00"
}
```

### Error Response Format
```json
{
    "status": 400,
    "message": "Error message",
    "data": null,
    "timestamp": "2024-01-15 10:30:00"
}
```

## Database Schema

The database includes the following main tables:

- **users**: User accounts (admin, hospital, user)
- **user_profiles**: Extended user information
- **hospital_details**: Hospital-specific information
- **blood_requests**: Blood donation requests
- **donations**: Blood donation records
- **credits**: Credit transaction history
- **notifications**: System notifications
- **blood_inventory**: Hospital blood inventory
- **achievements**: User achievements
- **system_settings**: System configuration

## Security Features

- **Password Hashing**: Uses PHP's `password_hash()` function
- **Input Sanitization**: All inputs are sanitized and validated
- **SQL Injection Prevention**: Uses prepared statements
- **CORS Support**: Cross-origin resource sharing enabled
- **JWT Security**: Secure token-based authentication
- **Role-based Access**: Different access levels for different user types

## Usage Examples

### User Registration
```bash
curl -X POST http://localhost/backend/api/auth.php?action=register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "user_type": "user",
    "phone": "+1234567890",
    "age": 25,
    "gender": "male",
    "blood_group": "O+",
    "location": "New York"
  }'
```

### User Login
```bash
curl -X POST http://localhost/backend/api/auth.php?action=login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Blood Request (Hospital)
```bash
curl -X POST http://localhost/backend/api/hospital.php?action=create_request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "blood_group": "O+",
    "units_required": 2,
    "urgency": "high",
    "description": "Emergency surgery required"
  }'
```

### Get Dashboard Overview (User)
```bash
curl -X GET http://localhost/backend/api/user.php?action=overview \
  -H "Authorization: Bearer <token>"
```

## Configuration

### Database Configuration (`config/database.php`)
```php
private $host = "localhost";
private $db_name = "blood_bridge";
private $username = "root";
private $password = "";
```

### Application Configuration (`config/config.php`)
```php
define('BASE_URL', 'http://localhost/backend/');
define('JWT_SECRET', 'your_secret_key_here');
define('JWT_ALGORITHM', 'HS256');
```

## Error Handling

The API includes comprehensive error handling:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists
- **500 Internal Server Error**: Server-side errors

## Development

### Adding New Endpoints

1. Create new API file in `api/` directory
2. Follow the existing pattern for request handling
3. Include proper authentication and validation
4. Update the main `index.php` routing
5. Update this README with new endpoints

### Database Migrations

For database changes:
1. Create migration SQL files
2. Update the main schema file
3. Test with sample data
4. Document changes

## Testing

### Health Check
```bash
curl http://localhost/backend/
```

### API Documentation
Visit `http://localhost/backend/` for complete API documentation.

## Support

For issues and questions:
1. Check the error logs
2. Verify database connection
3. Ensure proper file permissions
4. Check PHP error reporting

## License

This project is part of the Blood Bridge blood donation platform.
