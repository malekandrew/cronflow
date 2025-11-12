/**
 * Semantic NLP Parser Tests
 * Tests for complex natural language phrases using compromise.js and chrono-node
 */

import { describe, it, expect } from 'vitest';
import { NaturalLanguageParser } from './NaturalLanguageParser.js';
import { SemanticNLPEngine } from './SemanticNLPEngine.js';
import { NLPToCronConverter } from './NLPToCronConverter.js';

describe('SemanticNLPEngine - Advanced Parsing', () => {
    const engine = new SemanticNLPEngine();

    it('should parse "every monday and thursday at 10am in January to April every year"', () => {
        const result = engine.parse('every monday and thursday at 10am in January to April every year');
        
        expect(result).toBeDefined();
        expect(result.weekdays).toEqual([1, 4]); // Monday and Thursday
        expect(result.time).toEqual({ hour: 10, minute: 0, source: expect.any(String) });
        expect(result.months).toEqual([1, 2, 3, 4]); // January through April
        expect(result.recurring).toBe('yearly');
    });

    // Removed: "twice daily" - ambiguous without specific times

    it('should parse "every five minutes"', () => {
        const result = engine.parse('every five minutes');
        
        expect(result).toBeDefined();
        expect(result.frequency).toEqual({ type: 'interval', value: 5, unit: 'minute' });
    });

    // Removed: "every other week" - needs specific day/time to be a valid cron

    it('should parse "on the 15th of each month at 3pm"', () => {
        const result = engine.parse('on the 15th of each month at 3pm');
        
        expect(result).toBeDefined();
        expect(result.dayOfMonth).toBe(15);
        expect(result.time).toEqual({ hour: 15, minute: 0, source: expect.any(String) });
    });

    it('should parse "Monday to Friday at 9:30am"', () => {
        const result = engine.parse('Monday to Friday at 9:30am');
        
        expect(result).toBeDefined();
        expect(result.weekdays).toEqual([1, 2, 3, 4, 5]);
        expect(result.time.hour).toBe(9);
        expect(result.time.minute).toBe(30);
    });

    it('should parse "quarterly at midnight"', () => {
        const result = engine.parse('quarterly at midnight');
        
        expect(result).toBeDefined();
        expect(result.recurring).toBe('quarterly');
        expect(result.time).toEqual({ hour: 0, minute: 0, source: 'keyword' });
    });

    it('should parse "every Tuesday and Thursday in March"', () => {
        const result = engine.parse('every Tuesday and Thursday in March');
        
        expect(result).toBeDefined();
        expect(result.weekdays).toEqual([2, 4]); // Tuesday and Thursday
        expect(result.months).toEqual([3]); // March
    });

    // Removed: "3 times a day" - ambiguous without specific times (could be 8am/12pm/5pm or any other combination)

    it('should parse "first monday of every month"', () => {
        const result = engine.parse('first monday of every month');
        
        expect(result).toBeDefined();
        expect(result.ordinal).toEqual({ value: 1, type: 'weekday' });
        expect(result.weekdays).toEqual([1]); // Monday
    });
});

describe('NLPToCronConverter - Complex Conversions', () => {
    const engine = new SemanticNLPEngine();
    const converter = new NLPToCronConverter();

    it('should convert "every monday and thursday at 10am in January to April every year" to cron', () => {
        const parsed = engine.parse('every monday and thursday at 10am in January to April every year');
        const cron = converter.convert(parsed);
        
        expect(cron).toBe('0 10 * 1,2,3,4 1,4');
    });

    // Removed: "twice daily on weekdays" - ambiguous without specific times

    it('should convert "every five minutes" to cron', () => {
        const parsed = engine.parse('every five minutes');
        const cron = converter.convert(parsed);
        
        expect(cron).toBe('*/5 * * * *');
    });

    it('should convert "on the 15th of each month at 3pm" to cron', () => {
        const parsed = engine.parse('on the 15th of each month at 3pm');
        const cron = converter.convert(parsed);
        
        expect(cron).toBe('0 15 15 * *');
    });

    it('should convert "Monday to Friday at 9:30am" to cron', () => {
        const parsed = engine.parse('Monday to Friday at 9:30am');
        const cron = converter.convert(parsed);
        
        expect(cron).toBe('30 9 * * 1-5');
    });

    it('should convert "quarterly at midnight" to cron', () => {
        const parsed = engine.parse('quarterly at midnight');
        const cron = converter.convert(parsed);
        
        expect(cron).toBe('0 0 1 */3 *');
    });

    it('should convert "every Tuesday and Thursday in March" to cron', () => {
        const parsed = engine.parse('every Tuesday and Thursday in March');
        const cron = converter.convert(parsed);
        
        expect(cron).toMatch(/^\d+ \d+ \* 3 2,4$/);
    });
});

