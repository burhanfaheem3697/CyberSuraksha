const Consent = require('../models/Consent');
const ConsentDraft = require('../models/ConsentDraft');
const PolicyRule = require('../models/PolicyRule');
const Partner = require('../models/Partner');
const UserAuditLog = require('../models/UserAuditLog');
const PartnerAuditLog = require('../models/PartnerAuditLog');
const { classifyPurpose } = require('../../aiService/llmPurposeClassifier');
const { validateWithRules } = require('../../aiService/ruleValidator');
const { validateWithLLM } = require('../../aiService/llmValidator');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/api_Error');
const ApiResponse = require('../utils/api_Response');

/**
 * Create a new consent draft
 * @route POST /api/consent-draft/create
 * @access Private (Partner)
 */
exports.createConsentDraft = asyncHandler(async (req, res) => {
  const { 
    virtualUserId, 
    rawPurpose, 
    dataFields, 
    duration, 
    dataResidency, 
    crossBorder, 
    quantumSafe, 
    anonymization,
    justification 
  } = req.body;

  const partnerId = req.partner._id; // Set by partner auth middleware

  // 1. LLM Purpose Classification
  const classification = await classifyPurpose(req.body);
  const { main_category, sub_category, requires_sensitive_data } = classification;

  // Create the draft
  const draft = await ConsentDraft.create({
    virtualUserId,
    partnerId,
    rawPurpose,
    purpose: main_category,
    mainCategory: main_category,
    subCategory: sub_category,
    justification: justification || classification.justification,
    dataFields,
    duration,
    dataResidency,
    crossBorder,
    quantumSafe,
    anonymization,
    status: 'DRAFT',
    requiresSensitiveData: requires_sensitive_data
  });

  // Log draft creation in audit logs
  await UserAuditLog.create({
    virtualUserId,
    action: 'CONSENT_DRAFT_CREATED',
    details: {
      partnerId,
      purpose: main_category,
      dataFields,
      rawPurpose,
      main_category,
      sub_category,
      requires_sensitive_data,
      justification: draft.justification
    },
    status: 'INFO',
    context: { draftId: draft._id }
  });

  await PartnerAuditLog.create({
    virtualUserId,
    action: 'CONSENT_DRAFT_CREATED',
    details: {
      partnerId,
      purpose: main_category,
      dataFields,
      rawPurpose,
      main_category,
      sub_category,
      requires_sensitive_data,
      justification: draft.justification
    },
    status: 'INFO',
    context: { draftId: draft._id }
  });

  return res.status(201).json(
    new ApiResponse(201, draft, "Consent draft created successfully")
  );
});

/**
 * Validate a consent draft
 * @route POST /api/consent-draft/validate/:id
 * @access Private (Partner)
 */
