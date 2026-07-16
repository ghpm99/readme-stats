import { describe, expect, it } from 'vitest';
import { clampValue, encodeHTML, kFormatter, parseBoolean, parseList, parseNumber, renderError } from '../src/utils';

describe('kFormatter', () => {
  it('keeps numbers below 1000 as-is', () => {
    expect(kFormatter(0)).toBe('0');
    expect(kFormatter(999)).toBe('999');
  });

  it('formats thousands with one decimal and k suffix', () => {
    expect(kFormatter(1000)).toBe('1.0k');
    expect(kFormatter(12345)).toBe('12.3k');
  });
});

describe('encodeHTML', () => {
  it('escapes markup characters', () => {
    expect(encodeHTML('<script>"a" & \'b\'</script>')).not.toMatch(/[<>"']/);
  });
});

describe('clampValue', () => {
  it('clamps to the given range', () => {
    expect(clampValue(5, 0, 10)).toBe(5);
    expect(clampValue(-5, 0, 10)).toBe(0);
    expect(clampValue(15, 0, 10)).toBe(10);
  });
});

describe('query parsing', () => {
  it('parses booleans strictly', () => {
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('false')).toBe(false);
    expect(parseBoolean(undefined)).toBe(false);
    expect(parseBoolean(['true'])).toBe(true);
  });

  it('parses numbers with fallback', () => {
    expect(parseNumber('27', 25)).toBe(27);
    expect(parseNumber('abc', 25)).toBe(25);
    expect(parseNumber(undefined, 25)).toBe(25);
  });

  it('parses comma separated lists as lowercase', () => {
    expect(parseList('Java, HTML ,css')).toEqual(['java', 'html', 'css']);
    expect(parseList(undefined)).toEqual([]);
  });
});

describe('renderError', () => {
  it('renders an svg with the escaped message', () => {
    const svg = renderError('user "x" <not> found');
    expect(svg).toContain('<svg');
    expect(svg).toContain('Something went wrong!');
    expect(svg).not.toContain('<not>');
  });
});
