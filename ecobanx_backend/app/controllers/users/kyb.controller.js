const { KYB } = require("../../models/kybModel");
const { deleteImageFile } = require("../../utils/imageUpload");
const { buildKybDocumentFiles } = require("../../helpers/documentMetadata");
const notificationService = require("../../services/notification/notificationService");
const {
  resolveRecipient,
  sendKybSubmittedEmail,
} = require("../../services/email/verificationEmailService");

function mergeKybFiles(validatedData, kybFiles) {
  const data = { ...validatedData };

  for (const [key, filePath] of Object.entries(kybFiles)) {
    const parts = key.split(".");
    let current = data;

    for (let i = 0; i < parts.length; i++) {
      const part = /^\d+$/.test(parts[i]) ? parseInt(parts[i], 10) : parts[i];
      if (i === parts.length - 1) {
        current[part] = filePath;
      } else {
        const nextIsNumeric = /^\d+$/.test(parts[i + 1]);
        if (current[part] === undefined) {
          current[part] = nextIsNumeric ? [] : {};
        }
        current = current[part];
      }
    }
  }

  return data;
}

function deleteReplacedDocumentImages(existingKyb, newKybFiles) {
  const docKeys = [
    "incorporationCertificate",
    "taxCertificate",
    "addressProof",
  ];

  for (const docKey of docKeys) {
    const flatKey = `documents.${docKey}`;
    const newVal = newKybFiles[flatKey];
    const oldVal = existingKyb.documents ? existingKyb.documents[docKey] : null;
    if (newVal && oldVal && newVal !== oldVal) {
      deleteImageFile(oldVal);
    }
  }
}

function deleteReplacedBeneficialOwnerImages(existingKyb, newKybFiles) {
  const owners = Array.isArray(existingKyb.beneficialOwners)
    ? existingKyb.beneficialOwners
    : [];

  for (const [key, newVal] of Object.entries(newKybFiles)) {
    const match = key.match(/^beneficialOwners\.(\d+)\.beneficialOwnerDocumentImage$/);
    if (!match) continue;

    const oldVal = owners[Number(match[1])]?.beneficialOwnerDocumentImage;
    if (newVal && oldVal && newVal !== oldVal) {
      deleteImageFile(oldVal);
    }
  }
}

function deleteRemovedBeneficialOwnerImages(existingKyb, dataWithFiles) {
  const existingOwners = Array.isArray(existingKyb.beneficialOwners)
    ? existingKyb.beneficialOwners
    : [];
  const nextOwners = Array.isArray(dataWithFiles.beneficialOwners)
    ? dataWithFiles.beneficialOwners
    : [];

  for (let i = nextOwners.length; i < existingOwners.length; i++) {
    const image = existingOwners[i]?.beneficialOwnerDocumentImage;
    if (image) {
      deleteImageFile(image);
    }
  }
}

function preserveUnreplacedKybFiles(existingKyb, dataWithFiles) {
  const existingDocs = existingKyb.documents || {};
  const nextDocs = dataWithFiles.documents || {};

  for (const docKey of ["incorporationCertificate", "taxCertificate", "addressProof"]) {
    if (!nextDocs[docKey] && existingDocs[docKey]) {
      nextDocs[docKey] = existingDocs[docKey];
    }
  }

  if (Object.keys(nextDocs).length > 0) {
    dataWithFiles.documents = nextDocs;
  }

  const existingOwners = Array.isArray(existingKyb.beneficialOwners)
    ? existingKyb.beneficialOwners
    : [];
  const nextOwners = dataWithFiles.beneficialOwners;

  if (Array.isArray(nextOwners) && nextOwners.length > 0) {
    nextOwners.forEach((owner, index) => {
      const existingOwner = existingOwners[index];
      if (
        !owner.beneficialOwnerDocumentImage &&
        existingOwner?.beneficialOwnerDocumentImage
      ) {
        owner.beneficialOwnerDocumentImage =
          existingOwner.beneficialOwnerDocumentImage;
      }
    });
  }
}

