const { z } = require("zod");

// ============================================================
// REGEX
// ============================================================

const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

// City / State / Country
const locationNameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;


const phoneRegex = /^\+[1-9]\d{7,14}$/;

const normalizePhoneNumber = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  return value
    .trim()
    .replace(/[\s()-]/g, "");
};
// Date format
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const ISSUE_DATE_ERROR =
  "Document issue date cannot be in the future.";

const EXPIRY_DATE_FUTURE_ERROR =
  "Document expiry date must be a future date.";

const EXPIRY_DATE_RELATION_ERROR =
  "Document expiry date must be after the issue date.";

const ISSUE_DATE_FORMAT_ERROR =
  "Please enter a valid document issue date.";

const EXPIRY_DATE_FORMAT_ERROR =
  "Please enter a valid document expiry date.";

// ============================================================
// DATE HELPERS
// ============================================================

function isValidCalendarDate(str) {
  if (typeof str !== "string") {
    return false;
  }

  const [y, m, d] = str.split("-").map(Number);

  const date = new Date(y, m - 1, d);

  return (
    !isNaN(date.getTime()) &&
    date.getFullYear() === y &&
    date.getMonth() === m - 1 &&
    date.getDate() === d
  );
}

function isNotFuture(str) {
  const today = new Date()
    .toISOString()
    .slice(0, 10);

  return str <= today;
}

function toCalendarDateString(value) {
  if (value instanceof Date) {
    return `${value.getUTCFullYear()}-${String(
      value.getUTCMonth() + 1
    ).padStart(2, "0")}-${String(
      value.getUTCDate()
    ).padStart(2, "0")}`;
  }

  return typeof value === "string"
    ? value.trim()
    : "";
}

function getCalendarDateMs(value) {
  const str = toCalendarDateString(value);

  const match =
    typeof str === "string"
      ? str.match(/^(\d{4})-(\d{2})-(\d{2})$/)
      : null;

  if (!match) {
    return NaN;
  }

  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);

  const date = new Date(
    Date.UTC(y, m - 1, d)
  );

  if (
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  ) {
    return NaN;
  }

  return date.getTime();
}

function getTodayUtcMs() {
  const now = new Date();

  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
}

// ============================================================
// IDENTITY DATE VALIDATION
// ============================================================

function getIdentityDateValidationError(
  issueDate,
  expiryDate
) {
  const todayMs = getTodayUtcMs();

  const issueMs = getCalendarDateMs(issueDate);
  const expiryMs = getCalendarDateMs(expiryDate);

  // Issue date cannot be future
  if (
    !Number.isNaN(issueMs) &&
    issueMs > todayMs
  ) {
    return ISSUE_DATE_ERROR;
  }

  // Expiry date must be after issue date
  if (
    !Number.isNaN(issueMs) &&
    !Number.isNaN(expiryMs) &&
    expiryMs <= issueMs
  ) {
    return EXPIRY_DATE_RELATION_ERROR;
  }

  // Expiry date cannot be today or in the past
  if (
    !Number.isNaN(expiryMs) &&
    expiryMs <= todayMs
  ) {
    return EXPIRY_DATE_FUTURE_ERROR;
  }

  return null;
}

// ============================================================
// DATE ZOD FIELDS
// ============================================================

function buildValidDateField(message) {
  return z
    .string()
    .trim()
    .refine(
      (v) => dateRegex.test(v),
      message
    )
    .refine(
      (v) => isValidCalendarDate(v),
      message
    );
}

const dateField = z
  .string()
  .trim()
  .refine(
    (v) => dateRegex.test(v),
    "Must be in YYYY-MM-DD format"
  )
  .refine(
    (v) => isValidCalendarDate(v),
    "Invalid calendar date"
  );

const issueDateFormatField =
  buildValidDateField(
    ISSUE_DATE_FORMAT_ERROR
  );

const expiryDateFormatField =
  buildValidDateField(
    EXPIRY_DATE_FORMAT_ERROR
  );

// ============================================================
// IDENTITY DATE SUPER REFINE
// ============================================================

function identityDateSuperRefine(data, ctx) {
  const error =
    getIdentityDateValidationError(
      data.issueDate,
      data.expiryDate
    );

  if (!error) {
    return;
  }

  ctx.addIssue({
    code: "custom",
    path:
      error === ISSUE_DATE_ERROR
        ? ["issueDate"]
        : ["expiryDate"],
    message: error,
  });
}

