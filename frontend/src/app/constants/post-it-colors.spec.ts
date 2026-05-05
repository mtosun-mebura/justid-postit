import { describe, expect, it } from 'vitest';
import {
  DEFAULT_POST_IT_COLOR,
  normalizePostItColorHex,
  samePostItColorHex,
} from './post-it-colors';

describe('post-it-colors', () => {
  describe('normalizePostItColorHex', () => {
    it('gebruikt standaardkleur bij null, undefined of lege string', () => {
      expect(normalizePostItColorHex(null)).toBe(DEFAULT_POST_IT_COLOR);
      expect(normalizePostItColorHex(undefined)).toBe(DEFAULT_POST_IT_COLOR);
      expect(normalizePostItColorHex('')).toBe(DEFAULT_POST_IT_COLOR);
      expect(normalizePostItColorHex('   ')).toBe(DEFAULT_POST_IT_COLOR);
    });

    it('zet bekende paletkleuren naar canonieke waarde (exacte mat-option)', () => {
      expect(normalizePostItColorHex('#c8e6c9')).toBe('#C8E6C9');
      expect(normalizePostItColorHex('#FFF59D')).toBe('#FFF59D');
    });

    it('zet andere geldige #RRGGBB naar hoofdletters', () => {
      expect(normalizePostItColorHex('#aabbcc')).toBe('#AABBCC');
    });

    it('valt terug op standaard bij ongeldige hex', () => {
      expect(normalizePostItColorHex('#GGG')).toBe(DEFAULT_POST_IT_COLOR);
      expect(normalizePostItColorHex('rood')).toBe(DEFAULT_POST_IT_COLOR);
    });
  });

  describe('samePostItColorHex', () => {
    it('behandelt verschillende hoofdletters als gelijk', () => {
      expect(samePostItColorHex('#BBDEFB', '#bbdefb')).toBe(true);
    });

    it('onderscheidt verschillende kleuren', () => {
      expect(samePostItColorHex('#BBDEFB', '#C8E6C9')).toBe(false);
    });
  });
});
