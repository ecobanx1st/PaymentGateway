const { KYC } = require("../../models/kycModel");
const { deleteImageFile } = require("../../utils/imageUpload");
const { buildKycDocumentFiles } = require("../../helpers/documentMetadata");
const notificationService = require("../../services/notification/notificationService");
const {
  resolveRecipient,
  sendKycSubmittedEmail,
} = require("../../services/email/verificationEmailService");
const { getIdentityDateValidationError } = require("./validators/kyc.validator");

const ISSUE_DATE_ERROR_MESSAGE =
  "Identity document issue date must be later than your date of birth.";

function isIssueDateAfterDob(dateOfBirth, issueDate) {
  if (!dateOfBirth || !issueDate) {
    return true;
  }

  const dob = new Date(`${dateOfBirth}T00:00:00.000Z`);
  const issue = new Date(`${issueDate}T00:00:00.000Z`);

  return issue.getTime() > dob.getTime();
}

function getEffectiveIdentityDateError(existingKyc, identityInput) {
  if (!identityInput) return null;

  const existingIdentity = (existingKyc && existingKyc.identity) || {};

  const effectiveIssueDate =
    identityInput.issueDate !== undefined
      ? identityInput.issueDate
      : existingIdentity.issueDate;

  const effectiveExpiryDate =
    identityInput.expiryDate !== undefined
      ? identityInput.expiryDate
      : existingIdentity.expiryDate;

  if (effectiveIssueDate === undefined && effectiveExpiryDate === undefined) {
    return null;
  }

  return getIdentityDateValidationError(
    effectiveIssueDate,
    effectiveExpiryDate,
  );
}

function buildUpdateData(validatedData) {
  const data = { ...validatedData };

  if (data.dateOfBirth) {
    data.dateOfBirth = new Date(data.dateOfBirth);
  }
  if (data.identity) {
    data.identity = { ...data.identity };
    if (data.identity.issueDate) {
      data.identity.issueDate = new Date(data.identity.issueDate);
    }
    if (data.identity.expiryDate) {
      data.identity.expiryDate = new Date(data.identity.expiryDate);
    }
  }

  return data;
  // data

}

function applyImages(kycDoc, images) {
  for (const key of ["frontImage", "backImage"]) {
    if (images[key]) {
      if (!kycDoc.identity) kycDoc.identity = {};
      kycDoc.identity[key] = images[key];
    }
  }
  if (images.selfieImage) {
    kycDoc.selfieImage = images.selfieImage;
  }
}

function isMergeableObject(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  );
}

function applyUpdateData(kycDoc, updateData) {
  for (const [key, value] of Object.entries(updateData)) {
    if (value === undefined || value === null) continue;

    if (isMergeableObject(value)) {
      const existing = isMergeableObject(kycDoc[key]) ? kycDoc[key] : {};
      const merged = { ...existing };

      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        if (nestedValue === undefined || nestedValue === null) continue;
        merged[nestedKey] = nestedValue;
      }

      kycDoc[key] = merged;
      kycDoc.markModified(key);
    } else {
      kycDoc[key] = value;
    }
  }

  return kycDoc;
}

function deleteReplacedImages(existingKyc, images) {
  const oldIdentity = existingKyc.identity || {};

  for (const key of ["frontImage", "backImage"]) {
    const newVal = images[key];
    const oldVal = oldIdentity[key];
    if (newVal && oldVal && newVal !== oldVal) {
      deleteImageFile(oldVal);
    }
  }

  if (images.selfieImage && existingKyc.selfieImage && images.selfieImage !== existingKyc.selfieImage) {
    deleteImageFile(existingKyc.selfieImage);
  }
}

