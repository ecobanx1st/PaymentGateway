export const getAccountBaseRoute = () => {
  if (typeof window === "undefined") {
    return null;
  }
  const accountType = localStorage.getItem("accountType");

  if (!accountType) {
    return null;
  }

  return accountType === "business"
    ? "/merchant"
    : "/users";
};
