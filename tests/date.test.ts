import { formatDateYYYYMMDD, isYYYYMMDD, parseYYYYMMDD, formatDateToISO } from '../src/utils/date';

describe('Date Utils', () => {
  describe('formatDateYYYYMMDD', () => {
    it('should format current date correctly', () => {
      const result = formatDateYYYYMMDD();
      expect(result).toMatch(/^\d{8}$/);
      expect(result.length).toBe(8);
    });

    it('should format specific date correctly', () => {
      const date = new Date('2025-08-13T00:00:00');
      const result = formatDateYYYYMMDD(date);
      expect(result).toBe('20250813');
    });

    it('should format date string correctly', () => {
      const result = formatDateYYYYMMDD('2025-08-13T00:00:00');
      expect(result).toBe('20250813');
    });
  });

  describe('isYYYYMMDD', () => {
    it('should return true for valid YYYYMMDD format', () => {
      expect(isYYYYMMDD('20250813')).toBe(true);
      expect(isYYYYMMDD('20250101')).toBe(true);
      expect(isYYYYMMDD('20251231')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isYYYYMMDD('2025-08-13')).toBe(false);
      expect(isYYYYMMDD('2025/08/13')).toBe(false);
      expect(isYYYYMMDD('2025081')).toBe(false);
      expect(isYYYYMMDD('202508130')).toBe(false);
      expect(isYYYYMMDD('abc')).toBe(false);
      expect(isYYYYMMDD('')).toBe(false);
    });
  });

  describe('parseYYYYMMDD', () => {
    it('should parse valid YYYYMMDD string', () => {
      const result = parseYYYYMMDD('20250813');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(7); // August is month 7 (0-based)
      expect(result.getDate()).toBe(13);
    });

    it('should throw error for invalid format', () => {
      expect(() => parseYYYYMMDD('2025-08-13')).toThrow();
      expect(() => parseYYYYMMDD('invalid')).toThrow();
    });
  });

  describe('formatDateToISO', () => {
    it('should convert YYYYMMDD to ISO string', () => {
      const result = formatDateToISO('20250813');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should return original string if not YYYYMMDD', () => {
      const result = formatDateToISO('2025-08-13T10:00:00Z');
      expect(result).toBe('2025-08-13T10:00:00Z');
    });
  });
});
