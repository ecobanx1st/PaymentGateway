import { defaultCountries } from "react-international-phone";

export const COUNTRY_OPTIONS = defaultCountries.map(([label, value, dialCode]) => ({
  label,
  value,
  dialCode: `+${dialCode}`,
}));

export const INDIA = COUNTRY_OPTIONS.find((country) => country.value === "in");
