# 🛡️ CyberSuraksha

A secure consent management and data sharing platform for users, banks, and partners with AI-powered decision making.

## 🚀 Quick Start


### Installation

```bash
# Clone and setup
git clone <repository-url>
cd Cyber

# Install dependencies
cd backend && npm install
cd ../frontend && npm install  
cd ../aiService && npm install

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp aiService/.env.example aiService/.env

# Start MongoDB
mongod

# Initialize database
cd backend && node insertPolicyRules.js
```

### Running the App

```bash
# Terminal 1: Backend (Port 5000)
cd backend && npm run dev

# Terminal 2: AI Service (Port 3001)  
cd aiService && node decisionEngine.js

# Terminal 3: Frontend (Port 3000)
cd frontend && npm start
```

## 🏗️ Architecture

```
Cyber/
├── frontend/          # React.js UI
├── backend/           # Express.js API + MongoDB
└── aiService/         # AI decision engine
```

## ✨ Key Features

- **🔐 Secure Authentication** - JWT-based auth with role-based access
- **🤖 AI-Powered Decisions** - Automated consent validation
- **📊 Audit Trails** - Complete compliance logging
- **🔄 Consent Management** - Grant, revoke, and track permissions
- **🏦 Multi-tenant** - Users, Banks, and Partners


## 🛠️ Tech Stack

- **Frontend**: React.js, CSS3
- **Backend**: Node.js, Express.js, MongoDB, JWT
- **AI Service**: Node.js, External LLM APIs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**Note**: This is a prototype for educational purposes. Production deployment requires security audits and compliance reviews.