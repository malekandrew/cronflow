import { describe, it, expect } from 'vitest';
import { CronExplanationGenerator } from './CronExplanationGenerator.js';
import { CronParser } from './CronParser.js';

describe('CronExplanationGenerator', () => {
	it('should generate correct explanation for every 5 minutes', () => {
		const parsed = CronParser.parse('*/5 * * * *');
		const result = CronExplanationGenerator.generateExplanation(parsed);
		
		expect(result).toContain('every 5 minute');
	});

	it('should generate correct explanation for weekdays at 9am', () => {
		const parsed = CronParser.parse('0 9 * * 1-5');
		const result = CronExplanationGenerator.generateExplanation(parsed);
		
		expect(result).toContain('9:00 AM');
		expect(result).toContain('Monday to Friday');
	});

	it('should format hour with AM/PM notation', () => {
		const hourField = { type: 'value', value: 14 };
		const result = CronExplanationGenerator.formatHour(hourField);
		
		expect(result).toBe('2:00 PM');
	});

	it('should format month names correctly', () => {
		const monthField = { type: 'value', value: 1 };
		const result = CronExplanationGenerator.formatMonth(monthField);
		
		expect(result).toBe('January');
	});

	it('should format weekday names correctly', () => {
		const weekdayField = { type: 'value', value: 1 };
		const result = CronExplanationGenerator.formatWeekday(weekdayField);
		
		expect(result).toBe('Monday');
	});

	it('should handle Sunday as both 0 and 7', () => {
		const weekdayField = { type: 'value', value: 7 };
		const result = CronExplanationGenerator.formatWeekday(weekdayField);
		
		expect(result).toBe('Sunday');
	});
});