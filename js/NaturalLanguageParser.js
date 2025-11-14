/**
 * NaturalLanguageParser - Converts human-readable text to cron expressions
 * Supports various natural language patterns for scheduling
 * Now uses hybrid approach: Advanced NLP first, regex patterns as fallback
 */

import { CONFIG, WEEKDAY_MAP, MONTH_MAP } from './constants.js';
import { SemanticNLPEngine } from './SemanticNLPEngine.js';
import { NLPToCronConverter } from './NLPToCronConverter.js';

export class NaturalLanguageParser {
    constructor() {
        this.weekdayMap = WEEKDAY_MAP;
        this.monthMap = MONTH_MAP;
        this.patterns = this.initializePatterns();
        
        // Initialize NLP engines
        this.nlpEngine = new SemanticNLPEngine();
        this.cronConverter = new NLPToCronConverter();
        
        // Track which parser was used (for debugging/analytics)
        this.lastParserUsed = null;
    }

    /**
     * Parse natural language to cron expression using hybrid approach
     * Tries advanced NLP first, falls back to regex patterns
     * @param {string} text - Natural language input
     * @returns {string|null} Cron expression or null if parsing fails
     */
    parse(text) {
        if (!text || typeof text !== 'string' || !text.trim()) {
            return null;
        }

        // Step 1: Try advanced NLP parsing
        try {
            const nlpResult = this.nlpEngine.parse(text);
            if (nlpResult) {
                const cronExpression = this.cronConverter.convert(nlpResult);
                if (cronExpression) {
                    this.lastParserUsed = 'nlp';
                    return cronExpression;
                }
            }
        } catch (error) {
            console.warn('NLP parsing failed, falling back to regex:', error.message);
        }

        // Step 2: Fall back to regex patterns
        const regexResult = this.parseWithRegex(text);
        if (regexResult) {
            this.lastParserUsed = 'regex';
            return regexResult;
        }

        this.lastParserUsed = null;
        return null;
    }

    /**
     * Parse using regex patterns (legacy method)
     * @param {string} text - Natural language input
     * @returns {string|null} Cron expression or null
     */
    parseWithRegex(text) {
        const lowerText = text.toLowerCase().trim();

        for (const pattern of this.patterns) {
            const match = lowerText.match(pattern.regex);
            if (match) {
                try {
                    return pattern.handler(match, lowerText);
                } catch (error) {
                    console.error('Pattern handler error:', error);
                    continue;
                }
            }
        }

        return null;
    }

    /**
     * Get information about which parser was used for the last parse
     * @returns {string|null} 'nlp', 'regex', or null
     */
    getLastParserUsed() {
        return this.lastParserUsed;
    }

    /**
     * Parse weekday names from text
     * @param {string} text - Text containing day names
     * @returns {number[]} Array of day numbers (0-6)
     */
    parseWeekdays(text) {
        const days = [];
        const lowerText = text.toLowerCase();
        
        for (const [name, num] of Object.entries(this.weekdayMap)) {
            const regex = new RegExp(`\\b${name}\\b`, 'i');
            if (regex.test(lowerText) && !days.includes(num)) {
                days.push(num);
            }
        }
        
        return days.sort((a, b) => a - b);
    }

    /**
     * Parse time from various formats
     * @param {string} text - Text containing time
     * @returns {Object|null} Object with hour and minute, or null
     */
    parseTime(text) {
        const timePatterns = [
            /(\d+):(\d+)\s*(am|pm)/i,
            /(\d+)\s*(am|pm)/i,
            /at\s+(\d+):(\d+)/i,
            /at\s+(\d+)/i
        ];

        for (const pattern of timePatterns) {
            const match = text.match(pattern);
            if (match) {
                let hour = parseInt(match[1]);
                let minute = 0;
                
                if (match[2] && !isNaN(parseInt(match[2]))) {
                    minute = parseInt(match[2]);
                }
                
                const period = match[3] || match[2];
                if (period && typeof period === 'string') {
                    const periodLower = period.toLowerCase();
                    if (periodLower === 'pm' && hour !== 12) hour += 12;
                    if (periodLower === 'am' && hour === 12) hour = 0;
                }
                
                return { hour, minute };
            }
        }
        
        // Check for special times
        if (/\bmidnight\b/i.test(text)) {
            return { hour: 0, minute: 0 };
        }
        if (/\bnoon\b/i.test(text)) {
            return { hour: 12, minute: 0 };
        }
        
        return null;
    }