// ============================================================
// OPTIONAL EMPTY STRING HELPER
// ============================================================

const optionalString = (schema) =>
  z.preprocess(
    (value) => {
      if (
        typeof value === "string" &&
        value.trim() === ""
      ) {
        return undefined;
      }

      return value;
    },
    schema.optional()
  );

// ============================================================
// CREATE KYC VALIDATOR
// ============================================================

const createKycValidator = z
  .object({
    // --------------------------------------------------------
    // FIRST NAME
    // --------------------------------------------------------

    firstName: z
      .string({
        message: "First name is required",
      })
      .trim()
      .min(
        3,
        "First name must be at least 3 characters"
      )
      .max(
        21,
        "First name must not exceed 21 characters"
      )
      .regex(
        nameRegex,
        "First name can contain only letters, spaces, hyphens, and apostrophes."
      ),

    // --------------------------------------------------------
    // MIDDLE NAME
    // --------------------------------------------------------

    middleName: optionalString(
      z
        .string()
        .trim()
        .min(
          1,
          "Middle name must be at least 1 character"
        )
        .max(
          21,
          "Middle name must not exceed 21 characters"
        )
        .regex(
          nameRegex,
          "Middle name can contain only letters, spaces, hyphens, and apostrophes."
        )
    ),

    // --------------------------------------------------------
    // LAST NAME
    // --------------------------------------------------------

    lastName: z
      .string({
        message: "Last name is required",
      })
      .trim()
      .min(
        1,
        "Last name is required"
      )
      .max(
        21,
        "Last name must not exceed 21 characters"
      )
      .regex(
        nameRegex,
        "Last name can contain only letters, spaces, hyphens, and apostrophes."
      ),

    // --------------------------------------------------------
    // DATE OF BIRTH
    // --------------------------------------------------------

    dateOfBirth: z
      .string({
        message: "Date of birth is required",
      })
      .trim()
      .refine(
        (v) => dateRegex.test(v),
        "Must be in YYYY-MM-DD format"
      )
      .refine(
        (v) => isValidCalendarDate(v),
        "Invalid calendar date"
      )
      .refine(
        (v) => isNotFuture(v),
        "Date of birth cannot be in the future"
      ),

    // --------------------------------------------------------
    // GENDER
    // --------------------------------------------------------

    gender: z
      .enum(
        ["Male", "Female", "Other"],
        {
          message:
            "Gender must be Male, Female, or Other",
        }
      )
      .optional(),

    // --------------------------------------------------------
    // NATIONALITY
    // --------------------------------------------------------

    nationality: z
      .string({
        message: "Nationality is required",
      })
      .trim()
      .min(
        1,
        "Nationality is required"
      )
      .max(
        100,
        "Nationality cannot exceed 100 characters"
      )
      .regex(
        locationNameRegex,
        "Nationality can contain only letters, spaces, hyphens, and apostrophes."
      ),

    // --------------------------------------------------------
    // COUNTRY OF RESIDENCE
    // --------------------------------------------------------

    countryOfResidence: z
      .string({
        message:
          "Country of residence is required",
      })
      .trim()
      .min(
        1,
        "Country of residence is required"
      )
      .max(
        100,
        "Country of residence cannot exceed 100 characters"
      )
      .regex(
        locationNameRegex,
        "Country of residence can contain only letters, spaces, hyphens, and apostrophes."
      ),

    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    email: z
      .string({
        message: "Email is required",
      })
      .trim()
      .email("Invalid email format"),


    gender: z
      .enum(
        ["Male", "Female", "Other"],
        {
          message:
            "Gender must be Male, Female, or Other",
        }
      )
      .optional(),

    // --------------------------------------------------------
    // PHONE NUMBER
    // --------------------------------------------------------

    phoneNumber: z.preprocess(
      normalizePhoneNumber,
      z
        .string({
          message: "Phone number is required",
        })
        .regex(
          phoneRegex,
          "Please enter a valid international phone number with country code."
        )
    ),



    kind: z
      .string({
        message: "Kind is required",
      }),

    // --------------------------------------------------------
    // ADDRESS
    // --------------------------------------------------------

    address: z.object(
      {
        addressLine1: z
          .string({
            message:
              "Address line 1 is required",
          })
          .trim()
          .min(
            1,
            "Address line 1 is required"
          )
          .max(
            200,
            "Address line 1 cannot exceed 200 characters"
          ),

        addressLine2: optionalString(
          z
            .string()
            .trim()
            .max(
              200,
              "Address line 2 cannot exceed 200 characters"
            )
        ),

        city: z
          .string({
            message: "City is required",
          })
          .trim()
          .min(
            1,
            "City is required"
          )
          .max(
            100,
            "City cannot exceed 100 characters"
          )
          .regex(
            locationNameRegex,
            "City can contain only letters, spaces, hyphens, and apostrophes."
          ),

        state: z
          .string({
            message: "State is required",
          })
          .trim()
          .min(
            1,
            "State is required"
          )
          .max(
            100,
            "State cannot exceed 100 characters"
          )
          .regex(
            locationNameRegex,
            "State can contain only letters, spaces, hyphens, and apostrophes."
          ),

        postalCode: z
          .string({
            message:
              "Postal code is required",
          })
          .trim()
          .min(
            1,
            "Postal code is required"
          )
          .max(
            20,
            "Postal code cannot exceed 20 characters"
          ),

        country: z
          .string({
            message: "Country is required",
          })
          .trim()
          .min(
            1,
            "Country is required"
          )
          .max(
            100,
            "Country cannot exceed 100 characters"
          )
          .regex(
            locationNameRegex,
            "Country can contain only letters, spaces, hyphens, and apostrophes."
          ),
      },
      {
        message: "Address is required.",
      }
    ),


    // --------------------------------------------------------
    // IDENTITY
    // --------------------------------------------------------

    identity: z
      .object(
        {
          documentType: z.enum(
            [
              "Passport",
              "National ID",
              "Driving License",
            ],
            {
              message:
                "Document type is required",
            }
          ),

          documentNumber: z
            .string({
              message:
                "Document number is required",
            })
            .trim()
            .min(
              1,
              "Document number is required"
            )
            .max(
              50,
              "Document number cannot exceed 50 characters"
            ),

          issueDate:
            issueDateFormatField.optional(),

          expiryDate:
            expiryDateFormatField.optional(),
        },
        {
          message:
            "Identity information is required.",
        }
      )
      .superRefine(
        identityDateSuperRefine
      ),
  })
  .strict();

