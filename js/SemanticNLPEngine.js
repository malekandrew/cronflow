/**
 * SemanticNLPEngine - Advanced natural language understanding using compromise.js and chrono-node
 * Handles complex scheduling phrases like "every monday and thursday at 10am in January to April every year"
 */

import nlp from 'compromise';
import * as chrono from 'chrono-node';

export class SemanticNLPEngine {
    constructor() {
        this.wordToNumber = this.initializeWordToNumber();
        this.weekdayMap = {
            'sunday': 0, 'sun': 0,
            'monday': 1, 'mon': 1,
            'tuesday': 2, 'tue': 2, 'tues': 2,
            'wednesday': 3, 'wed': 3,
            'thursday': 4, 'thu': 4, 'thur': 4, 'thurs': 4,
            'friday': 5, 'fri': 5,
            'saturday': 6, 'sat': 6
        };
        this.monthMap = {
            'january': 1, 'jan': 1,
            'february': 2, 'feb': 2,
            'march': 3, 'mar': 3,
            'april': 4, 'apr': 4,
            'may': 5,
            'june': 6, 'jun': 6,
            'july': 7, 'jul': 7,
            'august': 8, 'aug': 8,
            'september': 9, 'sep': 9, 'sept': 9,
            'october': 10, 'oct': 10,
            'november': 11, 'nov': 11,
            'december': 12, 'dec': 12
        };
    }

    /**
     * Initialize word-to-number mappings
     * @returns {Object} Mapping of word numbers to integers
     */
    initializeWordToNumber() {
        return {
            'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
            'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
            'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
            'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17,
            'eighteen': 18, 'nineteen': 19, 'twenty': 20, 'thirty': 30,
            'forty': 40, 'fifty': 50, 'sixty': 60,
            // Note: 'a' and 'an' removed - they're articles more often than numbers
            'couple': 2, 'few': 3, 'several': 5
        };
    }

    /**
     * Parse natural language input into structured schedule data
     * @param {string} text - Natural language scheduling phrase
     * @returns {Object|null} Structured schedule object or null
     */
    parse(text) {
        if (!text || typeof text !== 'string') {
            return null;
        }

        const normalized = this.normalizeInput(text);
        const doc = nlp(normalized);

        // Extract all components
        const result = {
            frequency: this.extractFrequency(doc, normalized),
            time: this.extractTime(doc, normalized),
            weekdays: this.extractWeekdays(doc, normalized),
            months: this.extractMonths(doc, normalized),
            dayOfMonth: this.extractDayOfMonth(doc, normalized),
            ordinal: this.extractOrdinal(doc, normalized), // first, second, last
            recurring: this.extractRecurring(normalized), // yearly, monthly, etc.
            rawText: text,
            normalizedText: normalized
        };

        // Add default time of midnight (00:00) if not specified but other scheduling info exists
        if (!result.time && (result.weekdays || result.months || result.dayOfMonth || result.recurring)) {
            result.time = { hour: 0, minute: 0, source: 'default' };
        }

        return this.validateResult(result) ? result : null;
    }

    /**
     * Normalize input text by converting word numbers to digits
     * @param {string} text - Input text
     * @returns {string} Normalized text
     */
    normalizeInput(text) {
        let normalized = text.toLowerCase().trim();

        // Convert word numbers to digits
        for (const [word, num] of Object.entries(this.wordToNumber)) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            normalized = normalized.replace(regex, num.toString());
        }

        // Normalize common phrases
        normalized = normalized
            .replace(/\bbusiness\s+days?\b/gi, 'weekdays')
            .replace(/\bwork\s+days?\b/gi, 'weekdays')
            .replace(/\bweek\s+days?\b/gi, 'weekdays')
            .replace(/\bmon-fri\b/gi, 'monday to friday')
            .replace(/\bdaily\b/gi, 'every day')
            .replace(/\bhourly\b/gi, 'every hour')
            .replace(/\bevery\s+other\b/gi, 'every 2')
            .replace(/\bof\s+(minute|minutes|hour|hours|day|days|week|weeks|month|months)/gi, '$1'); // Remove "of" before time units

