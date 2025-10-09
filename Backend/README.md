# Secure Finance Backend API

A comprehensive backend API for the Secure Finance WebApp built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Multi-factor authentication (MFA)
  - Role-based access control
  - Session management
  - Password encryption with bcrypt

- **Account Management**
  - Primary and virtual accounts
  - Account creation, update, deletion
  - Money transfers between accounts
  - Balance tracking and validation

- **Transaction Management**
  - Complete transaction CRUD operations
  - Transaction categorization
  - Transaction history and analytics
  - Real-time balance updates

- **Expense Tracking**
  - Expense categorization
  - Monthly expense analytics
  - Recurring expense management
  - Budget integration

- **Budget Management**
  - Budget creation and tracking
  - Category-wise budget allocation
  - Budget vs actual spending analysis
  - Automated budget alerts

- **Security Features**
  - Rate limiting
  - Input validation and sanitization
  - CORS protection
  - Helmet security headers
  - Request logging and monitoring

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, cors
- **Validation**: express-validator, joi
- **Logging**: winston
- **Documentation**: Swagger/OpenAPI

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   - Install MongoDB locally or use MongoDB Atlas
   - Update MONGODB_URI in .env file

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/secure-finance

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=30m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_REFRESH_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile
- `PUT /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/verify-mfa` - Verify MFA code

### Accounts
- `GET /api/v1/accounts` - Get all user accounts
- `GET /api/v1/accounts/:id` - Get single account
- `POST /api/v1/accounts` - Create new account
- `PUT /api/v1/accounts/:id` - Update account
- `DELETE /api/v1/accounts/:id` - Delete account
- `POST /api/v1/accounts/transfer` - Transfer money between accounts
- `GET /api/v1/accounts/:id/transactions` - Get account transactions
- `GET /api/v1/accounts/:id/summary` - Get account summary

### Transactions
- `GET /api/v1/transactions` - Get all transactions
- `GET /api/v1/transactions/:id` - Get single transaction
- `POST /api/v1/transactions` - Create new transaction
- `PUT /api/v1/transactions/:id` - Update transaction
- `DELETE /api/v1/transactions/:id` - Delete transaction
- `GET /api/v1/transactions/summary` - Get transaction summary

### Expenses
- `GET /api/v1/expenses` - Get all expenses
- `GET /api/v1/expenses/:id` - Get single expense
- `POST /api/v1/expenses` - Create new expense
- `PUT /api/v1/expenses/:id` - Update expense
- `DELETE /api/v1/expenses/:id` - Delete expense
- `GET /api/v1/expenses/analytics` - Get expense analytics

### Budgets
- `GET /api/v1/budgets` - Get all budgets
- `GET /api/v1/budgets/:id` - Get single budget
- `POST /api/v1/budgets` - Create new budget
- `PUT /api/v1/budgets/:id` - Update budget
- `DELETE /api/v1/budgets/:id` - Delete budget
- `GET /api/v1/budgets/:id/analytics` - Get budget analytics

## Database Models

### User
- Personal information and authentication
- MFA settings and security preferences
- Account lockout and login attempts

### Account
- Primary and virtual accounts
- Balance tracking and account settings
- Account types and categories

### Transaction
- Financial transactions
- Categorization and metadata
- Transaction status and processing

### Expense
- Expense tracking and categorization
- Recurring expense management
- Budget integration

### Budget
- Budget creation and management
- Category-wise allocation
- Progress tracking and alerts

## Security Features

1. **Authentication**
   - JWT tokens with expiration
   - Refresh token rotation
   - Account lockout after failed attempts

2. **Authorization**
   - Role-based access control
   - Resource ownership validation
   - MFA requirement for sensitive operations

3. **Input Validation**
   - Comprehensive input validation
   - SQL injection prevention
   - XSS protection

4. **Rate Limiting**
   - IP-based rate limiting
   - Sensitive operation rate limiting
   - Configurable limits

5. **Security Headers**
   - Helmet.js security headers
   - CORS configuration
   - Content Security Policy

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [] // For validation errors
}
```

## Logging

- Winston logger with multiple transports
- Request/response logging
- Error logging with stack traces
- Log rotation and file management

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- --testNamePattern="Auth"
```

## Development

```bash
# Start development server with hot reload
npm run dev

# Run database migrations
npm run migrate

# Seed database with sample data
npm run seed
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secrets
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure monitoring and logging

## API Documentation

API documentation is available at `/api/v1/docs` when running the server.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.
