const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import models
const Partner = require('./models/Partner');
const VirtualID = require('./models/VirtualID');
const ConsentDraft = require('./models/ConsentDraft');
const Consent = require('./models/Consent');

// Test data
let partnerToken = null;
let partnerId = null;
let virtualUserId = null;
let draftId = null;

// Helper function to get a partner token
async function getPartnerToken() {
  try {
    // Find a partner
    const partner = await Partner.findOne();
    if (!partner) {
      console.error('No partner found in the database');
      process.exit(1);
    }
    partnerId = partner._id;

    // Get a token
    const response = await axios.post('http://localhost:5000/partner/login', {
      email: 'shubhamsolo121@gmail.com',
      password: 'Shub1234!@#%' // This should be the actual password or a known test password
    });

    partnerToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXJ0bmVySWQiOiI2ODYyNThlMDIzYTMxYzU4NTViMWU2ZDciLCJlbWFpbCI6InNodWJoYW1zb2xvMTIxQGdtYWlsLmNvbSIsImlhdCI6MTc1MjQwNjU3MCwiZXhwIjoxNzUzMDExMzcwfQ._reQ_Qz4m2039eKMyCs5dG5IBn6pZxxPC5ackyOMeZw';
    console.log('Partner token obtained');
  } catch (error) {
    console.error('Error getting partner token:', error.response?.data || error.message);
    process.exit(1);
  }
}

// Helper function to get a virtual user ID
async function getVirtualUserId() {
  try {
    // Find a virtual ID
    const virtualId = await VirtualID.findOne();
    if (!virtualId) {
      console.error('No virtual ID found in the database');
      process.exit(1);
    }
    virtualUserId = virtualId._id;
    console.log('Virtual user ID obtained:', virtualUserId);
  } catch (error) {
    console.error('Error getting virtual user ID:', error);
    process.exit(1);
  }
}

// Test creating a consent draft
async function testCreateDraft() {
  try {
    console.log('\n--- Testing Create Consent Draft ---');
    const response = await axios.post(
      'http://localhost:5000/consent-draft/create',
      {
        virtualUserId,
        rawPurpose: 'Need financial data for loan eligibility assessment',
        dataFields: ['income','credit_score'],
        duration: 7,
        dataResidency: 'IN',
        crossBorder: false,
        quantumSafe: true,
        anonymization: false,
        justification: 'We need this data to assess loan eligibility and determine appropriate loan terms.'
      },
      {
        headers: {
          Cookie: `partnerToken=${partnerToken}`
        }
      }
    );

    console.log('Draft created successfully');
    console.log('Draft ID:', response.data.data._id);
    console.log('Status:', response.data.data.status);
    draftId = response.data.data._id;
    return response.data.data;
  } catch (error) {
    console.error('Error creating draft:', error.response?.data || error.message);
    return null;
  }
}

// Test validating a consent draft
async function testValidateDraft() {
  try {
    console.log('\n--- Testing Validate Consent Draft ---');
    const response = await axios.post(
      `http://localhost:5000/consent-draft/validate/${draftId}`,
      {},
      {
        headers: {
          Cookie: `partnerToken=${partnerToken}`
        }
      }
    );

    console.log('Validation result:', response.data.data.validation);
    console.log('Draft status after validation:', response.data.data.draft.status);
    return response.data.data;
  } catch (error) {
    console.error('Error validating draft:', error.response?.data || error.message);
    return null;
  }
}

// Test finalizing a consent draft
async function testFinalizeDraft() {
  try {
    console.log('\n--- Testing Finalize Consent Draft ---');
    const response = await axios.post(
      `http://localhost:5000/consent-draft/finalize/${draftId}`,
      {},
      {
        headers: {
          Cookie: `partnerToken=${partnerToken}`
        }
      }
    );

    console.log('Draft finalized successfully');
    console.log('Draft status after finalization:', response.data.data.draft.status);
    console.log('Consent ID:', response.data.data.consent._id);
    return response.data.data;
  } catch (error) {
    console.error('Error finalizing draft:', error.response?.data || error.message);
    return null;
  }
}

// Test getting all drafts for a partner
async function testGetPartnerDrafts() {
  try {
    console.log('\n--- Testing Get Partner Drafts ---');
    const response = await axios.get(
      'http://localhost:5000/consent-draft/partner',
      {
        headers: {
          Cookie: `partnerToken=${partnerToken}`
        }
      }
    );

    console.log(`Found ${response.data.data.length} drafts`);
    return response.data.data;
  } catch (error) {
    console.error('Error getting partner drafts:', error.response?.data || error.message);
    return null;
  }
}

// Test getting a specific draft
async function testGetDraft() {
  try {
    console.log('\n--- Testing Get Specific Draft ---');
    const response = await axios.get(
      `http://localhost:5000/consent-draft/${draftId}`,
      {
        headers: {
          Cookie: `partnerToken=${partnerToken}`
        }
      }
    );

    console.log('Draft details:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error getting draft:', error.response?.data || error.message);
    return null;
  }
}

// Test updating a draft
async function testUpdateDraft() {
  try {
    console.log('\n--- Testing Update Draft ---');
    const response = await axios.put(
      `http://localhost:5000/consent-draft/${draftId}`,
      {
        rawPurpose: 'Updated purpose: Need financial data for loan eligibility and risk assessment',
        justification: 'Updated justification: We need this data to assess loan eligibility, determine appropriate loan terms, and evaluate risk factors.'
      },
      {
        headers: {
          Cookie: `partnerToken=${partnerToken}`
        }
      }
    );

    console.log('Draft updated successfully');
    console.log('Updated draft:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('Error updating draft:', error.response?.data || error.message);
    return null;
  }
}

// Main test function
async function runTests() {
  try {
    // Setup
    await getPartnerToken();
    await getVirtualUserId();

    // Run tests
    const draft = await testCreateDraft();
    if (!draft) return;

    await testGetPartnerDrafts();
    await testGetDraft();
    await testUpdateDraft();
    
    const validationResult = await testValidateDraft();
    if (!validationResult || !validationResult.validation.approved) {
      console.log('Validation failed, cannot proceed with finalization');
      return;
    }

    await testFinalizeDraft();
    
    console.log('\n--- All tests completed successfully ---');
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    // Cleanup
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the tests
runTests();