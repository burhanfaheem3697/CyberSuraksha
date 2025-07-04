const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Partner = require('./models/Partner');
const User = require('./models/User');
const VirtualID = require('./models/VirtualID');
const PolicyRule = require('./models/PolicyRule');

// Load environment variables
dotenv.config({ path: './.env' });

// Mock the blockchain service to avoid actual blockchain calls during testing
const originalBlockchainService = require('./utils/blockchainService');
const originalLlmPurposeClassifier = require('../aiService/llmPurposeClassifier');
const originalDecisionEngine = require('../aiService/decisionEngine');

// Create simple mocks
const mockBlockchainService = {
  logConsentOnChain: async function() {
    console.log('MOCK: Logging consent on blockchain');
    return 'mock-tx-hash';
  }
};

const mockLlmPurposeClassifier = {
  classifyPurpose: async function() {
    console.log('MOCK: Classifying purpose');
    return {
      main_category: 'loan',
      sub_category: 'loan::personal',
      requires_sensitive_data: false,
      justification: 'Testing justification'
    };
  }
};

const mockDecisionEngine = {
  evaluateConsentRequest: async function() {
    console.log('MOCK: Evaluating consent request');
    return {
      approved: true,
      source: 'HYBRID',
      reason: 'Passed all checks'
    };
  }
};

// Replace the modules temporarily for testing
require('./utils/blockchainService').logConsentOnChain = mockBlockchainService.logConsentOnChain;
require('../aiService/llmPurposeClassifier').classifyPurpose = mockLlmPurposeClassifier.classifyPurpose;
require('../aiService/decisionEngine').evaluateConsentRequest = mockDecisionEngine.evaluateConsentRequest;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to create test data
async function setupTestData() {
  try {
    // Create a test partner if doesn't exist
    let partner = await Partner.findOne({ email: 'test@partner.com' });
    if (!partner) {
      partner = await Partner.create({
        name: 'Test Partner',
        description: 'Partner for testing',
        trustScore: 80,
        purpose: 'Testing',
        email: 'test@partner.com',
        apiKey: 'test-api-key',
        password: 'password123'
      });
      console.log('Created test partner:', partner._id);
    }

    // Create a test user if doesn't exist
    let user = await User.findOne({ email: 'test@user.com' });
    if (!user) {
      user = await User.create({
        name: 'Test User',
        email: 'test@user.com',
        password: 'password123',
        virtualIds: []
      });
      console.log('Created test user:', user._id);
    }

    // Create a virtual ID for the test user linked to the partner
    let virtualId = await VirtualID.findOne({ userId: user._id, partnerId: partner._id });
    if (!virtualId) {
      virtualId = await VirtualID.create({
        userId: user._id,
        partnerId: partner._id,
        purpose: 'Testing'
      });
      
      // Add virtual ID to user's virtualIds array
      user.virtualIds.push(virtualId._id);
      await user.save();
      console.log('Created virtual ID:', virtualId._id);
    }

    // Create a policy rule for "loan" if it doesn't exist
    let rule = await PolicyRule.findOne({ purpose: 'loan' });
    if (!rule) {
      rule = await PolicyRule.create({
        purpose: 'loan',
        allowedFields: ['accountNumber', 'name', 'email', 'phoneNumber', 'address', 'incomeDetails'],
        deniedFields: ['ssn', 'password', 'taxId'],
        retentionDays: 90,
        minTrustScore: 70,
        crossBorderAllowed: true,
        dataResidency: 'ANY',
        consentRequired: true,
        quantumSafeRequired: false,
        anonymizationRequired: false
      });
      console.log('Created policy rule for loan');
    }

    return { partner, user, virtualId };
  } catch (error) {
    console.error('Error setting up test data:', error);
    throw error;
  }
}

// Function to simulate a consent request
async function testConsentRequest() {
  try {
    const { partner, user, virtualId } = await setupTestData();

    // Simulate the partner being authenticated
    const req = {
      partner: { partnerId: partner._id },
      body: {
        virtualUserId: virtualId._id,
        rawPurpose: 'Need account information to process a personal loan application',
        dataFields: ['accountNumber', 'name', 'address', 'incomeDetails'],
        duration: 60, // days
        dataResidency: 'IN',
        crossBorder: false,
        quantumSafe: false,
        anonymization: false
      }
    };

    // Mock response object
    const res = {
      status: function(statusCode) {
        console.log('Status:', statusCode);
        this.statusCode = statusCode;
        return this;
      },
      json: function(data) {
        console.log('Response:', JSON.stringify(data, null, 2));
        return this;
      }
    };

    // Import and call the controller function
    const ConsentController = require('./controllers/ConsentController');
    await ConsentController.createConsentRequest(req, res);

    console.log('Test completed');
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    // Restore original functions
    require('./utils/blockchainService').logConsentOnChain = originalBlockchainService.logConsentOnChain;
    require('../aiService/llmPurposeClassifier').classifyPurpose = originalLlmPurposeClassifier.classifyPurpose;
    require('../aiService/decisionEngine').evaluateConsentRequest = originalDecisionEngine.evaluateConsentRequest;
  }
}

// Run the test
testConsentRequest(); 