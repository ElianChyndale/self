import { describe, expect, it } from 'vitest';
import {
  inferChinaByCoordinates,
  normalizeSystemLanguage,
  resolveActiveLanguage,
  resolveLanguagePreference,
} from '../miniprogram/utils/language';

describe('language preference resolution', () => {
  it('normalizes language preference and system language inputs', () => {
    expect(resolveLanguagePreference('zh-CN')).toBe('zh-CN');
    expect(resolveLanguagePreference('en')).toBe('en');
    expect(resolveLanguagePreference('fr')).toBe('auto');

    expect(normalizeSystemLanguage('zh_CN')).toBe('zh-CN');
    expect(normalizeSystemLanguage('zh-Hans')).toBe('zh-CN');
    expect(normalizeSystemLanguage('en_US')).toBe('en');
  });

  it('resolves the active language from explicit preference or auto-detection', () => {
    expect(resolveActiveLanguage('en', 'zh-CN', 'zh-CN')).toBe('en');
    expect(resolveActiveLanguage('zh-CN', 'en', 'en')).toBe('zh-CN');
    expect(resolveActiveLanguage('auto', 'en', 'zh-CN')).toBe('zh-CN');
    expect(resolveActiveLanguage('auto', 'zh-CN', null)).toBe('zh-CN');
    expect(resolveActiveLanguage('auto', 'en', null)).toBe('en');
  });
});

describe('China region heuristic', () => {
  it('treats mainland coordinates as China and outside coordinates as non-China', () => {
    expect(inferChinaByCoordinates(39.9042, 116.4074)).toBe('zh-CN');
    expect(inferChinaByCoordinates(22.3193, 114.1694)).toBe('zh-CN');
    expect(inferChinaByCoordinates(37.7749, -122.4194)).toBe('en');
    expect(inferChinaByCoordinates(null, 116.4074)).toBeNull();
  });
});
