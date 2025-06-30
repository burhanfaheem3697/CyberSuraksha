const { maskFields } = require('./utils/fieldMasker');

// Create sample user bank data
const sampleUserBankData = {
  user_id: "5f8d0a3b9d3e7c1e4c9a7b6d",
  income: 75000,
  credit_score: 750,
  txn_summary: { groceries: 8000, emi: 12000, bills: 4000 },
  accounts: [
    {
      account_type: 'Savings',
      account_number: 'XXXX1234',
      balance: 100000,
      currency: 'INR',
      transactions: [
        {
          date: new Date(),
          description: 'Salary Credit',
          amount: 50000,
          type: 'credit',
          category: 'income'
        },
        {
          date: new Date(),
          description: 'Grocery Shopping',
          amount: 3000,
          type: 'debit',
          category: 'groceries'
        }
      ]
    }
  ],
  loans: [
    {
      loan_type: 'Personal',
      amount: 500000,
      interest_rate: 10.5,
      tenure: 36,
      emi: 15000,
      remaining_amount: 300000,
      status: 'Active'
    }
  ],
  cards: [
    {
      card_type: 'Credit',
      card_number: 'XXXX XXXX XXXX 1234',
      expiry: '01/26',
      credit_limit: 100000,
      outstanding: 25000,
      rewards_points: 1000
    }
  ],
  monthly_expenses: {
    housing: 15000,
    utilities: 3000,
    groceries: 8000,
    transportation: 4000,
    entertainment: 5000,
    healthcare: 2000,
    miscellaneous: 3000,
    _id: "5f8d0a3b9d3e7c1e4c9a7b6e"
  },
  savings: {
    fixed_deposits: 200000,
    recurring_deposits: 50000,
    mutual_funds: 100000,
    stocks: 50000,
    others: 25000,
    _id: "5f8d0a3b9d3e7c1e4c9a7b6f"
  },
  employer: 'TestCorp',
  employment_history: [
    {
      company: 'TestCorp',
      position: 'Senior Developer',
      start_date: new Date(),
      end_date: null,
      salary: 75000
    }
  ],
  last_updated: new Date()
};

// Define fields to mask
const fieldsToMask = [
  'income',
  'credit_score',
  'txn_summary',
  'employer',
  'accounts',
  'loans',
  'cards',
  'monthly_expenses',
  'savings',
  'employment_history',
  'last_updated'
];

// Mask the data
const maskedData = maskFields(sampleUserBankData, fieldsToMask);

// Display the results
console.log('============ ORIGINAL DATA ============');
console.log(JSON.stringify(sampleUserBankData, null, 2));
console.log('\n============ MASKED DATA ============');
console.log(JSON.stringify(maskedData, null, 2));