exports.validateConsentDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const partnerId = req.partner._id;

  // Find the draft
  const draft = await ConsentDraft.findOne({ _id: id, partnerId });
  if (!draft) {
    throw new ApiError(404, "Consent draft not found");
  }

  // Get partner info for validation
  const partner = await Partner.findById(partnerId);
  if (!partner) {
    throw new ApiError(400, "Invalid partner ID");
  }

  // 2. Field Normalization (already done during creation)

  // 3. Rule Validation
  const ruleValidationRequest = {
    partnerId: partnerId,
    purpose: draft.purpose,
    fieldsRequested: draft.dataFields,
    requestedDurationDays: draft.duration,
    partnerTrustScore: partner.trustScore,
    dataResidency: draft.dataResidency,
    crossBorder: draft.crossBorder,
    quantumSafe: draft.quantumSafe,
    anonymization: draft.anonymization,
    rawPurpose: draft.rawPurpose
  };

  const ruleResult = await validateWithRules(ruleValidationRequest);

  if (!ruleResult.approved) {
    // Update draft status
    draft.status = 'RULE_REJECTED';
    draft.rejectionReason = ruleResult.reason;
    draft.rejectionSource = ruleResult.source;
    await draft.save();

    // Log rejection in audit logs
    await UserAuditLog.create({
      virtualUserId: draft.virtualUserId,
      action: 'CONSENT_DRAFT_RULE_REJECTED',
      details: {
        partnerId,
        purpose: draft.purpose,
        dataFields: draft.dataFields,
        reason: ruleResult.reason,
        rawPurpose: draft.rawPurpose
      },
      status: 'REJECTED',
      context: { draftId: draft._id, source: ruleResult.source }
    });

    await PartnerAuditLog.create({
      virtualUserId: draft.virtualUserId,
      action: 'CONSENT_DRAFT_RULE_REJECTED',
      details: {
        partnerId,
        purpose: draft.purpose,
        dataFields: draft.dataFields,
        reason: ruleResult.reason,
        rawPurpose: draft.rawPurpose
      },
      status: 'REJECTED',
      context: { draftId: draft._id, source: ruleResult.source }
    });

    return res.status(400).json(
      new ApiResponse(400, { 
        draft, 
        validation: {
          approved: false,
          source: ruleResult.source,
          reason: ruleResult.reason
        }
      }, "Consent draft rejected by rule validation")
    );
  }

  // 4. LLM Justification Validation
  const llmResult = await validateWithLLM(ruleValidationRequest);

  if (!llmResult.approved) {
    // Update draft status
    draft.status = 'LLM_REJECTED';
    draft.rejectionReason = llmResult.reason;
    draft.rejectionSource = llmResult.source;
    await draft.save();

    // Log rejection in audit logs
    await UserAuditLog.create({
      virtualUserId: draft.virtualUserId,
      action: 'CONSENT_DRAFT_LLM_REJECTED',
      details: {
        partnerId,
        purpose: draft.purpose,
        dataFields: draft.dataFields,
        reason: llmResult.reason,
        rawPurpose: draft.rawPurpose
      },
      status: 'REJECTED',
      context: { draftId: draft._id, source: llmResult.source }
    });

    await PartnerAuditLog.create({
      virtualUserId: draft.virtualUserId,
      action: 'CONSENT_DRAFT_LLM_REJECTED',
      details: {
        partnerId,
        purpose: draft.purpose,
        dataFields: draft.dataFields,
        reason: llmResult.reason,
        rawPurpose: draft.rawPurpose
      },
      status: 'REJECTED',
      context: { draftId: draft._id, source: llmResult.source }
    });

    return res.status(400).json(
      new ApiResponse(400, { 
        draft, 
        validation: {
          approved: false,
          source: llmResult.source,
          reason: llmResult.reason
        }
      }, "Consent draft rejected by LLM validation")
    );
  }

  // Both validations passed, update draft status
  draft.status = 'VALIDATED';
  await draft.save();

  // Log validation success in audit logs
  await UserAuditLog.create({
    virtualUserId: draft.virtualUserId,
    action: 'CONSENT_DRAFT_VALIDATED',
    details: {
      partnerId,
      purpose: draft.purpose,
      dataFields: draft.dataFields,
      rawPurpose: draft.rawPurpose
    },
    status: 'SUCCESS',
    context: { draftId: draft._id }
  });

  await PartnerAuditLog.create({
    virtualUserId: draft.virtualUserId,
    action: 'CONSENT_DRAFT_VALIDATED',
    details: {
      partnerId,
      purpose: draft.purpose,
      dataFields: draft.dataFields,
      rawPurpose: draft.rawPurpose
    },
    status: 'SUCCESS',
    context: { draftId: draft._id }
  });

  return res.status(200).json(
    new ApiResponse(200, { 
      draft, 
      validation: {
        approved: true,
        source: "HYBRID",
        reason: "Passed all checks"
      }
    }, "Consent draft validated successfully")
  );
});

/**
 * Finalize a consent draft and create a consent
 * @route POST /api/consent-draft/finalize/:id
 * @access Private (Partner)
 */
exports.finalizeConsentDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const partnerId = req.partner._id;

  // Find the draft
  const draft = await ConsentDraft.findOne({ _id: id, partnerId });
  if (!draft) {
    throw new ApiError(404, "Consent draft not found");
  }

  // Check if draft is validated
  if (draft.status !== 'VALIDATED') {
    throw new ApiError(400, "Cannot finalize a draft that hasn't been validated");
  }

  // Create a new consent from the draft
  const consent = new Consent({
    virtualUserId: draft.virtualUserId,
    partnerId: draft.partnerId,
    purpose: draft.purpose,
    rawPurpose: draft.rawPurpose,
    mainCategory: draft.mainCategory,
    subCategory: draft.subCategory,
    justification: draft.justification,
    dataFields: draft.dataFields,
    duration: draft.duration,
    dataResidency: draft.dataResidency,
    crossBorder: draft.crossBorder,
    quantumSafe: draft.quantumSafe,
    anonymization: draft.anonymization,
    status: 'PENDING'
  });

  await consent.save();

  // Update draft status
  draft.status = 'FINALIZED';
  draft.consentId = consent._id;
  await draft.save();

  // Log finalization in audit logs
  await UserAuditLog.create({
    virtualUserId: draft.virtualUserId,
    action: 'CONSENT_DRAFT_FINALIZED',
    details: {
      partnerId,
      purpose: draft.purpose,
      dataFields: draft.dataFields,
      rawPurpose: draft.rawPurpose
    },
    status: 'SUCCESS',
    context: { draftId: draft._id, consentId: consent._id }
  });

  await PartnerAuditLog.create({
    virtualUserId: draft.virtualUserId,
    action: 'CONSENT_DRAFT_FINALIZED',
    details: {
      partnerId,
      purpose: draft.purpose,
      dataFields: draft.dataFields,
      rawPurpose: draft.rawPurpose
    },
    status: 'SUCCESS',
    context: { draftId: draft._id, consentId: consent._id }
  });

  return res.status(200).json(
    new ApiResponse(200, { draft, consent }, "Consent draft finalized and consent created successfully")
  );
});

