export function formatUSAmount(amount) {
  const num = Number(amount);

//   if (!Number.isFinite(num)) return "-";

  const units = [
    { value: 1e12, label: "Trillion" },
    { value: 1e9, label: "Billion" },
    { value: 1e6, label: "Million" },
    { value: 1e3, label: "Thousand" },
  ];

  for (const unit of units) {
    if (Math.abs(num) >= unit.value) {
      const value = num / unit.value;

      return `${parseFloat(value.toFixed(2))} ${unit.label}`;
    }
  }

  return num.toString();
}
