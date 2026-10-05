const MIN_AGE = 18;

function parseDateOnly(value) {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value).trim());

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const timestamp = Date.UTC(year, month - 1, day);

  if (Number.isNaN(timestamp)) {
    return null;
  }

  const roundTrip = new Date(timestamp);

  if (
    roundTrip.getUTCFullYear() !== year ||
    roundTrip.getUTCMonth() !== month - 1 ||
    roundTrip.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

function isAtLeast18YearsOld(value) {
  const dob = parseDateOnly(value);

  if (!dob) {
    return true;
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();

  let age = currentYear - dob.year;

  if (dob.month > currentMonth || (dob.month === currentMonth && dob.day > currentDay)) {
    age -= 1;
  }

  return age >= MIN_AGE;
}

module.exports = { isAtLeast18YearsOld };