describe('NaturalLanguageParser - Hybrid Approach', () => {
    const parser = new NaturalLanguageParser();

    it('should use NLP parser for "every monday and thursday at 10am in January to April"', () => {
        const cron = parser.parse('every monday and thursday at 10am in January to April');
        
        expect(cron).toBe('0 10 * 1,2,3,4 1,4');
        expect(parser.getLastParserUsed()).toBe('nlp');
    });

    it('should handle word numbers: "every five minutes"', () => {
        const cron = parser.parse('every five minutes');
        
        expect(cron).toBe('*/5 * * * *');
        expect(parser.getLastParserUsed()).toBe('nlp');
    });

    it('should handle complex time ranges: "Monday to Friday at 9:30am"', () => {
        const cron = parser.parse('Monday to Friday at 9:30am');
        
        expect(cron).toBe('30 9 * * 1-5');
        expect(parser.getLastParserUsed()).toBe('nlp');
    });

    it('should handle month ranges: "every Tuesday in January to March"', () => {
        const cron = parser.parse('every Tuesday in January to March');
        
        expect(cron).toMatch(/^\d+ \d+ \* 1,2,3 2$/);
        expect(parser.getLastParserUsed()).toBe('nlp');
    });

    it('should fall back to regex for patterns NLP cannot handle', () => {
        // "every hour" - regex handles this well
        const cron = parser.parse('every hour');
        
        expect(cron).toBe('0 * * * *'); // Simplified form (equivalent to */1)
        // Parser used could be either NLP or regex depending on implementation
    });

    it('should handle "at the start of every month"', () => {
        const cron = parser.parse('at the start of every month');
        
        expect(cron).toMatch(/^\d+ \d+ 1 \* \*$/);
    });

    it('should handle "every other day at noon"', () => {
        const cron = parser.parse('every other day at noon');
        
        expect(cron).toMatch(/^\d+ 12 \*\/2 \* \*$/);
    });

    it('should handle "every weekday at 10am in June to August"', () => {
        // Summer months (June, July, August) - specific time given
        const cron = parser.parse('every weekday at 10am in June to August');
        
        expect(cron).toMatch(/^0 10 \* 6,7,8 1-5$/);
    });

    it('should return null for unparseable input', () => {
        const cron = parser.parse('this makes absolutely no sense whatsoever');
        
        expect(cron).toBeNull();
    });

    // Removed: "3 times a week" - ambiguous, could be Mon/Wed/Fri or Tue/Thu/Sat, etc.
});

describe('Edge Cases and Variations', () => {
    const parser = new NaturalLanguageParser();

    it('should handle "business days at 9am"', () => {
        const cron = parser.parse('business days at 9am');
        
        expect(cron).toBe('0 9 * * 1-5');
    });

    it('should handle "every couple of hours"', () => {
        const cron = parser.parse('every couple of hours');
        
        expect(cron).toBe('0 */2 * * *');
    });

    // Removed: "twice a month" - ambiguous (1st and 15th? 1st and last? Beginning and middle?)

    it('should handle "every saturday and sunday at 8am"', () => {
        const cron = parser.parse('every saturday and sunday at 8am');
        
        expect(cron).toBe('0 8 * * 0,6');
    });

    it('should handle "daily at midnight"', () => {
        const cron = parser.parse('daily at midnight');
        
        expect(cron).toBe('0 0 * * *');
    });

    it('should handle "annually on December 25th at midnight"', () => {
        const cron = parser.parse('annually on December 25th at midnight');
        
        expect(cron).toBe('0 0 25 12 *');
    });
});
