import { describe, it, expect } from 'vitest';
import { CronScheduler } from './CronScheduler.js';
import { CronParser } from './CronParser.js';

describe('CronScheduler', () => {
	it('should generate next executions correctly', () => {
		const parsed = CronParser.parse('*/5 * * * *');
		const executions = CronScheduler.generateNextExecutions(parsed);
		
		expect(executions).toBeDefined();
		expect(Array.isArray(executions)).toBe(true);
		expect(executions.length).toBeGreaterThan(0);
		expect(executions.length).toBeLessThanOrEqual(5);
		
		// Check that executions are Date objects
		executions.forEach(exec => {
			expect(exec instanceof Date).toBe(true);
		});
		
		// Check that executions are in the future
		const now = new Date();
		executions.forEach(exec => {
			expect(exec.getTime()).toBeGreaterThan(now.getTime());
		});
	});

	it('should match cron patterns correctly', () => {
		const parsed = CronParser.parse('30 14 * * 1,5');
		
		// Create a date matching the pattern (Monday at 14:30)
		const testDate = new Date();
		testDate.setHours(14, 30, 0, 0);
		// Find next Monday
		while (testDate.getDay() !== 1) {
			testDate.setDate(testDate.getDate() + 1);
		}
		
		const matches = CronScheduler.matchesCron(testDate, parsed);
		expect(matches).toBe(true);
	});

	it('should format relative time correctly', () => {
		const futureDate = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
		const relativeTime = CronScheduler.getRelativeTime(futureDate);
		
		expect(relativeTime).toContain('5 minute');
	});
});