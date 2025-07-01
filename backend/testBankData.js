const mongoose = require('mongoose');
const UserBankData = require('./models/UserBankData');
require('dotenv').config();

async function testBankDataCreation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cybersuraksha');
    console.log('Connected to MongoDB');

    // Create a test user ID
    const testUserId = new mongoose.Types.ObjectId();
    
    // Create a test bank data entry
    const testBankData = new UserBankData({
      user_id: testUserId,
      income: 75000,
      credit_score: 750,
      transaction_summary: { groceries: 8000, emi: 12000, bills: 4000 },
      accounts: [
        {
          account_type: 'Savings',
          account_number: 'XXXX1234',
          balance: 100000,
          currency: 'INR',
          transactions: [
            {
              date: new Date(),
              description: 'Test Transaction',
              amount: 50000,
              type: 'credit',
              category: 'income'
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
        miscellaneous: 3000
      },
      savings: {
        fixed_deposits: 200000,
        recurring_deposits: 50000,
        mutual_funds: 100000,
        stocks: 50000,
        others: 25000
      },
      employer: 'TestCorp',
      employment_history: [
        {
          company: 'TestCorp',
          position: 'Senior Developer',
          start_date: new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
          end_date: null,
          salary: 75000
        }
      ],
      last_updated: new Date()
    });

    // Save the test data
    const saved = await testBankData.save();
    console.log('Test bank data created successfully!');
    console.log(JSON.stringify(saved, null, 2));

    // Clean up - delete the test entry
    await UserBankData.findByIdAndDelete(saved._id);
    console.log('Test data cleaned up');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the test
testBankDataCreation();