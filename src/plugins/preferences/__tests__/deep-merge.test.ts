/**
 * Deep Merge Utility Tests
 *
 * Unit tests for the deep merge function used by the preferences plugin.
 */

import { describe, it, expect } from 'vitest';
import { deepMerge } from '../stores/postgres-store.js';

describe('deepMerge', () => {
  describe('basic merging', () => {
    it('should merge flat objects', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 1, b: 2 });
    });

    it('should not mutate original objects', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      deepMerge(target, source);
      expect(target).toEqual({ a: 1 });
      expect(source).toEqual({ b: 2 });
    });

    it('should return a new object', () => {
      const target = { a: 1 };
      const source = { b: 2 };
      const result = deepMerge(target, source);
      expect(result).not.toBe(target);
      expect(result).not.toBe(source);
    });
  });

  describe('nested object merging', () => {
    it('should merge nested objects recursively', () => {
      const target = { a: { x: 1 } };
      const source = { a: { y: 2 } };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: { x: 1, y: 2 } });
    });

    it('should handle deeply nested objects', () => {
      const target = { a: { b: { c: { x: 1 } } } };
      const source = { a: { b: { c: { y: 2 } } } };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: { b: { c: { x: 1, y: 2 } } } });
    });

    it('should merge multiple nested keys', () => {
      const target = {
        theme: 'light',
        notifications: { email: true, push: true },
      };
      const source = {
        notifications: { email: false },
      };
      const result = deepMerge(target, source);
      expect(result).toEqual({
        theme: 'light',
        notifications: { email: false, push: true },
      });
    });
  });

  describe('value overwriting', () => {
    it('should let source override target for same keys', () => {
      const target = { a: 1 };
      const source = { a: 2 };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 2 });
    });

    it('should let source override target for nested keys', () => {
      const target = { a: { x: 1 } };
      const source = { a: { x: 2 } };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: { x: 2 } });
    });
  });

  describe('array handling', () => {
    it('should replace arrays (not merge)', () => {
      const target = { a: [1, 2] };
      const source = { a: [3, 4, 5] };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: [3, 4, 5] });
    });

    it('should replace array with empty array', () => {
      const target = { a: [1, 2, 3] };
      const source = { a: [] };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: [] });
    });

    it('should replace non-array with array', () => {
      const target = { a: 'string' };
      const source = { a: [1, 2] };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: [1, 2] });
    });

    it('should replace array with non-array', () => {
      const target = { a: [1, 2] };
      const source = { a: 'string' };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 'string' });
    });
  });

  describe('special values', () => {
    it('should handle null values in source', () => {
      const target = { a: 1 };
      const source = { a: null };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: null });
    });

    it('should skip undefined values in source', () => {
      const target = { a: 1 };
      const source = { a: undefined };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 1 });
    });

    it('should handle null in target', () => {
      const target = { a: null };
      const source = { a: { x: 1 } };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: { x: 1 } });
    });

    it('should replace object with null', () => {
      const target = { a: { x: 1 } };
      const source = { a: null };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: null });
    });
  });

  describe('edge cases', () => {
    it('should handle empty target', () => {
      const target = {};
      const source = { a: 1 };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 1 });
    });

    it('should handle empty source', () => {
      const target = { a: 1 };
      const source = {};
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 1 });
    });

    it('should handle both empty', () => {
      const target = {};
      const source = {};
      const result = deepMerge(target, source);
      expect(result).toEqual({});
    });

    it('should handle primitive values becoming objects', () => {
      const target = { a: 'string' };
      const source = { a: { x: 1 } };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: { x: 1 } });
    });

    it('should handle objects becoming primitive values', () => {
      const target = { a: { x: 1 } };
      const source = { a: 'string' };
      const result = deepMerge(target, source);
      expect(result).toEqual({ a: 'string' });
    });
  });

  describe('real-world preference scenarios', () => {
    it('should merge default preferences with user preferences', () => {
      const defaults = {
        theme: 'system',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        trading: {
          defaultSymbol: 'SPY',
          chartInterval: '5min',
        },
      };

      const userPrefs = {
        theme: 'dark',
        notifications: {
          email: false,
        },
      };

      const result = deepMerge(defaults, userPrefs);
      expect(result).toEqual({
        theme: 'dark',
        notifications: {
          email: false,
          push: true,
          sms: false,
        },
        trading: {
          defaultSymbol: 'SPY',
          chartInterval: '5min',
        },
      });
    });

    it('should handle partial updates to preferences', () => {
      const existing = {
        theme: 'dark',
        notifications: {
          email: false,
          push: true,
        },
      };

      const update = {
        notifications: {
          push: false,
        },
      };

      const result = deepMerge(existing, update);
      expect(result).toEqual({
        theme: 'dark',
        notifications: {
          email: false,
          push: false,
        },
      });
    });
  });
});
