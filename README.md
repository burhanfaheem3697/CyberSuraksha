# 🛡️ CyberSuraksha - Consent & Data Sharing Platform

A comprehensive consent management and data sharing platform that enables secure, compliant, and AI-powered data sharing between users, banks, and partners while maintaining strict privacy controls and regulatory compliance.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [High-Level Flow](#high-level-flow)
- [Low-Level Implementation](#low-level-implementation)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Cyber is a multi-tenant consent management platform that facilitates secure data sharing between:
- **Users**: Individuals who control their personal data
- **Banks**: Financial institutions that hold user data
- **Partners**: Third-party organizations requesting data access

The platform uses AI-powered decision engines to evaluate consent requests, ensuring compliance with data protection regulations while enabling efficient data sharing workflows.

## 🏗️ Architecture

The project follows a microservices architecture with three main components:

```
Cyber/
├── frontend/          # React.js user interface
├── backend/           # Express.js API server
└── aiService/         # AI-powered decision engine
```

### Component Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | React.js | User interface for all stakeholders |
| **Backend** | Node.js + Express + MongoDB | API server, authentication, data management |
| **AI Service** | Node.js | Consent validation and decision making |

## 🔄 High-Level Flow

### 1. User Registration & KYC
```
User Registration → KYC Verification → Virtual ID Creation → Consent Management
```

### 2. Partner Integration
```
Partner Registration → Purpose Classification → Consent Request → AI Validation → Approval/Rejection
```

### 3. Data Sharing Workflow
```
Consent Request → Rule Validation → LLM Validation → Bank Data Retrieval → Audit Logging
```

### 4. Consent Management
```
User Dashboard → Consent Overview → Grant/Revoke → Audit Trail → Compliance Reporting
```

## 🔧 Low-Level Implementation

### Backend Structure

```
backend/
├── models/           # MongoDB schemas
├── controllers/      # Business logic
├── routes/          # API endpoints
├── middleware/      # Authentication & validation
└── utils/           # Helper functions
```

### Key Models

- **User**: Personal information, KYC status, virtual IDs
- **Partner**: Organization details, compliance info
- **Bank**: Financial institution data
- **Consent**: Data sharing agreements and permissions
- **VirtualID**: Anonymous user identifiers
- **AuditLog**: Complete audit trail for compliance

### AI Service Components

- **Decision Engine**: Orchestrates validation workflow
- **Rule Validator**: Checks against predefined policies
- **LLM Validator**: AI-powered consent evaluation
- **Purpose Classifier**: Categorizes data usage purposes

## ✨ Features

### 🔐 Security & Privacy
- Multi-factor authentication
- JWT-based session management
- Role-based access control
- Data anonymization support
- Quantum-safe encryption options

### 🤖 AI-Powered Decision Making
- Automated consent validation
- Purpose classification
- Risk assessment
- Compliance checking

### 📊 Compliance & Audit
- Complete audit trails
- Regulatory compliance (GDPR, CCPA, etc.)
- Data residency controls
- Cross-border transfer management

### 🔄 Workflow Management
- Multi-step consent approval
- Automated notifications
- Status tracking
- Revocation capabilities

## 🛠️ Tech Stack

### Frontend
- **React.js** - User interface framework
- **CSS3** - Styling and responsive design
- **React Router** - Navigation and routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### AI Service
- **Node.js** - Runtime environment
- **External LLM APIs** - AI validation services
- **Rule Engine** - Policy validation

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (v5 or higher)
- **Git**

### Optional
- **MongoDB Compass** - Database GUI
- **Postman** - API testing

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Cyber
```

### 2. Install Dependencies

Install dependencies for all three components:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install

# AI Service dependencies
cd ../aiService
npm install
```

### 3. Environment Configuration

Create environment files for each component:

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cyber
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

#### Frontend (.env)
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AI_SERVICE_URL=http://localhost:3001
```

#### AI Service (.env)
```bash
cd aiService
cp .env.example .env
```

Edit `aiService/.env`:
```env
PORT=3001
LLM_API_KEY=your_llm_api_key_here
LLM_API_URL=https://api.openai.com/v1
```

### 4. Database Setup

Start MongoDB:
```bash
# Start MongoDB service
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Initialize the database:
```bash
cd backend
node insertPolicyRules.js
```

## ⚙️ Configuration

### MongoDB Connection
The application connects to MongoDB using the connection string in your environment variables. Ensure MongoDB is running and accessible.

### JWT Configuration
Set a strong JWT secret in your backend environment variables for secure token generation.

### AI Service Configuration
Configure your preferred LLM service (OpenAI, Anthropic, etc.) in the AI service environment variables.

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the Backend Server**
```bash
cd backend
npm run dev
```
Server will start on `http://localhost:5000`

2. **Start the AI Service**
```bash
cd aiService
node decisionEngine.js
```
AI Service will start on `http://localhost:3001`

3. **Start the Frontend**
```bash
cd frontend
npm start
```
Frontend will start on `http://localhost:3000`

### Production Mode

1. **Build the Frontend**
```bash
cd frontend
npm run build
```

2. **Start Production Servers**
```bash
# Backend
cd backend
npm start

# AI Service
cd aiService
node decisionEngine.js
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/user/register` | User registration |
| POST | `/user/login` | User login |
| POST | `/partner/register` | Partner registration |
| POST | `/bank/register` | Bank registration |

### Consent Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/consent/request` | Create consent request |
| GET | `/consent/user/:id` | Get user consents |
| PUT | `/consent/:id/approve` | Approve consent |
| PUT | `/consent/:id/reject` | Reject consent |
| DELETE | `/consent/:id/revoke` | Revoke consent |

### Data Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/userbankdata/:userId` | Get user bank data |
| POST | `/virtualid/create` | Create virtual ID |
| GET | `/auditlog/:entityType/:id` | Get audit logs |

## 🔍 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
Use Postman or curl to test the API endpoints:

```bash
# Test user registration
curl -X POST http://localhost:5000/user/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Port Already in Use**
   - Change port numbers in `.env` files
   - Kill existing processes using the ports

3. **CORS Errors**
   - Verify frontend URL in backend CORS configuration
   - Check environment variables

4. **JWT Token Issues**
   - Ensure JWT_SECRET is set
   - Check token expiration settings

### Debug Mode

Enable debug logging:
```bash
# Backend
DEBUG=* npm run dev

# Frontend
REACT_APP_DEBUG=true npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting



## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Note**: This is a prototype version and is not ready for industry use. This project is for educational and demonstration purposes only. For production deployment, extensive security audits, compliance reviews, and industry-standard implementations would be required.