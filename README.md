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
- **🗄️ Data Room** - Users and partners can securely view shared data for each contract
- **🔍 Contract Filtering & Search** - Users can filter/search their contracts by partner, purpose, status, or date
- **📑 Partner Activity Logs** - Users can view the last 20 partner activity logs for each contract in the Data Room
- **⬇️ Export Logs** - Users can export contract access logs as JSON
- **⛓️ Blockchain Storage** - Consents are recorded on-chain only when approved by the user (not on partner creation)

## 🆕 New & Updated API Endpoints

### User Endpoints
- `GET /contract/user` — Fetch all contracts belonging to the authenticated user
- `GET /user/data-room/:contractId` — View the user's own data room for a contract (with access control, no logging)
- `GET /user/data-room-logs/:contractId` — View the last 20 partner activity logs for a contract (access control)

### Data Room Features
- **User Dashboard** now includes a "My Data Room" section showing only the user's contracts
- **Filtering/Search**: Filter contracts by partner, purpose, status, or date (fuzzy search supported)
- **Access Logs**: Users see only partner activity logs in the Data Room
- **Export Logs**: Users can export logs as JSON from the Data Room

### Blockchain Consent Storage
- **On Approval Only**: Consent is stored on the blockchain only when a user approves it. Partner creation of consent does not trigger blockchain storage.
- **Verification**: Users can verify consent and data hashes on-chain from the dashboard.

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

## UserBankData Model

The UserBankData model provides comprehensive financial information for users, which can be shared with partners through data contracts and consents.

### Schema Structure

```javascript
UserBankDataSchema {
  user_id: ObjectId,               // Reference to User model
  income: Number,                  // Monthly/annual income
  credit_score: Number,            // Simulated CIBIL score
  transaction_summary: Object,             // Aggregated transaction summary
  accounts: [                      // Array of bank accounts
    {
      account_type: String,        // Savings, Current, etc.
      account_number: String,      // Masked account number
      balance: Number,
      currency: String,
      transactions: [              // Recent transactions
        {
          date: Date,
          description: String,
          amount: Number,
          type: String,            // 'credit' or 'debit'
          category: String         // Transaction category
        }
      ]
    }
  ],
  loans: [                         // Array of loans
    {
      loan_type: String,           // Personal, Home, etc.
      amount: Number,
      interest_rate: Number,
      tenure: Number,              // In months
      emi: Number,
      remaining_amount: Number,
      status: String               // Active, Closed, Defaulted
    }
  ],
  cards: [                         // Array of cards
    {
      card_type: String,           // Credit or Debit
      card_number: String,         // Masked card number
      expiry: String,
      credit_limit: Number,
      outstanding: Number,
      rewards_points: Number
    }
  ],
  monthly_expenses: {              // Monthly expense breakdown
    housing: Number,
    utilities: Number,
    groceries: Number,
    transportation: Number,
    entertainment: Number,
    healthcare: Number,
    miscellaneous: Number
  },
  savings: {                       // Savings and investments
    fixed_deposits: Number,
    recurring_deposits: Number,
    mutual_funds: Number,
    stocks: Number,
    others: Number
  },
  employer: String,                // Current employer
  employment_history: [            // Employment history
    {
      company: String,
      position: String,
      start_date: Date,
      end_date: Date,
      salary: Number
    }
  ],
  last_updated: Date               // Last update timestamp
}
```

### Usage

When a user registers, dummy bank data is automatically generated with randomized but realistic financial information. This data is then available for:

1. Partners to access via data contracts with user consent
2. Partner data rooms for specific purposes like loan assessment
3. Internal analytics with appropriate data masking

### Data Masking

Financial data is sensitive and masked when shared with third parties. The masking rules include:
- Income and credit score are partially masked
- Account numbers are shown as XXXX + last 4 digits
- Transaction amounts are partially masked
- Loan amounts and EMIs are partially masked
- Card numbers are masked except for the last 4 digits