const createKyb = async (req, reply) => {
  try {
    const userId = req.user._id;

    const existingKyb = await KYB.findOne({ userId }).lean();
    if (existingKyb) {
      return reply.code(409).send({
        success: false,
        message: "KYB already exists.",
        data: null,
      });
    }

    const kybFiles = req.kybFiles || {};

    if (!kybFiles["documents.incorporationCertificate"]) {
      return reply.code(400).send({
        success: false,
        message: "Incorporation certificate is required.",
        data: null,
      });
    }

    const validatedData = req.validatedData;
    const dataWithFiles = mergeKybFiles(validatedData, kybFiles);

    const kybData = {
      userId,
      ...dataWithFiles,
      incorporationDate: new Date(dataWithFiles.incorporationDate),
      status: "Pending",
    };

    const kyb = await KYB.create(kybData);

    await notificationService.createNotification({
      role: "admin",
      title: "New KYB Verification Request",
      description: "A user has submitted KYB verification.",
      type: "general",
      category: "ONBOARDING",
      status: "info",
      referenceId: kyb._id,
    });

    try {
      const { to, userName } = await resolveRecipient({
        user: req.user,
        fallbackEmail: kyb.businessEmail,
        fallbackName: kyb.businessName,
      });

      await sendKybSubmittedEmail({
        to,
        userName,
        applicationId: kyb._id,
        submittedAt: kyb.createdAt,
      });
    } catch (emailError) {
      console.error("Failed to send KYB submission email:", emailError);
    }

    return reply.code(201).send({
      success: true,
      message: "KYB created successfully.",
      data: kyb,
    });
  } catch (error) {
    console.error("createKyb Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const getuserKyb = async (req, reply) => {
  try {
    const userId = req.user._id;

    const kyb = await KYB.findOne({ userId }).lean();

    if (!kyb) {
      return reply.code(200).send({
        success: true,
        message: "KYB not yet started.",
        data: null,
      });
    }

    const data = { ...kyb, documentFiles: buildKybDocumentFiles(kyb) };

    return reply.code(200).send({
      success: true,
      message: "KYB fetched successfully.",
      data,
    });
  } catch (error) {
    console.error("getuserKyb Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const editKyb = async (req, reply) => {
  try {
    const userId = req.user._id;

    const kyb = await KYB.findOne({ userId });

    if (!kyb) {
      return reply.code(404).send({
        success: false,
        message: "KYB not found. Please create KYB first.",
        data: null,
      });
    }

    if (kyb.status === "Approved") {
      return reply.code(403).send({
        success: false,
        message: "Your KYB has already been approved.",
        data: null,
      });
    }

    if (kyb.status === "Submitted") {
      return reply.code(403).send({
        success: false,
        message: "Your KYB is currently under review.",
        data: null,
      });
    }

    const kybFiles = req.kybFiles || {};

    if (kyb.status === "Rejected") {
      deleteReplacedDocumentImages(kyb, kybFiles);
      deleteReplacedBeneficialOwnerImages(kyb, kybFiles);

      const validatedData = { ...req.validatedData };
      if (validatedData.incorporationDate) {
        validatedData.incorporationDate = new Date(validatedData.incorporationDate);
      }
      const dataWithFiles = mergeKybFiles(validatedData, kybFiles);
      preserveUnreplacedKybFiles(kyb, dataWithFiles);
      deleteRemovedBeneficialOwnerImages(kyb, dataWithFiles);

      for (const [key, value] of Object.entries(dataWithFiles)) {
        if (value !== undefined) {
          kyb[key] = value;
        }
      }

      kyb.status = "Pending";
      kyb.rejectionReason = null;
      kyb.adminNotes = null;
      kyb.rejectedFields = [];
      kyb.reviewedAt = null;
      kyb.approvedBy = null;

      await kyb.save();

      await notificationService.createNotification({
        role: "admin",
        title: "KYB Verification Resubmitted",
        description: "A user has resubmitted KYB verification.",
        type: "general",
        category: "ONBOARDING",
        status: "info",
        referenceId: kyb._id,
      });

      return reply.code(200).send({
        success: true,
        message: "KYB updated successfully.",
        data: kyb,
      });
    }

    deleteReplacedDocumentImages(kyb, kybFiles);
    deleteReplacedBeneficialOwnerImages(kyb, kybFiles);

    const validatedData = { ...req.validatedData };
    if (validatedData.incorporationDate) {
      validatedData.incorporationDate = new Date(validatedData.incorporationDate);
    }
    const dataWithFiles = mergeKybFiles(validatedData, kybFiles);
    preserveUnreplacedKybFiles(kyb, dataWithFiles);
    deleteRemovedBeneficialOwnerImages(kyb, dataWithFiles);
    Object.assign(kyb, dataWithFiles);

    await kyb.save();

    return reply.code(200).send({
      success: true,
      message: "KYB updated successfully.",
      data: kyb,
    });
  } catch (error) {
    console.error("editKyb Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = { createKyb, getuserKyb, editKyb };
