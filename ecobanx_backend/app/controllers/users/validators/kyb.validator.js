const { z } = require("zod");

// ============================================================
// REGEX
// ============================================================

const nameRegex =
  /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

const businessNameRegex =
  /^[A-Za-z0-9]+(?:[ .,'&()/-][A-Za-z0-9]+)*$/;

const identifierRegex =
  /^[A-Za-z0-9][A-Za-z0-9 ./_-]*$/;

const industryRegex =
  /^[A-Za-z]+(?:[ '&/-][A-Za-z]+)*$/;

const phoneRegex =
  /^\+[1-9]\d{7,14}$/;

const postalCodeRegex =
  /^[A-Za-z0-9][A-Za-z0-9 -]{1,19}$/;

const dateRegex =
  /^\d{4}-\d{2}-\d{2}$/;
// ============================================================
// DATE HELPERS
// ============================================================

function isValidCalendarDate(value) {
  if (typeof value !== "string") {
    return false;
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(
    Date.UTC(year, month - 1, day)
  );

  return (
    !Number.isNaN(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getTodayUtcMs() {
  const now = new Date();

  return Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
}

function getDateMs(value) {
  if (!isValidCalendarDate(value)) {
    return NaN;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  return Date.UTC(
    year,
    month - 1,
    day
  );
}

// ============================================================
// DATE FIELD
// ============================================================

const dateField = z
  .string({
    message: "Date is required",
  })
  .trim()
  .refine(
    (value) => dateRegex.test(value),
    "Date must be in YYYY-MM-DD format"
  )
  .refine(
    isValidCalendarDate,
    "Invalid calendar date"
  );

// Optional date
const optionalDateField = z.preprocess(
  (value) => {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" &&
        value.trim() === "")
    ) {
      return undefined;
    }

    return value;
  },
  dateField.optional()
);

// ============================================================
// INCORPORATION DATE
// ============================================================

const incorporationDateField = dateField.refine(
  (value) => getDateMs(value) <= getTodayUtcMs(),
  "Incorporation date cannot be in the future"
);

// ============================================================
// OPTIONAL STRING HELPER
// ============================================================

const optionalString = (schema) =>
  z.preprocess(
    (value) => {
      if (
        value === null ||
        value === undefined ||
        (typeof value === "string" &&
          value.trim() === "")
      ) {
        return undefined;
      }

      return value;
    },
    schema.optional()
  );

// ============================================================
// PHONE
// ============================================================


const phoneField = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      return value.trim().replace(/[\s-]/g, "");
    }

    return value;
  },
  z
    .string({
      message: "Phone number is required",
    })
    .regex(
      phoneRegex,
      "Please enter a valid international phone number with country code."
    )
);

// ============================================================
// BUSINESS NAME
// ============================================================

const businessNameField = z
  .string({
    message: "Business name is required",
  })
  .trim()
  .min(
    2,
    "Business name must be at least 2 characters"
  )
  .max(
    25,
    "Business name cannot exceed 25 characters"
  )
  .regex(
    businessNameRegex,
    "Business name contains invalid characters"
  );

// ============================================================
// LEGAL BUSINESS NAME
// ============================================================

const legalBusinessNameField = z
  .string({
    message: "Legal business name is required",
  })
  .trim()
  .min(
    2,
    "Legal business name must be at least 2 characters"
  )
  .max(
    150,
    "Legal business name cannot exceed 150 characters"
  )
  .regex(
    businessNameRegex,
    "Legal business name contains invalid characters"
  );

// ============================================================
// IDENTIFIER
// ============================================================

const registrationNumberField = z
  .string({
    message: "Registration number is required",
  })
  .trim()
  .min(
    2,
    "Registration number must be at least 2 characters"
  )
  .max(
    50,
    "Registration number cannot exceed 50 characters"
  )
  .regex(
    identifierRegex,
    "Registration number contains invalid characters"
  );

const taxIdField = z
  .string()
  .trim()
  .min(
    2,
    "Tax ID must be at least 2 characters"
  )
  .max(
    50,
    "Tax ID cannot exceed 50 characters"
  )
  .regex(
    identifierRegex,
    "Tax ID contains invalid characters"
  );

// ============================================================
// LOCATION
// ============================================================

const locationField = (
  requiredMessage,
  invalidMessage
) =>
  z
    .string({
      message: requiredMessage,
    })
    .trim()
    .min(1, requiredMessage)
    .max(
      100,
      `${requiredMessage.replace(
        " is required",
        ""
      )} cannot exceed 100 characters`
    )
    .regex(
      nameRegex,
      invalidMessage
    );

// ============================================================
// ADDRESS
// ============================================================

const addressSchema = z
  .object(
    {
      addressLine1: z
        .string({
          message:
            "Address line 1 is required",
        })
        .trim()
        .min(
          5,
          "Address line 1 must be at least 5 characters"
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

      city: locationField(
        "City is required",
        "City can contain only letters, spaces, hyphens, apostrophes, and ampersands."
      ),

      state: locationField(
        "State is required",
        "State can contain only letters, spaces, hyphens, apostrophes, and ampersands."
      ),

      postalCode: z
        .string({
          message:
            "Postal code is required",
        })
        .trim()
        .min(
          2,
          "Postal code must be at least 2 characters"
        )
        .max(
          20,
          "Postal code cannot exceed 20 characters"
        )
        .regex(
          postalCodeRegex,
          "Invalid postal code format"
        ),

      country: locationField(
        "Country is required",
        "Country can contain only letters, spaces, hyphens, apostrophes, and ampersands."
      ),
    },
    {
      message: "Address is required.",
    }
  )
  .strict();

// ============================================================
// BENEFICIAL OWNER
// ============================================================

const beneficialOwnerNameField = z
  .string({
    message:
      "Beneficial owner full name is required",
  })
  .trim()
  .min(
    2,
    "Beneficial owner full name must be at least 2 characters"
  )
  .max(
    21,
    "Beneficial owner full name cannot exceed 21 characters"
  )
  .regex(
    nameRegex,
    "Beneficial owner name can contain only letters, spaces, hyphens, and apostrophes."
  );

const beneficialOwnerNationalityField =
  z
    .string()
    .trim()
    .min(
      2,
      "Beneficial owner nationality must be at least 2 characters"
    )
    .max(
      100,
      "Beneficial owner nationality cannot exceed 100 characters"
    )
    .regex(
      nameRegex,
      "Invalid beneficial owner nationality"
    );

const beneficialOwnerDocumentTypeField =
  z.enum(
    [
      "Passport",
      "National ID",
      "Driving License",
    ],
    {
      message:
        "Invalid beneficial owner document type",
    }
  );

const beneficialOwnerDocumentNumberField =
  z
    .string()
    .trim()
    .min(
      2,
      "Beneficial owner document number must be at least 2 characters"
    )
    .max(
      50,
      "Beneficial owner document number cannot exceed 50 characters"
    )
    .regex(
      identifierRegex,
      "Beneficial owner document number contains invalid characters"
    );

// ============================================================
// OWNERSHIP PERCENTAGE
// ============================================================

const ownershipPercentageField = z.preprocess(
  (value) => {
    if (
      value === null ||
      value === undefined ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return undefined;
    }

    if (
      typeof value === "string" &&
      !/^\d+(?:\.\d+)?$/.test(value.trim())
    ) {
      return value;
    }

    return Number(value);
  },
  z
    .number({
      message: "Ownership percentage must be a number",
    })
    .min(
      0,
      "Ownership percentage must be at least 0"
    )
    .max(
      100,
      "Ownership percentage cannot exceed 100"
    )
    .optional()
);
// ============================================================
// BENEFICIAL OWNER SCHEMA
// ============================================================

const beneficialOwnerSchema = z
  .object(
    {
      fullName: beneficialOwnerNameField,

      dateOfBirth: optionalDateField.refine(
        (value) => {
          if (!value) {
            return true;
          }

          return (
            getDateMs(value) <=
            getTodayUtcMs()
          );
        },
        "Beneficial owner date of birth cannot be in the future"
      ),

      nationality:
        optionalString(
          beneficialOwnerNationalityField
        ),

      ownershipPercentage:
        ownershipPercentageField,

      documentType:
        optionalString(
          beneficialOwnerDocumentTypeField
        ),

      documentNumber:
        optionalString(
          beneficialOwnerDocumentNumberField
        ),
    },
    {
      message:
        "Invalid beneficial owner information",
    }
  )
  .strict();

// ============================================================
// COMPANY TYPE
// ============================================================

const companyTypeField = z.enum(
  [
    "Private Limited",
    "Public Limited",
    "LLC",
    "Partnership",
    "Sole Proprietorship",
    "NGO",
    "Government",
    "Other",
  ],
  {
    message:
      "Company type must be a valid company type",
  }
);

// ============================================================
// INDUSTRY
// ============================================================

const industryField = z
  .string({
    message: "Industry is required",
  })
  .trim()
  .min(
    2,
    "Industry must be at least 2 characters"
  )
  .max(
    100,
    "Industry cannot exceed 100 characters"
  )
  .regex(
    industryRegex,
    "Industry contains invalid characters"
  );

// ============================================================
// BUSINESS EMAIL
// ============================================================

const businessEmailField = z
  .string({
    message: "Business email is required",
  })
  .trim()
  .toLowerCase()
  .email("Invalid business email format")
  .max(
    254,
    "Business email cannot exceed 254 characters"
  );

// ============================================================
// WEBSITE
// ============================================================

const websiteField = z
  .string()
  .trim()
  .url("Invalid website URL format")
  .max(
    2048,
    "Website URL cannot exceed 2048 characters"
  )
  .refine(
    (value) => {
      try {
        const url = new URL(value);

        return (
          url.protocol === "http:" ||
          url.protocol === "https:"
        );
      } catch {
        return false;
      }
    },
    "Website must use HTTP or HTTPS"
  );

// ============================================================
// CREATE KYB VALIDATOR
// ============================================================

const createKybValidator = z
  .object(
    {
      // --------------------------------------------------------
      // BUSINESS NAME
      // --------------------------------------------------------



      kind: z
        .string({
          message: "Kind is required",
        }),

      businessName: businessNameField,

      // --------------------------------------------------------
      // LEGAL BUSINESS NAME
      // --------------------------------------------------------

      legalBusinessName:
        legalBusinessNameField,

      // --------------------------------------------------------
      // REGISTRATION NUMBER
      // --------------------------------------------------------

      registrationNumber:
        registrationNumberField,

      // --------------------------------------------------------
      // TAX ID
      // --------------------------------------------------------

      taxId: optionalString(
        taxIdField
      ),

      // --------------------------------------------------------
      // COMPANY TYPE
      // --------------------------------------------------------

      companyType:
        companyTypeField,

      // --------------------------------------------------------
      // INDUSTRY
      // --------------------------------------------------------

      industry: industryField,

      // --------------------------------------------------------
      // INCORPORATION DATE
      // --------------------------------------------------------

      incorporationDate:
        incorporationDateField,

      // --------------------------------------------------------
      // ADDRESS
      // --------------------------------------------------------

      address: addressSchema,

      // --------------------------------------------------------
      // BUSINESS EMAIL
      // --------------------------------------------------------

      businessEmail:
        businessEmailField,

      // --------------------------------------------------------
      // BUSINESS PHONE
      // --------------------------------------------------------

      businessPhone:
        phoneField.optional(),

      // --------------------------------------------------------
      // WEBSITE
      // --------------------------------------------------------

      website: z
        .preprocess(
          (value) => {
            if (
              typeof value === "string" &&
              value.trim() === ""
            ) {
              return undefined;
            }

            return value;
          },
          websiteField.optional()
        ),

      // --------------------------------------------------------
      // BENEFICIAL OWNERS
      // --------------------------------------------------------

      beneficialOwners: z
        .array(
          beneficialOwnerSchema,
          {
            message:
              "Beneficial owners must be an array",
          }
        )
        .max(
          50,
          "Cannot have more than 50 beneficial owners"
        )
        .optional(),
    },
    {
      message: "Invalid KYB information",
    }
  )
  .strict();

// ============================================================
// ALLOWED REJECTED FIELDS
// ============================================================

const ALLOWED_REJECTED_FIELDS = [
  "businessName",
  "legalBusinessName",
  "registrationNumber",
  "taxId",
  "companyType",
  "industry",
  "incorporationDate",

  "address.addressLine1",
  "address.addressLine2",
  "address.city",
  "address.state",
  "address.postalCode",
  "address.country",

  "businessEmail",
  "businessPhone",
  "website",

  "documents.incorporationCertificate",
  "documents.taxCertificate",
  "documents.addressProof",

  "beneficialOwners",

  'kind'
];

// ============================================================
// EDIT KYB VALIDATOR
// ============================================================

const editAddressSchema = z
  .object({
    addressLine1: z
      .string()
      .trim()
      .min(
        5,
        "Address line 1 must be at least 5 characters"
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

    city: locationField(
      "City is required",
      "Invalid city format"
    ).optional(),

    state: locationField(
      "State is required",
      "Invalid state format"
    ).optional(),

    postalCode: z
      .string()
      .trim()
      .min(
        2,
        "Postal code must be at least 2 characters"
      )
      .max(
        20,
        "Postal code cannot exceed 20 characters"
      )
      .regex(
        postalCodeRegex,
        "Invalid postal code format"
      )
      .optional(),

    country: locationField(
      "Country is required",
      "Invalid country format"
    ).optional(),
  })
  .strict();

const editKybValidator = z
  .object(
    {
      businessName:
        businessNameField.optional(),

      legalBusinessName:
        legalBusinessNameField.optional(),

      registrationNumber:
        registrationNumberField.optional(),

      taxId: optionalString(
        taxIdField
      ),

      companyType:
        companyTypeField.optional(),

      industry:
        industryField.optional(),

      incorporationDate:
        incorporationDateField.optional(),

      address:
        editAddressSchema.optional(),

      businessEmail:
        businessEmailField.optional(),

      businessPhone:
        phoneField.optional(),

      website: z.preprocess(
        (value) => {
          if (
            typeof value === "string" &&
            value.trim() === ""
          ) {
            return undefined;
          }

          return value;
        },
        websiteField.optional()
      ),

      beneficialOwners: z
        .array(
          beneficialOwnerSchema,
          {
            message:
              "Beneficial owners must be an array",
          }
        )
        .max(
          50,
          "Cannot have more than 50 beneficial owners"
        )
        .optional(),
    },
    {
      message: "Invalid KYB update data",
    }
  )
  .strict();

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createKybValidator,
  editKybValidator,
  ALLOWED_REJECTED_FIELDS,
};