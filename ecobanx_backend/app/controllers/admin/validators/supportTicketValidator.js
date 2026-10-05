const { z } = require("zod");

const updateTicketStatusValidator = z.object({
  status: z.enum(["Open", "Closed"], {
    required_error: "Status is required",
    invalid_type_error: "Invalid status",
  }),
});

const adminReplyValidator = z.object({
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message is required")
    .max(5000, "Message cannot exceed 5000 characters"),
});


module.exports = {
  updateTicketStatusValidator,
  adminReplyValidator,

};
