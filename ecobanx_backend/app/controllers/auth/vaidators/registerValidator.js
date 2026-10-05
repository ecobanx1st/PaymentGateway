const { z } = require("zod");

const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

const companyRegex =
  /^[A-Za-z0-9&.,'()\- ]+$/;

const phoneRegex = /^[0-9]{7,15}$/;

const countryCodeRegex = /^\+[1-9][0-9]{0,3}$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]`~';]).{8,64}$/;

const registerValidator = z
  .object({
    accountType: z.enum(["individual", "business"], {
      required_error: "Account type is required",
      invalid_type_error: "Invalid account type",
    }),

    fullName: z
      .string({
        required_error: "Full name is required",
      })
      .trim()
      .min(3, "Full name must be at least 3 characters")
      .max(20, "Full name cannot exceed 20 characters")
      .regex(
        nameRegex,
        "Full name must contain only letters and spaces"
      ),

    companyName: z.string().trim().optional(),

    companyWebsite: z.string().trim().optional(),

    email: z
      .string({
        required_error: "Email is required",
      })
      .trim()
      .min(1, "Email is required")
      .max(255, "Email is too long")
      .email("Invalid email address"),

    phone: z
      .string({
        required_error: "Phone number is required",
      })
      .trim()
      .regex(phoneRegex, "Phone number must contain 7-15 digits"),

    phoneCountryCode: z
      .string({
        required_error: "Country code is required",
      })
      .trim()
      .regex(countryCodeRegex, "Invalid country code"),

    country: z
      .string({
        required_error: "Country is required",
      })
      .trim()
      .min(2, "Country is required")
      .max(100, "Country name is too long"),

    password: z
      .string({
        required_error: "Password is required",
      })
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password cannot exceed 64 characters")
      .regex(
        passwordRegex,
        "Password must contain uppercase, lowercase, number and special character"
      ),

    confirmPassword: z.string({
      required_error: "Confirm password is required",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }

    if (data.accountType === "business") {
      // Company Name
      if (!data.companyName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companyName"],
          message: "Company name is required",
        });
      } else {
        if (data.companyName.length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["companyName"],
            message: "Company name must be at least 2 characters",
          });
        }

        if (data.companyName.length > 50) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["companyName"],
            message: "Company name cannot exceed 50 characters",
          });
        }

        if (!companyRegex.test(data.companyName)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["companyName"],
            message: "Invalid company name",
          });
        }
      }

      // Company Website
      if (!data.companyWebsite?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companyWebsite"],
          message: "Company website is required",
        });
      } else {
        try {
          new URL(data.companyWebsite);

          const hostname = new URL(data.companyWebsite).hostname;

          if (!hostname.includes(".")) {
            throw new Error();
          }
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["companyWebsite"],
            message:
              "Enter a valid website URL",
          });
        }
      }
    }
  });

module.exports = { registerValidator };