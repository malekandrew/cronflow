/**
 * NLPToCronConverter - Converts structured NLP output to cron expressions
 * Handles complex combinations of time, weekdays, months, and frequency
 */

import { CONFIG } from './constants.js';

export class NLPToCronConverter {
    constructor() {
        // Cron fields: minute hour day month weekday
    }

    /**
     * Format weekdays array as cron field
     * Converts consecutive ranges to dash notation (e.g., [1,2,3,4,5] -> "1-5")
     * @param {number[]} weekdays - Array of weekday numbers (0-6)
     * @returns {string} Formatted weekday field
     */
    formatWeekdays(weekdays) {
        if (!weekdays || weekdays.length === 0) return '*';
        if (weekdays.length === 1) return weekdays[0].toString();
        
        const sorted = [...weekdays].sort((a, b) => a - b);
        
        // Check if it's a consecutive range
        let isConsecutive = true;
        for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] !== sorted[i-1] + 1) {
                isConsecutive = false;
                break;
            }
        }
        
        // Use range notation if consecutive
        if (isConsecutive && sorted.length > 2) {
            return `${sorted[0]}-${sorted[sorted.length - 1]}`;
        }
        
        // Otherwise, use comma-separated list
        return sorted.join(',');
    }

    /**
     * Convert NLP parsed result to cron expression
     * @param {Object} nlpResult - Parsed result from SemanticNLPEngine
     * @returns {string|null} Cron expression or null
     */
    convert(nlpResult) {
        if (!nlpResult) return null;

        try {
            // Handle different scheduling patterns
            
            // Pattern 1: Complex schedule (e.g., "every monday and thursday at 10am in January to April")
            if (nlpResult.weekdays && nlpResult.time && nlpResult.months) {
                return this.buildComplexSchedule(nlpResult);
            }

            // Pattern 2: Interval-based (e.g., "every 5 minutes")
            if (nlpResult.frequency && nlpResult.frequency.type === 'interval') {
                return this.buildIntervalSchedule(nlpResult);
            }

            // Pattern 3: Times per period (e.g., "twice daily")
            if (nlpResult.frequency && nlpResult.frequency.type === 'times_per') {
                return this.buildTimesPerSchedule(nlpResult);
            }

            // Pattern 4: Weekly schedule (e.g., "every Monday at 3pm")
            if (nlpResult.weekdays && nlpResult.time) {
                return this.buildWeeklySchedule(nlpResult);
            }

            // Pattern 5: Monthly schedule (e.g., "15th of every month at 10am")
            if (nlpResult.dayOfMonth && nlpResult.time) {
                return this.buildMonthlySchedule(nlpResult);
            }

            // Pattern 6: Daily schedule (e.g., "daily at 3pm")
            if (nlpResult.time && nlpResult.recurring === 'daily') {
                return this.buildDailySchedule(nlpResult);
            }

            // Pattern 7: Yearly schedule (e.g., "every year on March 15")
            if (nlpResult.recurring === 'yearly' && nlpResult.months) {
                return this.buildYearlySchedule(nlpResult);
            }

            // Pattern 8: Quarterly schedule
            if (nlpResult.recurring === 'quarterly') {
                return this.buildQuarterlySchedule(nlpResult);
            }

            // Pattern 9: Ordinal weekday (e.g., "first Monday of every month")
            if (nlpResult.ordinal && nlpResult.weekdays) {
                return this.buildOrdinalSchedule(nlpResult);
            }

            // Pattern 10: Simple time-based
            if (nlpResult.time) {
                return this.buildSimpleTimeSchedule(nlpResult);
            }

            // Pattern 11: Simple weekday-based
            if (nlpResult.weekdays) {
                return this.buildSimpleWeekdaySchedule(nlpResult);
            }

            return null;
        } catch (error) {
            console.error('Error converting NLP result to cron:', error);
            return null;
        }
    }

    /**
     * Build complex schedule with weekdays, time, and months
     * Example: "every monday and thursday at 10am in January to April"
     * @param {Object} result - NLP result
     * @returns {string} Cron expression
     */
    buildComplexSchedule(result) {
        const minute = result.time.minute;
        const hour = result.time.hour;
        const weekdays = this.formatWeekdays(result.weekdays);
        const months = result.months.join(',');
        
        // Cron: minute hour day month weekday
        // For this pattern, day is * (any day) because weekday is specified
        return `${minute} ${hour} * ${months} ${weekdays}`;
    }

    /**
     * Build interval-based schedule
     * Example: "every 5 minutes", "every 2 hours"
     * @param {Object} result - NLP result
     * @returns {string} Cron expression
     */
    buildIntervalSchedule(result) {
        const freq = result.frequency;
        
        switch (freq.unit) {
            case 'minute':
                return `*/${freq.value} * * * *`;
            
            case 'hour':
                const minute = result.time ? result.time.minute : 0;
                return `${minute} */${freq.value} * * *`;
            
            case 'day':
                const time = result.time || { hour: 0, minute: 0 };
                return `${time.minute} ${time.hour} */${freq.value} * *`;
            
            case 'week':
                const weekTime = result.time || { hour: 9, minute: 0 };
                const weekday = result.weekdays ? result.weekdays[0] : 1; // Default Monday
                return `${weekTime.minute} ${weekTime.hour} * * ${weekday}`;
            
            case 'month':
                const monthTime = result.time || { hour: 0, minute: 0 };
                const day = result.dayOfMonth || 1;
                return `${monthTime.minute} ${monthTime.hour} ${day} */${freq.value} *`;
            
            default:
                return null;
        }
    }

    /**
     * Build times-per-period schedule
     * Example: "twice daily", "3 times a week"
     * @param {Object} result - NLP result
     * @returns {string} Cron expression
     */
    buildTimesPerSchedule(result) {
        const freq = result.frequency;
        const time = result.time || { hour: 9, minute: 0 };
        
        switch (freq.unit) {
            case 'day':
                if (freq.value === 2) {
                    // Twice daily: assume 9am and 5pm
                    // Note: Cron can't express this perfectly, return first execution
                    return `${time.minute} ${time.hour},${time.hour + 8} * * *`;
                }
                if (freq.value === 3) {
                    // Three times daily: 9am, 1pm, 5pm
                    return `${time.minute} ${time.hour},${time.hour + 4},${time.hour + 8} * * *`;
                }
                return `${time.minute} */${Math.floor(24 / freq.value)} * * *`;
            
            case 'week':
                if (freq.value === 2) {
                    // Twice a week: Monday and Thursday
                    return `${time.minute} ${time.hour} * * 1,4`;
                }
                if (freq.value === 3) {
                    // Three times a week: Monday, Wednesday, Friday
                    return `${time.minute} ${time.hour} * * 1,3,5`;
                }
                return null;
            
            case 'month':
                if (freq.value === 2) {
                    // Twice a month: 1st and 15th
                    return `${time.minute} ${time.hour} 1,15 * *`;
                }
                return null;
            
            default:
                return null;
        }
    }

    /**
     * Build weekly schedule
     * Example: "every Monday at 3pm", "weekdays at 9am"
     * @param {Object} result - NLP result
     * @returns {string} Cron expression
     */
    buildWeeklySchedule(result) {
        const minute = result.time.minute;
        const hour = result.time.hour;
        const weekdays = this.formatWeekdays(result.weekdays);
        
        return `${minute} ${hour} * * ${weekdays}`;
    }

    /**
     * Build monthly schedule
     * Example: "15th of every month at 10am"
     * @param {Object} result - NLP result
     * @returns {string} Cron expression
     */
    buildMonthlySchedule(result) {
        const minute = result.time.minute;
        const hour = result.time.hour;
        const day = result.dayOfMonth;
        
        if (result.months) {
            // Specific months
            return `${minute} ${hour} ${day} ${result.months.join(',')} *`;
        } else {
            // Every month
            return `${minute} ${hour} ${day} * *`;
        }
    }

    /**
     * Build daily schedule
     * Example: "daily at 3pm", "every day at 10:30am"
     * @param {Object} result - NLP result
     * @returns {string} Cron expression
     */
    buildDailySchedule(result) {
        const minute = result.time.minute;
        const hour = result.time.hour;
        
        if (result.weekdays) {
            // Daily but only on specific weekdays
            const weekdays = this.formatWeekdays(result.weekdays);
            return `${minute} ${hour} * * ${weekdays}`;
        } else {
            // Every day
            return `${minute} ${hour} * * *`;
        }
    }

    /**
     * Build yearly schedule
     * Example: "every year on March 15", "annually in January"
     * @param {Object} result - NLP result
     * @returns {string} Cron expression
     */
    buildYearlySchedule(result) {
        const time = result.time || { hour: 0, minute: 0 };
        const day = result.dayOfMonth || 1;
        const month = result.months ? result.months[0] : 1;
        
        return `${time.minute} ${time.hour} ${day} ${month} *`;
    }

    /**
     * Build quarterly schedule
     * Example: "quarterly", "every quarter"
     * @param {Object} result - NLP result
     * @returns {string} Cron expression
     */
    buildQuarterlySchedule(result) {
        const time = result.time || { hour: 0, minute: 0 };
        const day = result.dayOfMonth || 1;
        
        // Quarterly: January, April, July, October (months 1,4,7,10)
        // Or use */3 to mean every 3 months
        return `${time.minute} ${time.hour} ${day} */3 *`;
    }

    /**
     * Build ordinal weekday schedule
     * Example: "first Monday of every month", "last Friday"
     * Note: Standard cron doesn't support this directly
     * This returns an approximation
     * @param {Object} result - NLP result
     * @returns {string} Cron expression
     */
    buildOrdinalSchedule(result) {
        const time = result.time || { hour: 9, minute: 0 };
        const weekday = result.weekdays[0];
        
        // Standard cron can't express "first Monday of month"
        // Return a weekly schedule as approximation
        // For proper implementation, this would need to be checked at runtime
        return `${time.minute} ${time.hour} 1-7 * ${weekday}`;
    }

    /**
     * Build simple time-based schedule (daily at specified time)
     * @param {Object} result - NLP result
     * @returns {string} Cron expression
     */
    buildSimpleTimeSchedule(result) {
        const minute = result.time.minute;
        const hour = result.time.hour;
        
        return `${minute} ${hour} * * *`;
    }

    /**
     * Build simple weekday schedule (every specified weekday at default time)
     * @param {Object} result - NLP result
     * @returns {string} Cron expression
     */
    buildSimpleWeekdaySchedule(result) {
        const hour = CONFIG.DEFAULT_WEEKDAY_HOUR || 9;
        const minute = CONFIG.DEFAULT_MINUTE || 0;
        const weekdays = this.formatWeekdays(result.weekdays);
        
        return `${minute} ${hour} * * ${weekdays}`;
    }

    /**
     * Get a description of what the cron expression means
     * @param {string} cron - Cron expression
     * @returns {string} Human-readable description
     */
    describe(cron) {
        if (!cron) return 'Invalid cron expression';
        
        const parts = cron.split(' ');
        if (parts.length !== 5) return 'Invalid cron expression';
        
        const [minute, hour, day, month, weekday] = parts;
        
        const descriptions = [];
        
        // Minute
        if (minute.startsWith('*/')) {
            descriptions.push(`every ${minute.substring(2)} minutes`);
        } else if (minute !== '*') {
            descriptions.push(`at minute ${minute}`);
        }
        
        // Hour
        if (hour.startsWith('*/')) {
            descriptions.push(`every ${hour.substring(2)} hours`);
        } else if (hour !== '*') {
            const hourNum = parseInt(hour.split(',')[0]);
            const ampm = hourNum >= 12 ? 'PM' : 'AM';
            const displayHour = hourNum % 12 || 12;
            descriptions.push(`at ${displayHour}:${minute.padStart(2, '0')} ${ampm}`);
        }
        
        // Day
        if (day.startsWith('*/')) {
            descriptions.push(`every ${day.substring(2)} days`);
        } else if (day !== '*') {
            descriptions.push(`on day ${day}`);
        }
        
        // Month
        if (month.startsWith('*/')) {
            descriptions.push(`every ${month.substring(2)} months`);
        } else if (month !== '*') {
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const months = month.split(',').map(m => monthNames[parseInt(m) - 1]);
            descriptions.push(`in ${months.join(', ')}`);
        }
        
        // Weekday
        if (weekday !== '*') {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            if (weekday === '1-5') {
                descriptions.push('on weekdays');
            } else {
                const days = weekday.split(',').map(d => dayNames[parseInt(d)]);
                descriptions.push(`on ${days.join(', ')}`);
            }
        }
        
        return descriptions.join(' ');
    }
}
