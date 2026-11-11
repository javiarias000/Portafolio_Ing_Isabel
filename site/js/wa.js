export const WA_NUMBER = '593987738663';
export const waLink = (message = '') => `https://wa.me/${WA_NUMBER}${message ? '?text=' + encodeURIComponent(message) : ''}`;

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
/** "2026-05-19T10:00:17+0000" -> "19 may 2026" (zona Ecuador, UTC-5) */
export function fechaCorta(iso) {
  const d = new Date(iso.replace(/([+-]\d\d)(\d\d)$/, '$1:$2'));
  const e = new Date(d.getTime() - 5 * 3600e3);
  return `${e.getUTCDate()} ${MESES[e.getUTCMonth()]} ${e.getUTCFullYear()}`;
}
