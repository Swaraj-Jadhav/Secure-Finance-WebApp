# Secure Finance Backend API Endpoints

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01"
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "identifier": "john@example.com",
  "password": "SecurePass123!"
}
```

### Refresh Token
```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

### Get User Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### Change Password
```http
PUT /auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldPassword123!",
  "newPassword": "newPassword123!",
  "confirmPassword": "newPassword123!"
}
```

### Verify MFA
```http
POST /auth/verify-mfa
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "123456"
}
```

## Account Endpoints

### Get All Accounts
```http
GET /accounts?type=primary&status=active&page=1&limit=10
Authorization: Bearer <token>
```

### Get Single Account
```http
GET /accounts/:id
Authorization: Bearer <token>
```

### Create Account
```http
POST /accounts
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountName": "Vacation Fund",
  "accountType": "virtual",
  "category": "travel",
  "initialBalance": 1000,
  "currency": "USD"
}
```

### Update Account
```http
PUT /accounts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "accountName": "Updated Account Name",
  "settings": {
    "notifications": {
      "lowBalance": true,
      "transactions": true
    }
  }
}
```

### Delete Account
```http
DELETE /accounts/:id
Authorization: Bearer <token>
```

### Transfer Money
```http
POST /accounts/transfer
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromAccountId": "account-id-1",
  "toAccountId": "account-id-2",
  "amount": 500,
  "description": "Transfer to savings"
}
```

### Get Account Transactions
```http
GET /accounts/:id/transactions?page=1&limit=20&type=deposit
Authorization: Bearer <token>
```

### Get Account Summary
```http
GET /accounts/:id/summary
Authorization: Bearer <token>
```

## Transaction Endpoints

### Get All Transactions
```http
GET /transactions?page=1&limit=20&type=expense&category=groceries&startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

### Get Single Transaction
```http
GET /transactions/:id
Authorization: Bearer <token>
```

### Create Transaction
```http
POST /transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "fromAccount": "account-id",
  "toAccount": "account-id-2",
  "amount": 100,
  "type": "transfer",
  "category": "transfer",
  "description": "Transfer between accounts"
}
```

### Get Transaction Summary
```http
GET /transactions/summary?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

## Expense Endpoints

### Get All Expenses
```http
GET /expenses?page=1&limit=20&category=groceries&startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

### Get Single Expense
```http
GET /expenses/:id
Authorization: Bearer <token>
```

### Create Expense
```http
POST /expenses
Authorization: Bearer <token>
Content-Type: application/json

{
  "category": "groceries",
  "amount": 75.50,
  "description": "Weekly grocery shopping",
  "date": "2025-01-20",
  "paymentMethod": "card"
}
```

### Update Expense
```http
PUT /expenses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 80.00,
  "description": "Updated grocery shopping"
}
```

### Delete Expense
```http
DELETE /expenses/:id
Authorization: Bearer <token>
```

### Get Expense Analytics
```http
GET /expenses/analytics?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

## Budget Endpoints

### Get All Budgets
```http
GET /budgets?page=1&limit=10&status=active&period=monthly
Authorization: Bearer <token>
```

### Get Single Budget
```http
GET /budgets/:id
Authorization: Bearer <token>
```

### Create Budget
```http
POST /budgets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Monthly Budget 2025",
  "description": "Main monthly budget",
  "period": "monthly",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31",
  "totalBudget": 5000,
  "categories": [
    {
      "category": "groceries",
      "budgetedAmount": 800,
      "color": "#3B82F6"
    },
    {
      "category": "utilities",
      "budgetedAmount": 400,
      "color": "#EF4444"
    }
  ]
}
```

### Update Budget
```http
PUT /budgets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Budget Name",
  "totalBudget": 5500
}
```

### Delete Budget
```http
DELETE /budgets/:id
Authorization: Bearer <token>
```

### Get Budget Analytics
```http
GET /budgets/analytics?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Demo Credentials

For testing purposes, use these demo credentials:

- **Username**: admin
- **Password**: SecureBank2025!
- **MFA Code**: 123456

## Rate Limiting

- 100 requests per 15 minutes per IP address
- Sensitive operations have additional rate limiting

## Pagination

Most list endpoints support pagination:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

## Filtering

Many endpoints support filtering:
- `type` - Filter by type
- `category` - Filter by category
- `status` - Filter by status
- `startDate` - Start date filter
- `endDate` - End date filter