// ============================================================
// ALLOWED REJECTED FIELDS
// ============================================================

const ALLOWED_REJECTED_FIELDS = [
  "firstName",
  "middleName",
  "lastName",
  "dateOfBirth",
  "gender",
  "nationality",
  "countryOfResidence",
  "email",
  "phoneNumber",

  "address.addressLine1",
  "address.addressLine2",
  "address.city",
  "address.state",
  "address.postalCode",
  "address.country",

  "identity.documentType",
  "identity.documentNumber",
  "identity.issueDate",
  "identity.expiryDate",

  "identity.frontImage",
  "identity.backImage",

  "selfieImage",
];

// ============================================================
// EDIT KYC VALIDATOR
// ============================================================

const editKycValidator = z
  .object({
    // --------------------------------------------------------
    // FIRST NAME
    // --------------------------------------------------------

    firstName: z
      .string()
      .trim()
      .min(
        1,
        "First name is required"
      )
      .max(
        21,
        "First name must not exceed 21 characters"
      )
      .regex(
        nameRegex,
        "First name can contain only letters, spaces, hyphens, and apostrophes."
      )
      .optional(),

    // --------------------------------------------------------
    // MIDDLE NAME
    // --------------------------------------------------------

    middleName: optionalString(
      z
        .string()
        .trim()
        .max(
          21,
          "Middle name must not exceed 21 characters"
        )
        .regex(
          nameRegex,
          "Middle name can contain only letters, spaces, hyphens, and apostrophes."
        )
    ),

    // --------------------------------------------------------
    // LAST NAME
    // --------------------------------------------------------

    lastName: z
      .string()
      .trim()
      .min(
        1,
        "Last name is required"
      )
      .max(
        21,
        "Last name must not exceed 21 characters"
      )
      .regex(
        nameRegex,
        "Last name can contain only letters, spaces, hyphens, and apostrophes."
      )
      .optional(),

    // --------------------------------------------------------
    // DATE OF BIRTH
    // --------------------------------------------------------

    dateOfBirth: dateField
      .refine(
        (v) => isNotFuture(v),
        "Date of birth cannot be in the future"
      )
      .optional(),

    // --------------------------------------------------------
    // GENDER
    // --------------------------------------------------------

    gender: z
      .enum(
        ["Male", "Female", "Other"],
        {
          message:
            "Gender must be Male, Female, or Other",
        }
      )
      .optional(),

    // --------------------------------------------------------
    // NATIONALITY
    // --------------------------------------------------------

    nationality: z
      .string()
      .trim()
      .min(
        1,
        "Nationality is required"
      )
      .max(
        100,
        "Nationality cannot exceed 100 characters"
      )
      .regex(
        locationNameRegex,
        "Nationality can contain only letters, spaces, hyphens, and apostrophes."
      )
      .optional(),

    // --------------------------------------------------------
    // COUNTRY OF RESIDENCE
    // --------------------------------------------------------

    countryOfResidence: z
      .string()
      .trim()
      .min(
        1,
        "Country of residence is required"
      )
      .max(
        100,
        "Country of residence cannot exceed 100 characters"
      )
      .regex(
        locationNameRegex,
        "Country of residence can contain only letters, spaces, hyphens, and apostrophes."
      )
      .optional(),

    // --------------------------------------------------------
    // EMAIL
    // --------------------------------------------------------

    email: z
      .string()
      .trim()
      .email("Invalid email format")
      .optional(),

    // --------------------------------------------------------
    // PHONE
    // --------------------------------------------------------

    phoneNumber: z
      .string()
      .trim()
      .regex(
        phoneRegex,
        "Please enter a valid phone number with country code."
      )
      .optional(),

    // --------------------------------------------------------
    // ADDRESS
    // --------------------------------------------------------

    address: z
      .object({
        addressLine1: z
          .string()
          .trim()
          .min(
            1,
            "Address line 1 is required"
          )
          .max(
            200,
            "Address line 1 cannot exceed 200 characters"
          )
          .optional(),

        addressLine2: optionalString(
          z
            .string()
            .trim()
            .max(
              200,
              "Address line 2 cannot exceed 200 characters"
            )
        ),

        city: z
          .string()
          .trim()
          .min(
            1,
            "City is required"
          )
          .max(
            100,
            "City cannot exceed 100 characters"
          )
          .regex(
            locationNameRegex,
            "City can contain only letters, spaces, hyphens, and apostrophes."
          )
          .optional(),

        state: z
          .string()
          .trim()
          .min(
            1,
            "State is required"
          )
          .max(
            100,
            "State cannot exceed 100 characters"
          )
          .regex(
            locationNameRegex,
            "State can contain only letters, spaces, hyphens, and apostrophes."
          )
          .optional(),

        postalCode: z
          .string()
          .trim()
          .min(
            1,
            "Postal code is required"
          )
          .max(
            20,
            "Postal code cannot exceed 20 characters"
          )
          .optional(),

        country: z
          .string()
          .trim()
          .min(
            1,
            "Country is required"
          )
          .max(
            100,
            "Country cannot exceed 100 characters"
          )
          .regex(
            locationNameRegex,
            "Country can contain only letters, spaces, hyphens, and apostrophes."
          )
          .optional(),
      })
      .optional(),

    // --------------------------------------------------------
    // IDENTITY
    // --------------------------------------------------------

    identity: z
      .object({
        documentType: z
          .enum(
            [
              "Passport",
              "National ID",
              "Driving License",
            ],
            {
              message:
                "Invalid document type",
            }
          )
          .optional(),

        documentNumber: z
          .string()
          .trim()
          .min(
            1,
            "Document number is required"
          )
          .max(
            50,
            "Document number cannot exceed 50 characters"
          )
          .optional(),

        issueDate:
          issueDateFormatField.optional(),

        expiryDate:
          expiryDateFormatField.optional(),
      })
      .superRefine(
        identityDateSuperRefine
      )
      .optional(),
  })
  .strict();


module.exports = {
  createKycValidator,
  editKycValidator,
  ALLOWED_REJECTED_FIELDS,
  getIdentityDateValidationError,
};