const createKyc = async (req, reply) => {
  try {
    const userId = req.user._id;

    const existingKyc = await KYC.findOne({ userId }).lean();
    if (existingKyc) {
      return reply.code(409).send({
        success: false,
        message: "KYC already exists.",
        data: null,
      });
    }

    const images = req.kycImages || {};
    console.log(images)

    if (!images.frontImage) {
      return reply.code(400).send({
        success: false,
        message: "Front image is required.",
        data: null,
      });
    }
    if (!images.selfieImage) {
      return reply.code(400).send({
        success: false,
        message: "Selfie image is required.",
        data: null,
      });
    }

    if (!isIssueDateAfterDob(req.validatedData.dateOfBirth, req.validatedData.identity?.issueDate)) {
      return reply.code(400).send({
        success: false,
        message: ISSUE_DATE_ERROR_MESSAGE,
      });
    }

    const identityDateError = getEffectiveIdentityDateError(
      null,
      req.validatedData.identity,
    );
    if (identityDateError) {
      return reply.code(400).send({
        success: false,
        message: identityDateError,
      });
    }

    const kycData = {
      userId,
      ...req.validatedData,
      dateOfBirth: new Date(req.validatedData.dateOfBirth),
      identity: {
        ...req.validatedData.identity,
        frontImage: images.frontImage,
        backImage: images.backImage,
      },
      selfieImage: images.selfieImage,
      status: "Pending",
    };


    console.log(kycData)

    if (kycData.identity.issueDate) {
      kycData.identity.issueDate = new Date(kycData.identity.issueDate);
    }
    if (kycData.identity.expiryDate) {
      kycData.identity.expiryDate = new Date(kycData.identity.expiryDate);
    }

    const kyc = await KYC.create(kycData);

    await notificationService.createNotification({
      role: "admin",
      title: "New KYC Verification Request",
      description: "A user has submitted KYC verification.",
      type: "general",
      category: "ONBOARDING",
      status: "info",
      referenceId: kyc._id,
    });

    await notificationService.createNotification({
      user_id: userId,
      role: "user",
      title: "KYC Submitted Successfully",
      description:
        "Your KYC verification request has been submitted successfully. Our team will review your documents shortly.",
      type: "general",
      category: "ONBOARDING",
      status: "info",
      referenceId: kyc._id,
    });

    try {
      const { to, userName } = await resolveRecipient({
        user: req.user,
        fallbackEmail: kyc.email,
        fallbackName: [kyc.firstName, kyc.lastName].filter(Boolean).join(" "),
      });

      await sendKycSubmittedEmail({
        to,
        userName,
        applicationId: kyc._id,
        submittedAt: kyc.createdAt,
      });
    } catch (emailError) {
      console.error("Failed to send KYC submission email:", emailError);
    }

    return reply.code(201).send({
      success: true,
      message: "KYC created successfully.",
      data: kyc,
    });
  } catch (error) {
    console.error("createKyc Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const getuserKyc = async (req, reply) => {
  try {
    const userId = req.user._id;

    const kyc = await KYC.findOne({ userId }).lean();

    if (!kyc) {
      return reply.code(400).send({
        success: false,
        message: "KYC not found.",
        data: null,
      });
    }

    const data = { ...kyc, documentFiles: buildKycDocumentFiles(kyc) };

    return reply.code(200).send({
      success: true,
      message: "KYC fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("getuserKyc Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const editKyc = async (req, reply) => {
  try {
    const userId = req.user._id;

    const kyc = await KYC.findOne({ userId });

    if (!kyc) {
      return reply.code(404).send({
        success: false,
        message: "KYC not found. Please create KYC first.",
        data: null,
      });
    }

    if (kyc.status === "Approved") {
      return reply.code(403).send({
        success: false,
        message: "Your KYC has already been approved.",
        data: null,
      });
    }

    if (kyc.status === "Submitted") {
      return reply.code(403).send({
        success: false,
        message: "Your KYC is currently under review.",
        data: null,
      });
    }

    const { dateOfBirth, identity } = req.validatedData;

    if (
      dateOfBirth &&
      identity?.issueDate &&
      !isIssueDateAfterDob(dateOfBirth, identity.issueDate)
    ) {
      return reply.code(400).send({
        success: false,
        message: ISSUE_DATE_ERROR_MESSAGE,
      });
    }

    const effectiveIdentityDateError = getEffectiveIdentityDateError(
      kyc,
      identity,
    );
    if (effectiveIdentityDateError) {
      return reply.code(400).send({
        success: false,
        message: effectiveIdentityDateError,
      });
    }

    const images = req.kycImages || {};

    if (kyc.status === "Rejected") {
      deleteReplacedImages(kyc, images);

      applyUpdateData(kyc, buildUpdateData(req.validatedData));
      applyImages(kyc, images);

      kyc.status = "Pending";
      kyc.rejectionReason = null;
      kyc.adminNotes = null;
      kyc.rejectedFields = [];
      kyc.reviewedAt = null;
      kyc.verifiedBy = null;

      await kyc.save();

      await notificationService.createNotification({
        role: "admin",
        title: "KYC Verification Resubmitted",
        description: "A user has resubmitted KYC verification.",
        type: "general",
        category: "ONBOARDING",
        status: "info",
        referenceId: kyc._id,
      });

      return reply.code(200).send({
        success: true,
        message: "KYC updated successfully.",
        data: kyc,
      });
    }

    deleteReplacedImages(kyc, images);

    applyUpdateData(kyc, buildUpdateData(req.validatedData));
    applyImages(kyc, images);

    await kyc.save();

    return reply.code(200).send({
      success: true,
      message: "KYC updated successfully.",
      data: kyc,
    });
  } catch (error) {
    console.error("editKyc Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = { createKyc, getuserKyc, editKyc };
