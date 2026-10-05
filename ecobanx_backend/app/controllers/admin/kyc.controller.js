const mongoose = require("mongoose");
const { KYC } = require("../../models/kycModel");
const { escapeRegex } = require("../../middleware/utils/escapeRegex");
const { buildKycDocumentFiles } = require("../../helpers/documentMetadata");
const notificationService = require("../../services/notification/notificationService");
const {
  resolveRecipient,
  sendKycApprovedEmail,
  sendKycRejectedEmail,
} = require("../../services/email/verificationEmailService");

const getAllKyc = async (req, reply) => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      status = "all",
      fromDate,
      toDate,
    } = req.validatedData || {};

    // -----------------------------
    // Pagination
    // -----------------------------
    const pageNum = Math.max(
      1,
      parseInt(page, 10) || 1
    );

    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit, 10) || 10)
    );

    // -----------------------------
    // Build filter
    // -----------------------------
    const filter = {};

    // -----------------------------
    // Status filter
    // all / Pending / Approved / Rejected
    // -----------------------------
    if (status && status !== "all") {
      filter.status = status;
    }

    // -----------------------------
    // Search
    // -----------------------------
    if (search?.trim()) {
      const safeSearch = escapeRegex(search.trim());

      const searchRegex = new RegExp(
        safeSearch,
        "i"
      );

      filter.$or = [
        { firstName: searchRegex },
        { middleName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phoneNumber: searchRegex },
        { nationality: searchRegex },
        { countryOfResidence: searchRegex },
        { gender: searchRegex },

        // Identity
        {
          "identity.documentType": searchRegex,
        },
        {
          "identity.documentNumber": searchRegex,
        },

        // Address
        {
          "address.city": searchRegex,
        },
        {
          "address.state": searchRegex,
        },
        {
          "address.country": searchRegex,
        },
        {
          "address.postalCode": searchRegex,
        },
      ];
    }

    // -----------------------------
    // Date filter
    // -----------------------------
    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        const startDate = new Date(fromDate);

        startDate.setHours(
          0,
          0,
          0,
          0
        );

        filter.createdAt.$gte = startDate;
      }

      if (toDate) {
        const endDate = new Date(toDate);

        endDate.setHours(
          23,
          59,
          59,
          999
        );

        filter.createdAt.$lte = endDate;
      }
    }

    // -----------------------------
    // Get KYC records
    // -----------------------------
    const result = await KYC.paginate(filter, {
      page: pageNum,
      limit: limitNum,
      sort: {
        createdAt: -1,
      },
      populate: {
        path: "userId",
        select: "fullName email",
      },
      lean: true,
    });

    // -----------------------------
    // Build document files
    // -----------------------------
    const records = result.docs.map((record) => ({
      ...record,
      documentFiles: buildKycDocumentFiles(record),
    }));

    // -----------------------------
    // Response
    // -----------------------------
    return reply.code(200).send({
      success: true,
      message: "KYC records fetched successfully.",
      data: records,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    console.error("getAllKyc Error:", error);

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const getSingleKyc = async (req, reply) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid KYC ID",
        data: null,
      });
    }

    const kyc = await KYC.findById(id)
      .populate("userId", "fullName email")
      .lean();

    if (!kyc) {
      return reply.code(404).send({
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
    console.error("getSingleKyc Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const APPROVEABLE_KYC_STATUSES = ["Pending", "Submitted", "Rejected"];

const approveKyc = async (req, reply) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid KYC ID",
        data: null,
      });
    }

    const kyc = await KYC.findById(id);

    if (!kyc) {
      return reply.code(404).send({
        success: false,
        message: "KYC not found.",
        data: null,
      });
    }

    if (!APPROVEABLE_KYC_STATUSES.includes(kyc.status)) {
      return reply.code(400).send({
        success: false,
        message: `KYC cannot be approved. Current status: ${kyc.status}`,
        data: null,
      });
    }

    const updatedKyc = await KYC.findOneAndUpdate(
      {
        _id: id,
        status: { $in: APPROVEABLE_KYC_STATUSES },
      },
      {
        $set: {
          status: "Approved",
          verifiedBy: adminId,
          reviewedAt: new Date(),
          rejectionReason: null,
          adminNotes: null,
          rejectedFields: [],
        },
      },
      { new: true }
    );

    if (!updatedKyc) {
      return reply.code(409).send({
        success: false,
        message: `KYC cannot be approved. Current status: ${kyc.status}`,
        data: null,
      });
    }

    await notificationService.createNotification({
      user_id: kyc.userId,
      role: "user",
      title: "KYC Approved",
      description: "Congratulations! Your KYC verification has been approved.",
      type: "general",
      category: "ONBOARDING",
      status: "success",
      referenceId: kyc._id,
    });

    try {
      const { to, userName } = await resolveRecipient({
        userId: kyc.userId,
        fallbackEmail: kyc.email,
        fallbackName: [kyc.firstName, kyc.lastName].filter(Boolean).join(" "),
      });

      await sendKycApprovedEmail({
        to,
        userName,
        applicationId: updatedKyc._id,
        submittedAt: updatedKyc.createdAt,
      });
    } catch (emailError) {
      console.error("Failed to send KYC approval email:", emailError);
    }

    return reply.code(200).send({
      success: true,
      message: "KYC approved successfully.",
      data: updatedKyc,
    });
  } catch (error) {
    console.error("approveKyc Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const rejectKyc = async (req, reply) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const { rejectionReason, adminNotes } = req.validatedData;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid KYC ID",
        data: null,
      });
    }

    const kyc = await KYC.findById(id);

    if (!kyc) {
      return reply.code(404).send({
        success: false,
        message: "KYC not found.",
        data: null,
      });
    }

    const updatedKyc = await KYC.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          status: "Rejected",
          rejectionReason,
          adminNotes: adminNotes || null,
          verifiedBy: adminId,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedKyc) {
      return reply.code(409).send({
        success: false,
        message: "KYC could not be rejected. Please try again.",
        data: null,
      });
    }

    await notificationService.createNotification({
      user_id: kyc.userId,
      role: "user",
      title: "KYC Rejected",
      description: `Your KYC verification has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
      type: "general",
      category: "ONBOARDING",
      status: "failed",
      referenceId: kyc._id,
    });

    try {
      const { to, userName } = await resolveRecipient({
        userId: kyc.userId,
        fallbackEmail: kyc.email,
        fallbackName: [kyc.firstName, kyc.lastName].filter(Boolean).join(" "),
      });

      await sendKycRejectedEmail({
        to,
        userName,
        rejectionReason,
        applicationId: updatedKyc._id,
        submittedAt: updatedKyc.createdAt,
      });
    } catch (emailError) {
      console.error("Failed to send KYC rejection email:", emailError);
    }

    return reply.code(200).send({
      success: true,
      message: "KYC rejected successfully.",
      data: updatedKyc,
    });
  } catch (error) {
    console.error("rejectKyc Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = {
  getAllKyc,
  getSingleKyc,
  approveKyc,
  rejectKyc,
};
