export const BASIC_EMAIL_PATTERN =
  /^[^\s@.](?:[^\s@]*[^\s@.])?@[^\s@.](?:[^\s@]*[^\s@.])?(?:\.[^\s@.]{2,})+$/i;

export function isValidEmail(value) {
  return BASIC_EMAIL_PATTERN.test(String(value || "").trim());
}
