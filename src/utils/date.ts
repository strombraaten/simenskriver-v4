/**
 * Formats a date as YYYY-MM-DD, the single display format for dates on the site.
 *
 * Frontmatter dates like `2022-12-01` are parsed as UTC midnight, so those use
 * the UTC calendar date. Dates with an explicit time use the local date, which
 * keeps them from shifting a day depending on the build machine's timezone.
 */
export function formatIsoDate(input: Date | string): string {
  const date = new Date(input);
  const isUtcMidnight =
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0;

  if (isUtcMidnight) return date.toISOString().slice(0, 10);

  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
