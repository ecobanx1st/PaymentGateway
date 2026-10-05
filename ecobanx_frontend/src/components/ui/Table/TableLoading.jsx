"use client";

export default function TableLoading({
  columns = [],
  rows = 5,
  selectable = false,
  rowActions = false,
  minWidth = "100%",
  className = "",
}) {
  const totalColumns = columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0);
  const columnCount = Math.max(totalColumns, 1);

  return (
    <div
      className={`animate-pulse ${className}`}
      style={{ minWidth }}
      aria-hidden="true"
    >
      <table className="w-full border-separate border-spacing-0 text-left">
        <thead>
          <tr>
            {Array.from({ length: columnCount }).map((_, index) => (
              <th key={index} className="px-4 pb-4 sm:px-6">
                <div className="h-3 w-24 max-w-full rounded-full bg-secondary-bg" />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columnCount }).map((__, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border-t border-input-border px-4 py-4 align-middle sm:px-6"
                >
                  <div
                    className={`h-4 rounded-full bg-secondary-bg/90 ${
                      cellIndex === 0
                        ? "w-28"
                        : cellIndex % 3 === 0
                          ? "w-20"
                          : cellIndex % 2 === 0
                            ? "w-32"
                            : "w-full"
                    }`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
