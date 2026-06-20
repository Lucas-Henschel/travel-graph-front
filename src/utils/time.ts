/**
 * Formats a duration expressed in decimal hours as a human-friendly string.
 *
 * Rules:
 * - `< 1h` → `Xmin`             (e.g. `45min`)
 * - `>= 1h` whole hours → `Xh`  (e.g. `2h`)
 * - `>= 1h` with leftover → `Xh Ymin` (e.g. `1h 30min`)
 * - `0` or negative input    → `0min`
 *
 * The input is rounded to the nearest minute before formatting.
 */
export function formatHours(hoursDecimal: number): string {
  if (!Number.isFinite(hoursDecimal) || hoursDecimal <= 0) {
    return "0min";
  }

  const totalMinutes = Math.round(hoursDecimal * 60);

  if (totalMinutes < 60) {
    return `${totalMinutes}min`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
}
