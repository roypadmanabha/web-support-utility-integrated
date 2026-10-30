/**
 * Clarivate EndNote Serial Number & Product Key Utilities
 *
 * Domain Rules:
 * 1. A Serial Number is always a 10-digit numeric number of EndNote.
 * 2. 4th and 5th digits designate the EndNote Version:
 *    - XXX17XXXXX: EndNote X7
 *    - XXX18XXXXX: EndNote X8
 *    - XXX19XXXXX: EndNote X9
 *    - XXX20XXXXX: EndNote 20
 *    - XXX21XXXXX: EndNote 21
 *    - XXX22XXXXX: EndNote 2025
 * 3. A Product Key is always a 25-digit alphanumeric key (e.g. XXXXX-XXXXX-XXXXX-XXXXX-XXXXX).
 */

export const getEndNoteVersionFromSN = (sn) => {
  if (!sn || typeof sn !== 'string') return 'EndNote';
  const clean = sn.replace(/[^0-9]/g, '');
  if (clean.length < 5) return 'EndNote';

  const code = clean.substring(3, 5); // 4th and 5th digits (index 3 and 4)
  switch (code) {
    case '17':
      return 'EndNote X7';
    case '18':
      return 'EndNote X8';
    case '19':
      return 'EndNote X9';
    case '20':
      return 'EndNote 20';
    case '21':
      return 'EndNote 21';
    case '22':
      return 'EndNote 2025';
    default:
      return 'EndNote';
  }
};

/**
 * Validates whether a serial number is strictly a 10-digit numeric value.
 */
export const isValidSerialNumber = (sn) => {
  if (!sn || typeof sn !== 'string') return false;
  return /^\d{10}$/.test(sn.trim());
};

/**
 * Validates whether a product key is strictly a 25-digit alphanumeric key.
 */
export const isValidProductKey = (key) => {
  if (!key || typeof key !== 'string') return false;
  const clean = key.replace(/[^A-Za-z0-9]/g, '');
  return clean.length === 25;
};

/**
 * Generates a strictly 25-digit alphanumeric product key (5 blocks of 5 characters).
 */
export const generate25DigitProductKey = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const block = () => Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${block()}-${block()}-${block()}-${block()}-${block()}`;
};

/**
 * Generates a realistic 10-digit numeric serial number conforming to EndNote version codes:
 * - 17: EndNote X7
 * - 18: EndNote X8
 * - 19: EndNote X9
 * - 20: EndNote 20
 * - 21: EndNote 21
 * - 22: EndNote 2025
 */
export const generateSerialForVersion = (versionStr = '22') => {
  const v = String(versionStr).toLowerCase().trim();
  let code = '22'; // default to EndNote 2025
  if (v.includes('x7') || v === '17') code = '17';
  else if (v.includes('x8') || v === '18') code = '18';
  else if (v.includes('x9') || v === '19') code = '19';
  else if (v.includes('2025') || v === '22') code = '22';
  else if (v.includes('21') || v === '21') code = '21';
  else if (v.includes('20') || v === '20') code = '20';

  const prefix = '310'; // 3 digits prefix
  const suffix = Math.floor(10000 + Math.random() * 90000); // 5 digits suffix
  return `${prefix}${code}${suffix}`; // 10 digits total
};
