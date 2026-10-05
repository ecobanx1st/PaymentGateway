export function getPriorityTone(priority) {
  switch (priority) {
    case "High":
      return "border-danger/20 bg-danger/10 text-danger";
    case "Medium":
      return "border-warning/20 bg-warning/10 text-warning";
    case "Low":
      return "border-success/20 bg-success/10 text-success";
    default:
      return "border-border bg-secondary-bg text-secondary-text";
  }
}

export function getStatusTone(status) {
  switch (status) {
    case "Resolved":
      return "border-success/20 bg-success/10 text-success";
    case "In progress":
      return "border-info/20 bg-info/10 text-info";
    case "Open":
      return "border-warning/20 bg-warning/10 text-warning";
    case "Closed":
      return "border-border bg-secondary-bg text-secondary-text";
    case "Blocked":
      return "border-danger/20 bg-danger/10 text-danger";
    default:
      return "border-border bg-secondary-bg text-secondary-text";
  }
}

export function formatLabel(value) {
  return String(value || "")
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}

export function getConversationDisplayTime(value) {
  return value || "Now";
}

export function formatTicketDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (left, right) =>
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate();

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (sameDay(date, today)) return `Today, ${time}`;
  if (sameDay(date, yesterday)) return `Yesterday, ${time}`;

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getTicketInitials(title) {
  const words = String(title || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "SP";

  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function getShortTicketId(id) {
  const value = String(id || "");

  if (value.length <= 10) return value;

  return value.slice(-8).toUpperCase();
}