/**
 * Get all drafts for a partner
 * @route GET /api/consent-draft/partner
 * @access Private (Partner)
 */
exports.getPartnerDrafts = asyncHandler(async (req, res) => {
  const partnerId = req.partner._id;
  
  const drafts = await ConsentDraft.find({ partnerId })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, drafts, "Partner drafts retrieved successfully")
  );
});

/**
 * Get a specific draft
 * @route GET /api/consent-draft/:id
 * @access Private (Partner)
 */
exports.getDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const partnerId = req.partner._id;

  const draft = await ConsentDraft.findOne({ _id: id, partnerId });
  if (!draft) {
    throw new ApiError(404, "Consent draft not found");
  }

  return res.status(200).json(
    new ApiResponse(200, draft, "Consent draft retrieved successfully")
  );
});

/**
 * Update a draft
 * @route PUT /api/consent-draft/:id
 * @access Private (Partner)
 */
exports.updateDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const partnerId = req.partner._id;
  const updateData = req.body;

  // Find the draft
  const draft = await ConsentDraft.findOne({ _id: id, partnerId });
  if (!draft) {
    throw new ApiError(404, "Consent draft not found");
  }

  // Only allow updates if draft is in DRAFT, RULE_REJECTED, or LLM_REJECTED status
  if (!['DRAFT', 'RULE_REJECTED', 'LLM_REJECTED'].includes(draft.status)) {
    throw new ApiError(400, `Cannot update draft in ${draft.status} status`);
  }

  // Update the draft
  Object.keys(updateData).forEach(key => {
    if (key !== '_id' && key !== 'partnerId' && key !== 'virtualUserId' && key !== 'status') {
      draft[key] = updateData[key];
    }
  });

  // Reset status to DRAFT
  draft.status = 'DRAFT';
  draft.rejectionReason = null;
  draft.rejectionSource = null;
  
  await draft.save();

  // Log update in audit logs
  await UserAuditLog.create({
    virtualUserId: draft.virtualUserId,
    action: 'CONSENT_DRAFT_UPDATED',
    details: {
      partnerId,
      purpose: draft.purpose,
      dataFields: draft.dataFields,
      rawPurpose: draft.rawPurpose
    },
    status: 'INFO',
    context: { draftId: draft._id }
  });

  await PartnerAuditLog.create({
    virtualUserId: draft.virtualUserId,
    action: 'CONSENT_DRAFT_UPDATED',
    details: {
      partnerId,
      purpose: draft.purpose,
      dataFields: draft.dataFields,
      rawPurpose: draft.rawPurpose
    },
    status: 'INFO',
    context: { draftId: draft._id }
  });

  return res.status(200).json(
    new ApiResponse(200, draft, "Consent draft updated successfully")
  );
});

/**
 * Delete a draft
 * @route DELETE /api/consent-draft/:id
 * @access Private (Partner)
 */
exports.deleteDraft = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const partnerId = req.partner._id;

  // Find the draft
  const draft = await ConsentDraft.findOne({ _id: id, partnerId });
  if (!draft) {
    throw new ApiError(404, "Consent draft not found");
  }

  // Only allow deletion if draft is not finalized
  if (draft.status === 'FINALIZED') {
    throw new ApiError(400, "Cannot delete a finalized draft");
  }

  // Log deletion in audit logs before deleting
  await UserAuditLog.create({
    virtualUserId: draft.virtualUserId,
    action: 'CONSENT_DRAFT_DELETED',
    details: {
      partnerId,
      purpose: draft.purpose,
      dataFields: draft.dataFields,
      rawPurpose: draft.rawPurpose
    },
    status: 'INFO',
    context: { draftId: draft._id }
  });

  await PartnerAuditLog.create({
    virtualUserId: draft.virtualUserId,
    action: 'CONSENT_DRAFT_DELETED',
    details: {
      partnerId,
      purpose: draft.purpose,
      dataFields: draft.dataFields,
      rawPurpose: draft.rawPurpose
    },
    status: 'INFO',
    context: { draftId: draft._id }
  });

  // Delete the draft
  await ConsentDraft.deleteOne({ _id: id });

  return res.status(200).json(
    new ApiResponse(200, null, "Consent draft deleted successfully")
  );
});