        return normalized;
    }

    /**
     * Extract frequency/interval information
     * @param {Object} doc - compromise document
     * @param {string} text - normalized text
     * @returns {Object|null} Frequency object
     */
    extractFrequency(doc, text) {
        // Check for "every X minutes/hours/days/weeks/months" (after normalization, numbers should be digits)
        const intervalPattern = /every\s+(\d+)\s+(minute|minutes|min|mins|hour|hours|hr|hrs|day|days|week|weeks|month|months)/i;
        const intervalMatch = text.match(intervalPattern);
        
        if (intervalMatch) {
            const value = parseInt(intervalMatch[1]);
            const unit = intervalMatch[2].toLowerCase().replace(/s$/, '');
            
            return {
                type: 'interval',
                value: value,
                unit: unit.startsWith('min') ? 'minute' :
                      unit.startsWith('h') ? 'hour' :
                      unit.startsWith('d') ? 'day' :
                      unit.startsWith('w') ? 'week' : 'month'
            };
        }

        // Check for "X times a day/week/month"
        const timesPattern = /(\d+)\s+times?\s+(?:a|an|per|every)\s+(day|week|month|year)/i;
        const timesMatch = text.match(timesPattern);
        
        if (timesMatch) {
            return {
                type: 'times_per',
                value: parseInt(timesMatch[1]),
                unit: timesMatch[2].toLowerCase()
            };
        }

        // Check for special frequencies with context
        if (/\bonce\s+(?:a|an|per|every)\s+(day|week|month|year)/i.test(text)) {
            const unitMatch = text.match(/\bonce\s+(?:a|an|per|every)\s+(day|week|month|year)/i);
            return { type: 'times_per', value: 1, unit: unitMatch[1].toLowerCase() };
        }
        if (/\btwice\s+(?:a|an|per|every)\s+(day|week|month|year)/i.test(text)) {
            const unitMatch = text.match(/\btwice\s+(?:a|an|per|every)\s+(day|week|month|year)/i);
            return { type: 'times_per', value: 2, unit: unitMatch[1].toLowerCase() };
        }
        // Fallback for bare "once" or "twice"
        if (/\bonce\b/i.test(text)) {
            return { type: 'times_per', value: 1, unit: 'day' };
        }
        if (/\btwice\b/i.test(text)) {
            return { type: 'times_per', value: 2, unit: 'day' };
        }

        return null;
    }

    /**
     * Extract time information using both compromise and chrono
     * @param {Object} doc - compromise document
     * @param {string} text - normalized text
     * @returns {Object|null} Time object
     */
    extractTime(doc, text) {
        // Check for special times first (most specific)
        if (/\bmidnight\b/i.test(text)) {
            return { hour: 0, minute: 0, source: 'keyword' };
        }
        if (/\bnoon\b/i.test(text)) {
            return { hour: 12, minute: 0, source: 'keyword' };
        }

        // Try regex patterns for explicit times (more reliable than chrono for specific formats)
        const timePatterns = [
            /(\d+):(\d+)\s*(am|pm)/i,
            /(\d+)\s*(am|pm)/i,
            /at\s+(\d+):(\d+)\s*(am|pm)?/i,
            /at\s+(\d+)\s*(am|pm)?/i
        ];

        for (const pattern of timePatterns) {
            const match = text.match(pattern);
            if (match) {
                let hour = parseInt(match[1]);
                let minute = 0;
                
                // Check if match[2] is a minute or period
                if (match[2] && !isNaN(parseInt(match[2]))) {
                    minute = parseInt(match[2]);
                    // Period would be in match[3]
                    const period = match[3];
                    if (period && typeof period === 'string') {
                        const periodLower = period.toLowerCase();
                        if (periodLower === 'pm' && hour !== 12) hour += 12;
                        if (periodLower === 'am' && hour === 12) hour = 0;
                    }
                } else {
                    // match[2] is the period
                    const period = match[2];
                    if (period && typeof period === 'string') {
                        const periodLower = period.toLowerCase();
                        if (periodLower === 'pm' && hour !== 12) hour += 12;
                        if (periodLower === 'am' && hour === 12) hour = 0;
                    }
                }
                
                return { hour, minute, source: 'regex' };
            }
        }

        // Try chrono-node as last resort - but only if text contains time-related words
        // This prevents chrono from making assumptions when no time is mentioned
        if (/\bat\b|\btime\b|\bo'clock\b|\bclock\b/i.test(text)) {
            try {
                const chronoResults = chrono.parse(text);
                
                if (chronoResults.length > 0) {
                    const parsedDate = chronoResults[0].start.date();
                    return {
                        hour: parsedDate.getHours(),
                        minute: parsedDate.getMinutes(),
                        source: 'chrono'
                    };
                }
            } catch (error) {
                // Chrono parsing failed, continue without time
            }
        }

        return null;
    }

    /**
     * Extract weekday information
     * @param {Object} doc - compromise document
     * @param {string} text - normalized text
     * @returns {number[]|null} Array of weekday numbers (0-6)
     */
    extractWeekdays(doc, text) {
        const weekdays = [];

        // Check for "weekdays" or "weekends"
        if (/\bweekdays?\b/i.test(text)) {
            return [1, 2, 3, 4, 5]; // Monday to Friday
        }
        if (/\bweekends?\b/i.test(text)) {
            return [0, 6]; // Saturday and Sunday
        }

        // Check for day ranges (Monday to Friday, Mon-Fri)
        const rangePattern = /(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s+(?:to|through|-)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)/i;
        const rangeMatch = text.match(rangePattern);
        
        if (rangeMatch) {
            const startDay = this.weekdayMap[rangeMatch[1].toLowerCase()];
            const endDay = this.weekdayMap[rangeMatch[2].toLowerCase()];
            
            if (startDay !== undefined && endDay !== undefined) {
                // Always include the range, wrapping if needed
                if (startDay <= endDay) {
                    for (let i = startDay; i <= endDay; i++) {
                        weekdays.push(i);
                    }
                } else {
                    // Wrap around (e.g., Friday to Monday)
                    for (let i = startDay; i <= 6; i++) {
                        weekdays.push(i);
                    }
                    for (let i = 0; i <= endDay; i++) {
                        weekdays.push(i);
                    }
                }
                return weekdays.sort((a, b) => a - b);
            }
        }

        // Extract individual weekdays using word boundaries
        // Process in order to maintain original sequence
        const dayPattern = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\b/gi;
        const matches = text.match(dayPattern);
        
        if (matches) {
            for (const match of matches) {
                const dayNum = this.weekdayMap[match.toLowerCase()];
                if (dayNum !== undefined && !weekdays.includes(dayNum)) {
                    weekdays.push(dayNum);
                }
            }
        }

        return weekdays.length > 0 ? weekdays.sort((a, b) => a - b) : null;
    }

    /**
     * Extract month information
     * @param {Object} doc - compromise document
     * @param {string} text - normalized text
     * @returns {number[]|null} Array of month numbers (1-12)
     */
    extractMonths(doc, text) {
        const months = [];

        // Check for month ranges (January to April, Jan-Apr)
        const rangePattern = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\s+(?:to|through|-)\s+(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)/i;
        const rangeMatch = text.match(rangePattern);
        
        if (rangeMatch) {
            const startMonth = this.monthMap[rangeMatch[1].toLowerCase()];
            const endMonth = this.monthMap[rangeMatch[2].toLowerCase()];
            
            if (startMonth !== undefined && endMonth !== undefined) {
                // Handle wrap-around (e.g., November to February)
                if (startMonth <= endMonth) {
                    for (let i = startMonth; i <= endMonth; i++) {
                        months.push(i);
                    }
                } else {
                    for (let i = startMonth; i <= 12; i++) {
                        months.push(i);
                    }
                    for (let i = 1; i <= endMonth; i++) {
                        months.push(i);
                    }
                }
                return months.sort((a, b) => a - b);
            }
        }

        // Extract individual months using word boundaries
        const monthPattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/gi;
        const matches = text.match(monthPattern);
        
        if (matches) {
            for (const match of matches) {
                const monthNum = this.monthMap[match.toLowerCase()];
                if (monthNum !== undefined && !months.includes(monthNum)) {
                    months.push(monthNum);
                }
            }
        }

        return months.length > 0 ? months.sort((a, b) => a - b) : null;
    }

    /**
     * Extract day of month
     * @param {Object} doc - compromise document
     * @param {string} text - normalized text
     * @returns {number|null} Day of month (1-31)
     */
    extractDayOfMonth(doc, text) {
        // Check for special phrases first
        if (/\b(?:start|beginning|first\s+day)\s+of\s+(?:the\s+)?(?:every\s+)?month\b/i.test(text)) {
            return 1;
        }
        if (/\b(?:end|last\s+day)\s+of\s+(?:the\s+)?(?:every\s+)?month\b/i.test(text)) {
            return 31; // Approximation (cron doesn't have "last day")
        }
        
        // Look for patterns like "15th", "on the 3rd", "day 20"
        const patterns = [
            /(?:on\s+(?:the\s+)?)?(\d+)(?:st|nd|rd|th)\s+(?:day|of)/i,
            /(?:day\s+)?(\d+)(?:st|nd|rd|th)/i,
            /on\s+(?:the\s+)?(\d+)/i
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                const day = parseInt(match[1]);
                if (day >= 1 && day <= 31) {
                    return day;
                }
            }
        }

        return null;
    }

    /**
     * Extract ordinal information (first, second, last)
     * @param {Object} doc - compromise document
     * @param {string} text - normalized text
     * @returns {Object|null} Ordinal object
     */
    extractOrdinal(doc, text) {
        const ordinalMap = {
            'first': 1, '1st': 1,
            'second': 2, '2nd': 2,
            'third': 3, '3rd': 3,
            'fourth': 4, '4th': 4,
            'fifth': 5, '5th': 5,
            'last': -1
        };

        for (const [word, value] of Object.entries(ordinalMap)) {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            if (regex.test(text)) {
                // Check what it refers to
                if (/\b(?:first|second|third|fourth|fifth|last)\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i.test(text)) {
                    return { value, type: 'weekday' };
                }
                if (/\b(?:first|second|third|fourth|fifth|last)\s+(?:day|week)/i.test(text)) {
                    return { value, type: 'day' };
                }
            }
        }

        return null;
    }

    /**
     * Extract recurring pattern (yearly, monthly, weekly)
     * @param {string} text - normalized text
     * @returns {string|null} Recurring pattern type
     */
    extractRecurring(text) {
        if (/\byearly\b|\bevery\s+year\b|\bannually\b/i.test(text)) {
            return 'yearly';
        }
        if (/\bmonthly\b|\bevery\s+month\b/i.test(text)) {
            return 'monthly';
        }
        if (/\bweekly\b|\bevery\s+week\b/i.test(text)) {
            return 'weekly';
        }
        if (/\bdaily\b|\bevery\s+day\b/i.test(text)) {
            return 'daily';
        }
        if (/\bquarterly\b|\bevery\s+quarter\b/i.test(text)) {
            return 'quarterly';
        }

        return null;
    }

    /**
     * Validate that the result has at least some useful information
     * @param {Object} result - Parsed result object
     * @returns {boolean} True if valid
     */
    validateResult(result) {
        // Must have at least frequency, time, weekdays, months, or dayOfMonth
        return !!(
            result.frequency ||
            result.time ||
            result.weekdays ||
            result.months ||
            result.dayOfMonth ||
            result.recurring
        );
    }

    /**
     * Get a human-readable description of the parsed result
     * @param {Object} result - Parsed result object
     * @returns {string} Description
     */
    describe(result) {
        if (!result) return 'Unable to parse';

        const parts = [];

        if (result.frequency) {
            if (result.frequency.type === 'interval') {
                parts.push(`Every ${result.frequency.value} ${result.frequency.unit}(s)`);
            } else if (result.frequency.type === 'times_per') {
                parts.push(`${result.frequency.value} times per ${result.frequency.unit}`);
            }
        }

        if (result.weekdays) {
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const days = result.weekdays.map(d => dayNames[d]).join(', ');
            parts.push(`on ${days}`);
        }

        if (result.time) {
            const hour = result.time.hour;
            const minute = result.time.minute;
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            parts.push(`at ${displayHour}:${minute.toString().padStart(2, '0')} ${ampm}`);
        }

        if (result.months) {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 
                              'July', 'August', 'September', 'October', 'November', 'December'];
            const months = result.months.map(m => monthNames[m]).join(', ');
            parts.push(`in ${months}`);
        }

        if (result.recurring) {
            parts.push(result.recurring);
        }

        return parts.join(' ') || 'Parsed successfully';
    }
}
