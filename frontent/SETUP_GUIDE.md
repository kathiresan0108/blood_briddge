# Blood Bridge - Frontend & Backend Setup Guide

This guide will help you set up and connect the React frontend with the PHP backend.

## Prerequisites

1. **Node.js** (v14 or higher)
2. **PHP** (v7.4 or higher)
3. **MySQL** (v5.7 or higher)
4. **Web Server** (Apache/Nginx or XAMPP/WAMP)

## Backend Setup

### 1. Database Setup

1. **Create MySQL Database:**
   ```sql
   CREATE DATABASE blood_bridge;
   ```

2. **Import Database Schema:**
   ```bash
   mysql -u root -p blood_bridge < backend/database/schema.sql
   ```

### 2. Backend Configuration

1. **Update Database Credentials:**
   Edit `backend/config/database.php`:
   ```php
   private $host = "localhost";
   private $db_name = "blood_bridge";
   private $username = "your_username";
   private $password = "your_password";
   ```

2. **Update API Base URL:**
   Edit `src/services/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost/backend/api';
   // Change to your backend URL
   ```

### 3. Web Server Setup

#### Option A: XAMPP/WAMP
1. Copy the `backend` folder to `htdocs` (XAMPP) or `www` (WAMP)
2. Access: `http://localhost/backend/`

#### Option B: Apache/Nginx
1. Set document root to the `backend` directory
2. Ensure mod_rewrite is enabled
3. Configure virtual host

### 4. Test Backend

Visit `http://localhost/backend/` to see the API documentation and health check.

## Frontend Setup

### 1. Install Dependencies

```bash
cd doner
npm install
```

### 2. Start Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Integration

The frontend is now connected to the backend through:

### 1. API Service (`src/services/api.js`)
- Handles all API calls to the backend
- Manages authentication tokens
- Provides methods for all endpoints

### 2. Authentication Service (`src/services/authService.js`)
- Manages user authentication state
- Handles login/logout
- Stores JWT tokens

### 3. Updated Components
- **LoginModal**: Now connects to backend for registration/login
- **AdminDashboard**: Loads real data from backend APIs
- **App.js**: Initializes authentication on app load

## Testing the Connection

### 1. Test Registration
1. Open the app at `http://localhost:3000`
2. Click "User Login" → "Register"
3. Fill in the registration form
4. Submit to test backend connection

### 2. Test Login
1. Use the credentials from registration
2. Login should redirect to appropriate dashboard

### 3. Test Admin Features
1. Login as admin (default: admin@bloodbridge.com / password)
2. Navigate to different sections to test API calls

## Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure backend CORS headers are set in `config/config.php`
   - Check that frontend URL is allowed

2. **Database Connection Errors:**
   - Verify database credentials in `config/database.php`
   - Ensure MySQL service is running
   - Check database exists and schema is imported

3. **API Not Found (404):**
   - Verify backend URL in `src/services/api.js`
   - Check web server configuration
   - Ensure backend files are in correct location

4. **Authentication Issues:**
   - Check JWT secret in backend config
   - Verify token storage in browser localStorage
   - Check network tab for API call errors

### Debug Steps

1. **Check Browser Console:**
   - Look for JavaScript errors
   - Check network tab for failed API calls

2. **Check Backend Logs:**
   - PHP error logs
   - Web server error logs

3. **Test API Directly:**
   - Use Postman or curl to test backend endpoints
   - Visit `http://localhost/backend/` for API documentation

## Development Workflow

### 1. Backend Changes
1. Make changes to PHP files
2. Test API endpoints directly
3. Update frontend API calls if needed

### 2. Frontend Changes
1. Make changes to React components
2. Test with backend APIs
3. Update API service if new endpoints needed

### 3. Database Changes
1. Update schema in `database/schema.sql`
2. Create migration scripts
3. Update API endpoints if needed

## Production Deployment

### Backend
1. Set up production web server
2. Configure SSL certificates
3. Update database credentials
4. Set proper file permissions

### Frontend
1. Build production version: `npm run build`
2. Deploy to web server or CDN
3. Update API URLs for production

## API Endpoints Summary

### Authentication
- `POST /api/auth.php?action=register` - User registration
- `POST /api/auth.php?action=login` - User login
- `GET /api/auth.php?action=profile` - Get user profile

### Admin
- `GET /api/admin.php?action=overview` - Dashboard overview
- `GET /api/admin.php?action=hospitals` - Get hospitals
- `POST /api/admin.php?action=verify_hospital` - Verify hospital

### Hospital
- `GET /api/hospital.php?action=overview` - Dashboard overview
- `POST /api/hospital.php?action=create_request` - Create blood request
- `GET /api/hospital.php?action=donors` - Get available donors

### User
- `GET /api/user.php?action=overview` - Dashboard overview
- `GET /api/user.php?action=find_hospitals` - Find hospitals
- `GET /api/user.php?action=donation_history` - Get donation history

## Support

For issues:
1. Check this setup guide
2. Review error logs
3. Test API endpoints directly
4. Check browser developer tools

The application is now fully connected with real backend integration!
