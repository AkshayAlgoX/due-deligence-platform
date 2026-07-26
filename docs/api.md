# API Documentation - Real Estate Due Diligence Agent

Complete API reference for all endpoints including authentication, property management, and due diligence data retrieval.

---

## 📋 Table of Contents
- [Authentication](#authentication)
- [Dashboard](#dashboard)
- [Properties](#properties)
- [User Management](#user-management)
- [Due Diligence (Milestone 2)](#due-diligence-milestone-2)
- [Error Responses](#error-responses)

---

## 🔐 Authentication

All endpoints except `POST /api/auth/*` require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### POST /api/auth/register
Register a new user account.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "BUYER"
}
```

**Roles:** `BUYER`, `AGENT`, `LEGAL_REVIEWER`, `FINANCIAL_INSTITUTION`, `ADMIN`

**Response (201 Created):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "BUYER",
  "createdAt": "2026-07-23T10:30:00Z"
}
```

**Error Responses:**
- `400` - Invalid input or email already exists
- `500` - Server error

---

### POST /api/auth/login
Authenticate user and receive JWT token.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "BUYER"
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `404` - User not found
- `500` - Server error

---

### POST /api/auth/google
Google OAuth2 authentication.

**Auth Required:** No

**Request Body:**
```json
{
  "googleToken": "google_oauth_token"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "BUYER"
  }
}
```

---

### POST /api/auth/forgot-password
Request password reset OTP.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "OTP sent to your email",
  "resetToken": "reset_token_for_verification"
}
```

**Error Responses:**
- `404` - Email not found
- `500` - Server error

---

### POST /api/auth/verify-otp
Verify OTP for password reset.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (200 OK):**
```json
{
  "verified": true,
  "resetToken": "valid_reset_token"
}
```

**Error Responses:**
- `400` - Invalid OTP
- `404` - User not found

---

### POST /api/auth/reset-password
Reset password after OTP verification.

**Auth Required:** No

**Request Body:**
```json
{
  "email": "user@example.com",
  "resetToken": "valid_reset_token",
  "newPassword": "NewSecurePass123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

**Error Responses:**
- `400` - Invalid token or password
- `404` - User not found

---

## 📊 Dashboard

### GET /api/dashboard/stats
Get dashboard statistics for authenticated user.

**Auth Required:** Yes (Bearer token)

**Response (200 OK):**
```json
{
  "totalProperties": 45,
  "recentSearches": 12,
  "pendingReviews": 3,
  "reportsGenerated": 28,
  "recentActivity": [
    {
      "action": "SEARCH",
      "propertyAddress": "123 Main St",
      "timestamp": "2026-07-23T10:30:00Z"
    }
  ]
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Server error

---

## 🏠 Properties

### GET /api/properties
Get all properties for authenticated user.

**Auth Required:** Yes (Bearer token)

**Query Parameters:**
- `page` (optional) - Page number (default: 0)
- `size` (optional) - Items per page (default: 20)
- `sort` (optional) - Sort by field (e.g., `createdAt,desc`)

**Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "address": "123 Main St, Springfield, IL 62701",
      "propertyType": "RESIDENTIAL",
      "yearBuilt": 1995,
      "squareFeet": 2200,
      "bedrooms": 3,
      "bathrooms": 2.5,
      "lastAssessedValue": 285000,
      "createdAt": "2026-07-23T10:30:00Z"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "totalElements": 45,
    "totalPages": 3
  }
}
```

---

### GET /api/properties/recent
Get recently searched properties.

**Auth Required:** Yes (Bearer token)

**Query Parameters:**
- `limit` (optional) - Number of results (default: 10)

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "address": "123 Main St, Springfield, IL 62701",
    "propertyType": "RESIDENTIAL",
    "lastSearchDate": "2026-07-23T10:30:00Z",
    "hasReport": true
  }
]
```

---

### GET /api/properties/{id}
Get property details by ID.

**Auth Required:** Yes (Bearer token)

**Path Parameters:**
- `id` - Property ID

**Response (200 OK):**
```json
{
  "id": 1,
  "address": "123 Main St, Springfield, IL 62701",
  "propertyType": "RESIDENTIAL",
  "yearBuilt": 1995,
  "squareFeet": 2200,
  "bedrooms": 3,
  "bathrooms": 2.5,
  "lotSize": 0.25,
  "lastAssessedValue": 285000,
  "ownerName": "John Smith",
  "ownerEmail": "john.smith@email.com",
  "createdAt": "2026-07-23T10:30:00Z",
  "updatedAt": "2026-07-23T14:30:00Z"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Property not found
- `500` - Server error

---

### GET /api/properties/search
Search properties by address.

**Auth Required:** Yes (Bearer token)

**Query Parameters:**
- `query` - Search query (street, city, or full address)
- `limit` (optional) - Number of results (default: 20)

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 1,
      "address": "123 Main St, Springfield, IL 62701",
      "propertyType": "RESIDENTIAL",
      "confidence": 0.95
    },
    {
      "id": 2,
      "address": "123 Main St, Springfield, MO 65806",
      "propertyType": "COMMERCIAL",
      "confidence": 0.78
    }
  ],
  "totalResults": 2
}
```

**Error Responses:**
- `400` - Invalid search query
- `500` - Server error

---

### POST /api/properties
Add a new property.

**Auth Required:** Yes (Bearer token)

**Request Body:**
```json
{
  "address": "123 Main St, Springfield, IL 62701",
  "propertyType": "RESIDENTIAL",
  "yearBuilt": 1995,
  "squareFeet": 2200,
  "bedrooms": 3,
  "bathrooms": 2.5,
  "lotSize": 0.25,
  "lastAssessedValue": 285000,
  "ownerName": "John Smith"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "address": "123 Main St, Springfield, IL 62701",
  "propertyType": "RESIDENTIAL",
  "yearBuilt": 1995,
  "squareFeet": 2200,
  "bedrooms": 3,
  "bathrooms": 2.5,
  "lotSize": 0.25,
  "lastAssessedValue": 285000,
  "createdAt": "2026-07-23T10:30:00Z"
}
```

**Error Responses:**
- `400` - Invalid input
- `401` - Unauthorized
- `500` - Server error

---

### PUT /api/properties/{id}
Update property details.

**Auth Required:** Yes (Bearer token)

**Path Parameters:**
- `id` - Property ID

**Request Body:**
```json
{
  "address": "123 Main St, Springfield, IL 62701",
  "propertyType": "RESIDENTIAL",
  "yearBuilt": 1995,
  "squareFeet": 2200,
  "bedrooms": 3,
  "bathrooms": 2.5,
  "lotSize": 0.25,
  "lastAssessedValue": 300000
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "address": "123 Main St, Springfield, IL 62701",
  "propertyType": "RESIDENTIAL",
  "yearBuilt": 1995,
  "squareFeet": 2200,
  "bedrooms": 3,
  "bathrooms": 2.5,
  "lotSize": 0.25,
  "lastAssessedValue": 300000,
  "updatedAt": "2026-07-23T14:30:00Z"
}
```

**Error Responses:**
- `400` - Invalid input
- `401` - Unauthorized
- `404` - Property not found
- `500` - Server error

---

### POST /api/properties/admin/reverify-all
Admin endpoint to reverify all property records.

**Auth Required:** Yes (Bearer token + ADMIN role)

**Response (202 Accepted):**
```json
{
  "message": "Reverification initiated",
  "totalProperties": 45,
  "estimatedTime": "5 minutes"
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (requires ADMIN role)
- `500` - Server error

---

## 👤 User Management

### DELETE /api/users/me
Delete authenticated user account.

**Auth Required:** Yes (Bearer token)

**Response (204 No Content):**
No response body

**Error Responses:**
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

## 🔍 Due Diligence (Milestone 2)

### GET /api/properties/{id}/aggregated
Get complete aggregated property information.

**Auth Required:** Yes (Bearer token)

**Path Parameters:**
- `id` - Property ID

**Response (200 OK):**
```json
{
  "propertyId": 1,
  "address": "123 Main St, Springfield, IL 62701",
  "ownership": {
    "ownerName": "John Smith",
    "ownershipType": "SINGLE",
    "purchaseDate": "2015-06-15",
    "purchasePrice": 220000
  },
  "taxHistory": [
    {
      "year": 2025,
      "assessedValue": 285000,
      "taxAmount": 4850.50,
      "paymentStatus": "PAID"
    },
    {
      "year": 2024,
      "assessedValue": 275000,
      "taxAmount": 4675.25,
      "paymentStatus": "PAID"
    }
  ],
  "zoning": {
    "zoneCode": "R-1",
    "description": "Single-Family Residential",
    "permittedUses": ["Single-family homes", "Home offices"],
    "restrictions": ["No commercial activity"]
  },
  "floodZone": {
    "zoneCode": "X",
    "description": "Minimal flood risk",
    "requiresInsurance": false
  },
  "permits": [
    {
      "permitNumber": "P2023-456",
      "type": "RENOVATION",
      "issueDate": "2023-03-10",
      "status": "COMPLETED"
    }
  ],
  "environmental": {
    "hazards": [],
    "riskLevel": "LOW",
    "recommendations": ["Standard disclosure requirements apply"]
  },
  "lastUpdated": "2026-07-23T14:30:00Z"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Property not found
- `500` - Server error

---

### GET /api/properties/{id}/ownership
Get ownership records for a property.

**Auth Required:** Yes (Bearer token)

**Path Parameters:**
- `id` - Property ID

**Response (200 OK):**
```json
{
  "propertyId": 1,
  "ownershipRecords": [
    {
      "ownerName": "John Smith",
      "ownershipType": "SINGLE",
      "purchaseDate": "2015-06-15",
      "purchasePrice": 220000,
      "titleNumber": "T123456789",
      "previousOwner": "Jane Doe"
    }
  ],
  "currentOwner": {
    "name": "John Smith",
    "since": "2015-06-15"
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Property not found
- `500` - Server error

---

### GET /api/properties/{id}/tax-history
Get tax history for a property.

**Auth Required:** Yes (Bearer token)

**Path Parameters:**
- `id` - Property ID

**Response (200 OK):**
```json
{
  "propertyId": 1,
  "taxHistory": [
    {
      "year": 2025,
      "assessedValue": 285000,
      "taxAmount": 4850.50,
      "paymentStatus": "PAID",
      "paymentDate": "2025-06-30"
    },
    {
      "year": 2024,
      "assessedValue": 275000,
      "taxAmount": 4675.25,
      "paymentStatus": "PAID",
      "paymentDate": "2024-06-28"
    }
  ],
  "taxRate": 1.7,
  "lastAssessmentDate": "2026-01-15"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Property not found
- `500` - Server error

---

### GET /api/properties/{id}/zoning
Get zoning information for a property.

**Auth Required:** Yes (Bearer token)

**Path Parameters:**
- `id` - Property ID

**Response (200 OK):**
```json
{
  "propertyId": 1,
  "zoneCode": "R-1",
  "description": "Single-Family Residential",
  "permittedUses": ["Single-family homes", "Home offices"],
  "restrictions": ["No commercial activity", "Maximum 2 stories"],
  "setbacks": {
    "front": 25,
    "rear": 20,
    "side": 10
  },
  "maxBuildingHeight": 35,
  "minLotSize": 0.20,
  "lastUpdated": "2026-01-15"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Property not found
- `500` - Server error

---

### GET /api/properties/{id}/flood-zone
Get flood zone verification for a property.

**Auth Required:** Yes (Bearer token)

**Path Parameters:**
- `id` - Property ID

**Response (200 OK):**
```json
{
  "propertyId": 1,
  "zoneCode": "X",
  "description": "Minimal flood risk",
  "requiresInsurance": false,
  "riskLevel": "LOW",
  "baseFloodElevation": null,
  "floodMapNumber": "17013C0375F",
  "effectiveDate": "2023-08-15",
  "recommendations": ["Standard disclosure requirements apply"]
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Property not found
- `500` - Server error

---

### GET /api/properties/{id}/permits
Get permit history for a property.

**Auth Required:** Yes (Bearer token)

**Path Parameters:**
- `id` - Property ID

**Response (200 OK):**
```json
{
  "propertyId": 1,
  "permits": [
    {
      "permitNumber": "P2023-456",
      "type": "RENOVATION",
      "description": "Kitchen and bathroom remodeling",
      "issueDate": "2023-03-10",
      "completionDate": "2023-08-20",
      "status": "COMPLETED",
      "contractor": "ABC Contractors",
      "value": 35000
    },
    {
      "permitNumber": "P2022-123",
      "type": "ROOFING",
      "description": "Roof replacement",
      "issueDate": "2022-05-15",
      "completionDate": "2022-06-01",
      "status": "COMPLETED",
      "contractor": "XYZ Roofing",
      "value": 12000
    }
  ],
  "hasUnresolvedPermits": false
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Property not found
- `500` - Server error

---

### GET /api/properties/{id}/environmental
Get environmental records for a property.

**Auth Required:** Yes (Bearer token)

**Path Parameters:**
- `id` - Property ID

**Response (200 OK):**
```json
{
  "propertyId": 1,
  "environmentalRecords": [
    {
      "type": "SOIL_TEST",
      "date": "2023-01-15",
      "results": "No contamination detected",
      "agency": "EPA"
    }
  ],
  "hazards": [],
  "riskLevel": "LOW",
  "recommendations": ["Standard disclosure requirements apply"],
  "lastUpdated": "2026-01-15"
}
```

**Error Responses:**
- `401` - Unauthorized
- `404` - Property not found
- `500` - Server error

---

## ❌ Error Responses

All endpoints may return the following error formats:

### 400 Bad Request
```json
{
  "timestamp": "2026-07-23T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid input: email must be valid",
  "path": "/api/auth/register"
}
```

### 401 Unauthorized
```json
{
  "timestamp": "2026-07-23T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired JWT token",
  "path": "/api/properties"
}
```

### 403 Forbidden
```json
{
  "timestamp": "2026-07-23T10:30:00Z",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied: ADMIN role required",
  "path": "/api/properties/admin/reverify-all"
}
```

### 404 Not Found
```json
{
  "timestamp": "2026-07-23T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Property not found with ID: 999",
  "path": "/api/properties/999"
}
```

### 500 Internal Server Error
```json
{
  "timestamp": "2026-07-23T10:30:00Z",
  "status": 500,
  "error": "Internal Server Error",
  "message": "An unexpected error occurred",
  "path": "/api/properties/search"
}
```

---

## 📝 Notes

### Authentication Flow
1. Register a new user via `/api/auth/register`
2. Login via `/api/auth/login` to receive JWT token
3. Include token in all subsequent requests: `Authorization: Bearer <token>`

### Role-Based Access
- **BUYER**: Can search and view properties
- **AGENT**: Can add and update properties
- **LEGAL_REVIEWER**: Access to due diligence data
- **FINANCIAL_INSTITUTION**: Access to financial data
- **ADMIN**: Full access including reverify-all endpoint

### Pagination
Most list endpoints support pagination with `page` and `size` parameters.

### Rate Limiting
API calls are rate-limited to 100 requests per minute per user.

---

**For questions or support, contact the development team.**