    /**
     * Initialize all natural language patterns
     * @returns {Array} Array of pattern objects
     */
    initializePatterns() {
        return [
            this.createYearlyPattern(),
            ...this.createMonthlyPatterns(),
            ...this.createPeriodicPatterns(),
            this.createMultipleDaysPattern(),
            ...this.createIntervalPatterns(),
            ...this.createWeekdayPatterns(),
            ...this.createSingleDayPatterns(),
            ...this.createDailyPatterns(),
            ...this.createSpecialTimePatterns()
        ];
    }

    /**
     * Create yearly pattern matcher
     */
    createYearlyPattern() {
        return {
            regex: /(?:once\s+a\s+year|annually|yearly)(?:\s+(?:on|in))?\s*(january|february|march|april|may|june|july|august|september|october|november|december)?\s*(\d+)?(?:st|nd|rd|th)?(?:\s+at\s+)?(.+)?/i,
            handler: (match, text) => {
                const monthName = match[1];
                const day = match[2] ? parseInt(match[2]) : 1;
                const time = this.parseTime(text) || { 
                    hour: CONFIG.DEFAULT_HOUR, 
                    minute: CONFIG.DEFAULT_MINUTE 
                };
                
                const month = monthName ? this.monthMap[monthName.toLowerCase()] : 1;
                return `${time.minute} ${time.hour} ${day} ${month} *`;
            }
        };
    }

