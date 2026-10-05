const { z } = require("zod");

const customErrorMap = (issue) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.input === undefined) {
      const requiredError = issue.inst?.def?.required_error;
      if (requiredError) return { message: requiredError };
    } else {
      const invalidTypeError = issue.inst?.def?.invalid_type_error;
      if (invalidTypeError) return { message: invalidTypeError };
    }
  }
  return { message: issue.message };
};

z.setErrorMap(customErrorMap);
