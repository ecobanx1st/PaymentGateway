const { z } = require("zod");

const createSupportTicketValidator = z
  .object({
    title: z
      .string()
      .trim()
      .min(5, "Title must be at least 5 characters")
      .max(50, "Title cannot exceed 50 characters")
      .optional(),

    description: z
      .string({ required_error: "Description is required" })
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(200, "Description cannot exceed 200 characters"),

    category: z.string().trim().optional(),

    customCategory: z
      .string()
      .trim()
      .min(10, "Custom category must be at least 10 characters")
      .max(25, "Custom category cannot exceed 25 characters")
      .optional(),


  })
  .refine(
    (data) => data.category || data.customCategory,
    {
      message: "Either category or custom category is required",
      path: ["category"],
    }
  );

const sendMessageValidator = z.object({
  ticketId: z.string({ required_error: "Ticket ID is required" }).trim().min(1),
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message cannot exceed 5000 characters"),
});

module.exports = { createSupportTicketValidator, sendMessageValidator };