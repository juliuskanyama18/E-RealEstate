<div align="center">

# ⚙️ BuildEstate Backend

### Robust Node.js API Server with AI Integration

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21+-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.9+-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)

[🔗 API Docs](../API_TESTING_GUIDE.md) • [📚 Backend Guide](../BACKEND_DOCUMENTATION.md) • [🐛 Report Issues](https://github.com/AAYUSH412/Real-Estate-Website/issues)

</div>

---

## ✨ Features

### � **Authentication & Security**
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Bcrypt for secure password storage
- **Rate Limiting** - Protection against DDoS and brute force
- **CORS Protection** - Configurable cross-origin policies
- **Input Validation** - Comprehensive request validation
- **Security Headers** - Helmet.js for security headers

### 🏠 **Property Management**
- **CRUD Operations** - Complete property lifecycle management
- **Image Upload** - ImageKit integration for media handling
- **Search & Filtering** - Advanced property search capabilities
- **AI Recommendations** - Machine learning property suggestions
- **Geolocation** - Location-based property queries
- **Bulk Operations** - Admin bulk property management

### 🤖 **AI & Intelligence**
- **Azure AI Services** - Cognitive services integration
- **OpenAI Integration** - GPT-powered property analysis
- **Web Scraping** - Firecrawl for market data collection
- **Market Analysis** - Real-time property valuation
- **Investment Insights** - ROI and trend predictions
- **Smart Matching** - User preference learning

### 📧 **Communication**
- **Email Notifications** - Automated email system
- **Appointment Management** - Booking and scheduling system
- **User Communications** - Contact form handling
- **Admin Notifications** - System alerts and reports

---

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Runtime** | Node.js 18+ | JavaScript runtime environment |
| **Framework** | Express.js | Web application framework |
| **Database** | MongoDB 8.9+ | NoSQL document database |
| **ODM** | Mongoose | MongoDB object modeling |
| **Authentication** | JWT + Bcrypt | Secure authentication system |
| **File Upload** | Multer + ImageKit | File handling and CDN |
| **Email** | Nodemailer | Email delivery system |
| **AI Services** | Azure AI + OpenAI | Artificial intelligence integration |
| **Security** | Helmet + CORS | Security middleware |
| **Validation** | Express Validator | Input validation |
| **Environment** | Dotenv | Environment configuration |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** ([Local](https://docs.mongodb.com/manual/installation/) or [Atlas](https://www.mongodb.com/cloud/atlas))
- **npm** 8+ or **yarn** 1.22+

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Configure environment variables (see below)
nano .env.local

# Start development server
npm run dev
```

Server starts at `http://localhost:4000`

### Environment Configuration

Create `.env.local` file with the following variables:

```bash
# Application
NODE_ENV=development
PORT=4000
APP_NAME=BuildEstate API

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/buildestate
# Or MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/buildestate?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12

# CORS Configuration
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password

# Image Storage (ImageKit)
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id/

# AI Services (Optional but recommended)
AZURE_AI_ENDPOINT=https://your-region.api.cognitive.microsoft.com/
AZURE_AI_KEY=your-azure-cognitive-services-key
OPENAI_API_KEY=sk-your-openai-api-key
FIRECRAWL_API_KEY=your-firecrawl-api-key

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
SESSION_SECRET=your-session-secret-key

# Logging
LOG_LEVEL=debug
LOG_FORMAT=combined

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp
```

---

## 🏗️ Project Structure

```
backend/
├── � config/                # Configuration files
│   ├── config.js             # App configuration
│   ├── mongodb.js            # Database connection
│   ├── imagekit.js           # ImageKit setup
│   └── nodemailer.js         # Email configuration
│
├── 📁 controller/            # Request handlers
│   ├── adminController.js    # Admin operations
│   ├── appointmentController.js # Appointment management
│   ├── formcontroller.js     # Contact forms
│   ├── newscontroller.js     # News/blog management
│   ├── productcontroller.js  # Legacy product controller
│   ├── propertyController.js # Property CRUD operations
│   └── Usercontroller.js     # User management
│
├── 📁 middleware/            # Custom middleware
│   ├── authmiddleware.js     # JWT authentication
│   ├── multer.js             # File upload handling
│   └── statsMiddleware.js    # Analytics middleware
│
├── 📁 models/                # MongoDB schemas
│   ├── appointmentModel.js   # Appointment schema
│   ├── formmodel.js          # Contact form schema
│   ├── newsmodel.js          # News/blog schema
│   ├── propertymodel.js      # Property schema
│   ├── statsModel.js         # Analytics schema
│   └── Usermodel.js          # User schema
│
├── 📁 routes/                # API routes
│   ├── adminRoute.js         # Admin API routes
│   ├── appointmentRoute.js   # Appointment routes
│   ├── formrouter.js         # Contact form routes
│   ├── newsRoute.js          # News/blog routes
│   ├── ProductRouter.js      # Legacy product routes
│   ├── propertyRoutes.js     # Property API routes
│   └── UserRoute.js          # User authentication routes
│
├── 📁 services/              # Business logic
│   ├── aiService.js          # AI integration service
│   └── firecrawlService.js   # Web scraping service
│
├── 📁 uploads/               # Temporary file uploads
│
├── 📄 server.js              # Main application entry
├── 📄 serverweb.js           # Alternative server setup
├── 📄 package.json           # Dependencies and scripts
├── 📄 docker-compose.yml     # Docker configuration
├── 📄 Dockerfile             # Docker image definition
└── 📄 vercel.json            # Vercel deployment config
```

---

## 📡 API Documentation

### Authentication Endpoints

```bash
POST   /api/users/register     # User registration
POST   /api/users/login        # User login
GET    /api/users/profile      # Get user profile (protected)
PUT    /api/users/profile      # Update user profile (protected)
POST   /api/users/logout       # User logout
POST   /api/users/forgot       # Forgot password
POST   /api/users/reset        # Reset password
```

### Property Endpoints

```bash
GET    /api/properties         # Get all properties
GET    /api/properties/:id     # Get property by ID
POST   /api/properties         # Create property (admin)
PUT    /api/properties/:id     # Update property (admin)
DELETE /api/properties/:id     # Delete property (admin)
POST   /api/properties/search  # Advanced property search
POST   /api/properties/favorite # Add/remove favorite
GET    /api/properties/featured # Get featured properties
```

### Appointment Endpoints

```bash
GET    /api/appointments        # Get appointments (protected)
POST   /api/appointments        # Book appointment
PUT    /api/appointments/:id    # Update appointment (admin)
DELETE /api/appointments/:id    # Cancel appointment
GET    /api/appointments/user   # Get user appointments
```

### Admin Endpoints

```bash
GET    /api/admin/stats         # Dashboard statistics
GET    /api/admin/users         # Manage users
GET    /api/admin/properties    # Property management
GET    /api/admin/appointments  # Appointment management
POST   /api/admin/bulk-upload   # Bulk property upload
GET    /api/admin/analytics     # Advanced analytics
```

### AI Services

```bash
POST   /api/ai/analyze          # Property analysis
POST   /api/ai/recommend        # Get recommendations
POST   /api/ai/valuation        # Property valuation
POST   /api/ai/market-trends    # Market analysis
```

For detailed API testing examples, see [API_TESTING_GUIDE.md](../API_TESTING_GUIDE.md)

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start with nodemon (auto-reload)
npm start                # Start production server
npm run build            # Prepare for deployment

# Database
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset database
npm run db:backup        # Backup database

# Testing (when configured)
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Utilities
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run docs             # Generate API documentation
```

### Development Workflow

1. **Create New Feature**
   ```bash
   # Create model
   touch models/newModel.js
   
   # Create controller
   touch controller/newController.js
   
   # Create routes
   touch routes/newRoute.js
   
   # Update server.js to include routes
   ```

2. **Database Operations**
   ```bash
   # Connect to MongoDB
   mongo buildestate
   
   # View collections
   show collections
   
   # Query data
   db.properties.find().limit(5)
   ```

3. **Testing APIs**
   ```bash
   # Use curl for quick testing
   curl -X GET http://localhost:4000/api/properties
   
   # Or use Postman/Insomnia
   ```

### Code Style Guidelines

- Use **ES6+ features** (async/await, destructuring, etc.)
- Follow **RESTful API conventions**
- Implement **proper error handling**
- Use **middleware for common functionality**
- Add **comprehensive input validation**
- Write **clear, descriptive comments**

### Controller Example

```javascript
// controller/propertyController.js
import Property from '../models/propertymodel.js';
import { validationResult } from 'express-validator';

// Get all properties with pagination
export const getProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const properties = await Property.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('owner', 'name email');

    const total = await Property.countDocuments({ status: 'active' });

    res.status(200).json({
      success: true,
      data: properties,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch properties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
```

---

## 🛡️ Security

### Implemented Security Measures

- **JWT Authentication** with secure token generation
- **Password Hashing** using bcrypt with salt rounds
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Input Validation** and sanitization
- **Security Headers** via Helmet.js
- **Environment Variables** for sensitive data
- **MongoDB Injection Prevention**

### Security Best Practices

```javascript
// Example: Secure route with validation
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts'
});

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  loginLimiter
];
```

---

## 🐳 Docker Deployment

### Docker Setup

```bash
# Build image
docker build -t buildestate-backend .

# Run container
docker run -p 4000:4000 --env-file .env.local buildestate-backend

# Using Docker Compose
docker-compose up --build
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 4000

USER node

CMD ["npm", "start"]
```

---

## 🌐 Production Deployment

### Render (Recommended)

1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy automatically on push to main branch

### Manual VPS Deployment

```bash
# On your server
git clone https://github.com/AAYUSH412/Real-Estate-Website.git
cd Real-Estate-Website/backend

# Install dependencies
npm ci --production

# Set up environment
cp .env.example .env
# Edit .env with production values

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start server.js --name buildestate-api

# Set up PM2 startup
pm2 startup
pm2 save
```

### Environment Variables for Production

```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/buildestate
JWT_SECRET=your-production-jwt-secret
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
# ... other production values
```

---

## 🔧 Configuration

### MongoDB Connection

```javascript
// config/mongodb.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
```

### Email Configuration

```javascript
// config/nodemailer.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default transporter;
```

---

## 🧪 Testing

### Testing Setup (To be implemented)

```bash
# Install testing dependencies
npm install --save-dev jest supertest mongodb-memory-server

# Create test files
mkdir tests
touch tests/auth.test.js
touch tests/properties.test.js
```

### Testing Example

```javascript
// tests/auth.test.js
import request from 'supertest';
import app from '../server.js';

describe('Authentication', () => {
  test('POST /api/users/register', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 🔍 Monitoring & Logging

### Performance Monitoring

```javascript
// Add to server.js
import compression from 'compression';

app.use(compression());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

### Health Check Endpoint

```javascript
// Add health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});
```

---

## 🔍 Troubleshooting

### Common Issues

**Database connection failed:**
```bash
# Check MongoDB status
brew services list | grep mongodb
# Or for systemd
systemctl status mongod

# Check connection string
echo $MONGODB_URI
```

**JWT authentication errors:**
```bash
# Verify JWT secret is set
echo $JWT_SECRET

# Check token format in requests
# Authorization: Bearer <token>
```

**File upload issues:**
```bash
# Check ImageKit configuration
# Verify file size limits
# Check CORS settings for file uploads
```

### Performance Issues

```bash
# Monitor memory usage
node --max-old-space-size=4096 server.js

# Use PM2 for production monitoring
pm2 monit
pm2 logs buildestate-api
```

### Getting Help

- Check [Backend Documentation](../BACKEND_DOCUMENTATION.md)
- Review [API Testing Guide](../API_TESTING_GUIDE.md)
- Submit [GitHub Issues](https://github.com/AAYUSH412/Real-Estate-Website/issues)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-endpoint`
3. Follow API design conventions
4. Add proper error handling and validation
5. Update documentation
6. Submit a pull request

### API Design Standards

- **RESTful conventions** for endpoints
- **Consistent response format**
- **Proper HTTP status codes**
- **Comprehensive error messages**
- **Input validation and sanitization**
- **Authentication where required**

---

<div align="center">

**Powering BuildEstate with robust API architecture**

[⭐ Star](https://github.com/AAYUSH412/Real-Estate-Website) • [🐛 Issues](https://github.com/AAYUSH412/Real-Estate-Website/issues) • [📖 Docs](../README.md)

</div> 
- **Railway**
- **Docker** containers

## 📞 Support

- Check the [troubleshooting guide](../BACKEND_DOCUMENTATION.md#-troubleshooting)
- Open an issue on GitHub
- Run `./setup.sh` for automated setup

---

Built with ❤️ for BuildEstate


To run the system:


# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd admin && npm run dev
Visit http://localhost:5174. Login as superadmin with the credentials in backend/.env.local, or register a new landlord account.