import { describe, it, expect } from 'vitest';
import { CronParser } from './CronParser.js';

describe('CronParser', () => {
    it('should parse a valid cron expression', () => {
        const result = CronParser.parse('*/5 * * * *');
        expect(result).toBeDefined();
        expect(result.minute.type).toBe('step');
        expect(result.minute.step).toBe(5);
        expect(result.hour.type).toBe('any');
        expect(result.day.type).toBe('any');
        expect(result.month.type).toBe('any');
        expect(result.weekday.type).toBe('any');
    });

    it('should throw an error for an invalid cron expression', () => {
        expect(() => CronParser.parse('invalid')).toThrow();
    });

    it('should parse cron with specific values', () => {
        const result = CronParser.parse('30 14 * * 1,5');
        expect(result.minute.type).toBe('value');
        expect(result.minute.value).toBe(30);
        expect(result.hour.type).toBe('value');
        expect(result.hour.value).toBe(14);
        expect(result.weekday.type).toBe('list');
        expect(result.weekday.values).toEqual([1, 5]);
    });

    it('should parse cron with ranges', () => {
        const result = CronParser.parse('0 9 * * 1-5');
        expect(result.weekday.type).toBe('range');
        expect(result.weekday.min).toBe(1);
        expect(result.weekday.max).toBe(5);
    });
});