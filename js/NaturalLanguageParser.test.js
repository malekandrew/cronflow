import { describe, it, expect } from 'vitest';
import { NaturalLanguageParser } from './NaturalLanguageParser.js';

describe('NaturalLanguageParser', () => {
	it('should parse "every 5 minutes"', () => {
		const parser = new NaturalLanguageParser();
		const result = parser.parse('every 5 minutes');
		expect(result).toBe('*/5 * * * *');
	});

	it('should parse "daily at 3pm"', () => {
		const parser = new NaturalLanguageParser();
		const result = parser.parse('daily at 3pm');
		expect(result).toBe('0 15 * * *');
	});

	it('should parse "weekdays at 9am"', () => {
		const parser = new NaturalLanguageParser();
		const result = parser.parse('weekdays at 9am');
		expect(result).toBe('0 9 * * 1-5');
	});

	it('should parse "every Monday" with default time', () => {
		const parser = new NaturalLanguageParser();
		const result = parser.parse('every Monday');
		expect(result).toBe('0 0 * * 1'); // Defaults to midnight
	});

	it('should parse "every Monday at 9am"', () => {
		const parser = new NaturalLanguageParser();
		const result = parser.parse('every Monday at 9am');
		expect(result).toBe('0 9 * * 1');
	});

	it('should parse "once a month"', () => {
		const parser = new NaturalLanguageParser();
		const result = parser.parse('once a month');
		expect(result).toBe('0 0 1 * *');
	});

	it('should parse "quarterly"', () => {
		const parser = new NaturalLanguageParser();
		const result = parser.parse('quarterly');
		// Note: Parser returns */3 for months (every 3 months starting from current)
		// rather than explicit list of quarters
		expect(result).toBe('0 0 1 */3 *');
	});

	it('should parse "every Monday and Friday at 2:30pm"', () => {
		const parser = new NaturalLanguageParser();
		const result = parser.parse('every Monday and Friday at 2:30pm');
		expect(result).toBe('30 14 * * 1,5');
	});

	it('should return null for unparseable input', () => {
		const parser = new NaturalLanguageParser();
		const result = parser.parse('gibberish that makes no sense');
		expect(result).toBeNull();
	});

	it('should parse time correctly', () => {
		const parser = new NaturalLanguageParser();
		const time = parser.parseTime('at 3pm');
		expect(time).toEqual({ hour: 15, minute: 0 });
	});

	it('should parse weekdays correctly', () => {
		const parser = new NaturalLanguageParser();
		const days = parser.parseWeekdays('Monday and Friday');
		expect(days).toEqual([1, 5]);
	});
});