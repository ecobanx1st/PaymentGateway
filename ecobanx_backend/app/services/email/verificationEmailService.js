const { Users } = require("../../models/usersModel");
const { sendEmail } = require("./sendEmail");

/**
 * Resolves the email recipient for a KYC/KYB application.
 * Reuses an already-loaded user document when provided, otherwise
 * queries the users collection. Falls back to application-level
 * fields (e.g. KYC email / KYB business email).
 */
const resolveRecipient = async ({ userId, user, fallbackEmail, fallbackName }) => {
  let to = fallbackEmail;
  let userName = fallbackName;

  try {
    const existingUser =
      user ||
      (userId ? await Users.findById(userId).select("fullName email").lean() : null);

    if (existingUser) {
      to = existingUser.email || to;
      userName = existingUser.fullName || userName;
    }
  } catch (error) {
    console.error("Failed to resolve email recipient:", error);
  }

  return { to, userName };
};

const sendVerificationEmail = async ({ to, subject, template, data }) => {
  if (!to) {
    console.error(`Skipping ${template} email: no recipient email available.`);
    return;
  }

  await sendEmail({ to, subject, template, data });
};

const sendKycSubmittedEmail = async ({ to, userName, applicationId, submittedAt }) => {
  await sendVerificationEmail({
    to,
    subject: "KYC Verification Submitted",
    template: "emails/kyc-submitted",
    data: { userName, status: "Pending", applicationId, submittedAt },
  });
};

const sendKycApprovedEmail = async ({ to, userName, applicationId, submittedAt }) => {
  await sendVerificationEmail({
    to,
    subject: "Your KYC Verification Has Been Approved",
    template: "emails/kyc-approved",
    data: { userName, status: "Approved", applicationId, submittedAt },
  });
};

const sendKycRejectedEmail = async ({
  to,
  userName,
  rejectionReason,
  applicationId,
  submittedAt,
}) => {
  await sendVerificationEmail({
    to,
    subject: "Action Required: Your KYC Verification Was Rejected",
    template: "emails/kyc-rejected",
    data: { userName, status: "Rejected", rejectionReason, applicationId, submittedAt },
  });
};

const sendKybSubmittedEmail = async ({ to, userName, applicationId, submittedAt }) => {
  await sendVerificationEmail({
    to,
    subject: "KYB Verification Submitted",
    template: "emails/kyb-submitted",
    data: { userName, status: "Pending", applicationId, submittedAt },
  });
};

const sendKybApprovedEmail = async ({ to, userName, applicationId, submittedAt }) => {
  await sendVerificationEmail({
    to,
    subject: "Your KYB Verification Has Been Approved",
    template: "emails/kyb-approved",
    data: { userName, status: "Approved", applicationId, submittedAt },
  });
};

const sendKybRejectedEmail = async ({
  to,
  userName,
  rejectionReason,
  applicationId,
  submittedAt,
}) => {
  await sendVerificationEmail({
    to,
    subject: "Action Required: Your KYB Verification Was Rejected",
    template: "emails/kyb-rejected",
    data: { userName, status: "Rejected", rejectionReason, applicationId, submittedAt },
  });
};

module.exports = {
  resolveRecipient,
  sendKycSubmittedEmail,
  sendKycApprovedEmail,
  sendKycRejectedEmail,
  sendKybSubmittedEmail,
  sendKybApprovedEmail,
  sendKybRejectedEmail,
};