    /**
     * Create monthly pattern matchers
     */
    createMonthlyPatterns() {
        return [
            {
                regex: /(?:on\s+the\s+)?(\d+)(?:st|nd|rd|th)\s+(?:day\s+)?of\s+(?:each|every)\s+month(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const day = parseInt(match[1]);
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} ${day} * *`;
                }
            },
            {
                regex: /(?:every|each)\s+month\s+on\s+(?:the\s+)?(\d+)(?:st|nd|rd|th)?(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const day = parseInt(match[1]);
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} ${day} * *`;
                }
            },
            {
                regex: /(?:once\s+a\s+month|monthly)(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} 1 * *`;
                }
            },
            {
                regex: /(?:at\s+the\s+)?(?:start|beginning)\s+of\s+(?:each|every)\s+month(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} 1 * *`;
                }
            },
            {
                regex: /(?:at\s+the\s+)?end\s+of\s+(?:each|every)\s+month(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} 28-31 * *`;
                }
            }
        ];
    }

    /**
     * Create periodic pattern matchers (every X days/weeks/months)
     */
    createPeriodicPatterns() {
        return [
            {
                regex: /every\s+(\d+)\s+days?(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const days = parseInt(match[1]);
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} */${days} * *`;
                }
            },
            {
                regex: /every\s+(\d+)\s+weeks?(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} * * 1`;
                }
            },
            {
                regex: /every\s+(\d+)\s+months?(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const months = parseInt(match[1]);
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} 1 */${months} *`;
                }
            },
            {
                regex: /(?:every\s+)?quarter(?:ly)?(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} 1 */3 *`;
                }
            },
            {
                regex: /(?:bi-?weekly|every\s+other\s+week)(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} * * 1`;
                }
            },
            {
                regex: /(?:bi-?monthly|twice\s+a\s+month)(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} 1,15 * *`;
                }
            }
        ];
    }

    /**
     * Create pattern for multiple days (Monday and Friday)
     */
    createMultipleDaysPattern() {
        return {
            regex: /(?:on\s+)?(?:every\s+)?([a-z,\s]+(?:and|,)\s*[a-z]+)(?:\s+at\s+)?(.+)?/i,
            handler: (match, text) => {
                const daysText = match[1];
                const hasDays = /monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun/i.test(daysText);
                
                if (!hasDays) return null;
                
                const days = this.parseWeekdays(daysText);
                if (days.length === 0) return null;
                
                const time = this.parseTime(text) || { 
                    hour: CONFIG.DEFAULT_WEEKDAY_HOUR, 
                    minute: CONFIG.DEFAULT_MINUTE 
                };
                
                return `${time.minute} ${time.hour} * * ${days.join(',')}`;
            }
        };
    }

    /**
     * Create interval patterns (every X minutes/hours)
     */
    createIntervalPatterns() {
        return [
            {
                regex: /every\s+(\d+)\s+(?:minute|minutes|min|mins)/i,
                handler: (match) => `*/${match[1]} * * * *`
            },
            {
                regex: /every\s+(\d+)\s+(?:hour|hours|hr|hrs)/i,
                handler: (match) => `0 */${match[1]} * * *`
            },
            {
                regex: /every\s+minute/i,
                handler: () => `* * * * *`
            },
            {
                regex: /every\s+hour/i,
                handler: () => `0 * * * *`
            }
        ];
    }

    /**
     * Create weekday/weekend patterns
     */
    createWeekdayPatterns() {
        return [
            {
                regex: /(?:every\s+)?(?:weekday|weekdays|monday through friday|mon-fri)(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_WEEKDAY_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} * * 1-5`;
                }
            },
            {
                regex: /(?:every\s+)?(?:weekend|weekends|saturday and sunday|sat and sun)(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const time = this.parseTime(text) || { 
                        hour: CONFIG.DEFAULT_WEEKEND_HOUR, 
                        minute: CONFIG.DEFAULT_MINUTE 
                    };
                    return `${time.minute} ${time.hour} * * 6,0`;
                }
            }
        ];
    }

    /**
     * Create single day patterns
     */
    createSingleDayPatterns() {
        const days = [
            { pattern: 'monday|mon', num: 1 },
            { pattern: 'tuesday|tue', num: 2 },
            { pattern: 'wednesday|wed', num: 3 },
            { pattern: 'thursday|thu', num: 4 },
            { pattern: 'friday|fri', num: 5 },
            { pattern: 'saturday|sat', num: 6 },
            { pattern: 'sunday|sun', num: 0 }
        ];

        const patterns = [];
        
        // Day with time
        for (const day of days) {
            patterns.push({
                regex: new RegExp(`(?:every\\s+)?(?:on\\s+)?(${day.pattern})\\s+at\\s+(\\d+)(?::(\\d+))?\\s*(am|pm)`, 'i'),
                handler: (match) => {
                    let hour = parseInt(match[2]);
                    const minute = match[3] ? parseInt(match[3]) : 0;
                    const period = match[4].toLowerCase();
                    
                    if (period === 'pm' && hour !== 12) hour += 12;
                    if (period === 'am' && hour === 12) hour = 0;
                    
                    return `${minute} ${hour} * * ${day.num}`;
                }
            });
        }
        
        // Day without time
        for (const day of days) {
            patterns.push({
                regex: new RegExp(`(?:every\\s+)?(?:on\\s+)?(${day.pattern})(?!\\s+and)(?!\\s*,)`, 'i'),
                handler: () => `0 ${CONFIG.DEFAULT_WEEKDAY_HOUR} * * ${day.num}`
            });
        }
        
        return patterns;
    }

    /**
     * Create daily patterns
     */
    createDailyPatterns() {
        return [
            {
                regex: /(?:every\s+)?day\s+at\s+(\d+)(?::(\d+))?\s*(am|pm)/i,
                handler: (match) => {
                    let hour = parseInt(match[1]);
                    const minute = match[2] ? parseInt(match[2]) : 0;
                    const period = match[3].toLowerCase();
                    
                    if (period === 'pm' && hour !== 12) hour += 12;
                    if (period === 'am' && hour === 12) hour = 0;
                    
                    return `${minute} ${hour} * * *`;
                }
            },
            {
                regex: /(?:every\s+)?day/i,
                handler: () => `0 0 * * *`
            }
        ];
    }

    /**
     * Create special time patterns
     */
    createSpecialTimePatterns() {
        return [
            {
                regex: /(?:at\s+)?(\d+)(?::(\d+))?\s*(am|pm)/i,
                handler: (match) => {
                    let hour = parseInt(match[1]);
                    const minute = match[2] ? parseInt(match[2]) : 0;
                    const period = match[3].toLowerCase();
                    
                    if (period === 'pm' && hour !== 12) hour += 12;
                    if (period === 'am' && hour === 12) hour = 0;
                    
                    return `${minute} ${hour} * * *`;
                }
            },
            {
                regex: /(?:at\s+)?midnight/i,
                handler: () => `0 0 * * *`
            },
            {
                regex: /(?:at\s+)?noon/i,
                handler: () => `0 12 * * *`
            }
        ];
    }

}
