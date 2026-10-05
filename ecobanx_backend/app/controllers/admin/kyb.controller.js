const mongoose = require("mongoose");
const { KYB } = require("../../models/kybModel");
const { escapeRegex } = require("../../middleware/utils/escapeRegex");
const { buildKybDocumentFiles } = require("../../helpers/documentMetadata");
const notificationService = require("../../services/notification/notificationService");
const {
  resolveRecipient,
  sendKybApprovedEmail,
  sendKybRejectedEmail,
} = require("../../services/email/verificationEmailService");

const getAllKyb = async (req, reply) => {
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
    // all / Pending / Submitted / Approved / Rejected
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
        { businessName: searchRegex },
        { legalBusinessName: searchRegex },
        { registrationNumber: searchRegex },
        { taxId: searchRegex },
        { businessEmail: searchRegex },
        { businessPhone: searchRegex },
        { industry: searchRegex },

        // Address
        { "address.addressLine1": searchRegex },
        { "address.addressLine2": searchRegex },
        { "address.city": searchRegex },
        { "address.state": searchRegex },
        { "address.postalCode": searchRegex },
        { "address.country": searchRegex },

        // Beneficial owners
        { "beneficialOwners.fullName": searchRegex },
        { "beneficialOwners.nationality": searchRegex },
        { "beneficialOwners.documentType": searchRegex },
      ];
    }

    // -----------------------------
    // Date filter
    // -----------------------------
    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        const startDate = new Date(fromDate);

        if (Number.isNaN(startDate.getTime())) {
          return reply.code(400).send({
            success: false,
            message: "Invalid fromDate",
            data: null,
          });
        }

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

        if (Number.isNaN(endDate.getTime())) {
          return reply.code(400).send({
            success: false,
            message: "Invalid toDate",
            data: null,
          });
        }

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
    // Debug
    // Remove after testing
    // -----------------------------
    console.log("KYB Query:", req.query);
    console.log("KYB Validated Data:", req.validatedData);
    console.log("KYB Mongo Filter:", filter);

    // -----------------------------
    // Get KYB records
    // -----------------------------
    const result = await KYB.paginate(
      filter,
      {
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
      }
    );

    // -----------------------------
    // Build document files
    // -----------------------------
    const records = result.docs.map(
      (record) => ({
        ...record,
        documentFiles:
          buildKybDocumentFiles(record),
      })
    );

    // -----------------------------
    // Response
    // -----------------------------
    return reply.code(200).send({
      success: true,
      message: "KYB records fetched successfully.",
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
    console.error(
      "getAllKyb Error:",
      error
    );

    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const getKybDetails = async (req, reply) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid KYB ID",
        data: null,
      });
    }

    const kyb = await KYB.findById(id)
      .populate("userId", "fullName email")
      .lean();

    if (!kyb) {
      return reply.code(404).send({
        success: false,
        message: "KYB not found.",
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
    console.error("getKybDetails Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const APPROVEABLE_KYB_STATUSES = ["Pending", "Rejected"];

const approveKyb = async (req, reply) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid KYB ID",
        data: null,
      });
    }

    const kyb = await KYB.findById(id);

    if (!kyb) {
      return reply.code(404).send({
        success: false,
        message: "KYB not found.",
        data: null,
      });
    }

    if (!APPROVEABLE_KYB_STATUSES.includes(kyb.status)) {
      return reply.code(400).send({
        success: false,
        message: `KYB cannot be approved. Current status: ${kyb.status}`,
        data: null,
      });
    }

    const updatedKyb = await KYB.findOneAndUpdate(
      {
        _id: id,
        status: { $in: APPROVEABLE_KYB_STATUSES },
      },
      {
        $set: {
          status: "Approved",
          approvedBy: adminId,
          reviewedAt: new Date(),
          rejectionReason: null,
          adminNotes: null,
        },
      },
      { new: true }
    );

    if (!updatedKyb) {
      return reply.code(409).send({
        success: false,
        message: `KYB cannot be approved. Current status: ${kyb.status}`,
        data: null,
      });
    }

    await notificationService.createNotification({
      user_id: kyb.userId,
      role: "user",
      title: "KYB Approved",
      description: "Your KYB verification has been approved.",
      type: "general",
      category: "ONBOARDING",
      status: "success",
      referenceId: kyb._id,
    });

    try {
      const { to, userName } = await resolveRecipient({
        userId: kyb.userId,
        fallbackEmail: kyb.businessEmail,
        fallbackName: kyb.businessName,
      });

      await sendKybApprovedEmail({
        to,
        userName,
        applicationId: updatedKyb._id,
        submittedAt: updatedKyb.createdAt,
      });
    } catch (emailError) {
      console.error("Failed to send KYB approval email:", emailError);
    }

    return reply.code(200).send({
      success: true,
      message: "KYB approved successfully.",
      data: updatedKyb,
    });
  } catch (error) {
    console.error("approveKyb Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

const rejectKyb = async (req, reply) => {
  try {
    const { id } = req.params;
    const adminId = req.user._id;
    const { rejectionReason, adminNotes } = req.validatedData;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return reply.code(400).send({
        success: false,
        message: "Invalid KYB ID",
        data: null,
      });
    }

    const kyb = await KYB.findById(id);

    if (!kyb) {
      return reply.code(404).send({
        success: false,
        message: "KYB not found.",
        data: null,
      });
    }

    const updatedKyb = await KYB.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          status: "Rejected",
          rejectionReason,
          adminNotes: adminNotes || null,
          approvedBy: adminId,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedKyb) {
      return reply.code(409).send({
        success: false,
        message: "KYB could not be rejected. Please try again.",
        data: null,
      });
    }

    await notificationService.createNotification({
      user_id: kyb.userId,
      role: "user",
      title: "KYB Rejected",
      description: `Your KYB verification has been rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
      type: "general",
      category: "ONBOARDING",
      status: "failed",
      referenceId: kyb._id,
    });

    try {
      const { to, userName } = await resolveRecipient({
        userId: kyb.userId,
        fallbackEmail: kyb.businessEmail,
        fallbackName: kyb.businessName,
      });

      await sendKybRejectedEmail({
        to,
        userName,
        rejectionReason,
        applicationId: updatedKyb._id,
        submittedAt: updatedKyb.createdAt,
      });
    } catch (emailError) {
      console.error("Failed to send KYB rejection email:", emailError);
    }

    return reply.code(200).send({
      success: true,
      message: "KYB rejected successfully.",
      data: updatedKyb,
    });
  } catch (error) {
    console.error("rejectKyb Error:", error);
    return reply.code(500).send({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

module.exports = {
  getAllKyb,
  getKybDetails,
  approveKyb,
  rejectKyb,
};
