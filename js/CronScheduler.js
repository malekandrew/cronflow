/**
 * CronScheduler - Calculate next execution times for cron expressions
 * Handles matching dates against cron patterns and generating execution schedules
 */

import { CONFIG } from './constants.js';

export class CronScheduler {
    /**
     * Generate next execution times for a parsed cron expression
     * @param {Object} parsed - Parsed cron expression
     * @returns {Date[]} Array of next execution dates
     */
    static generateNextExecutions(parsed) {
        const now = new Date();
        const executions = [];
        
        // Quick scan: check every minute for the next 100 minutes
        for (let i = 0; i < CONFIG.LOOKAHEAD_MINUTES && executions.length < CONFIG.NEXT_EXECUTIONS_COUNT; i++) {
            const testDate = new Date(now.getTime() + i * 60000);
            
            if (this.matchesCron(testDate, parsed)) {
                executions.push(testDate);
            }
        }

        // If we didn't find enough, do a more thorough search
        if (executions.length < CONFIG.NEXT_EXECUTIONS_COUNT) {
            for (let days = 0; days < CONFIG.LOOKAHEAD_DAYS && executions.length < CONFIG.NEXT_EXECUTIONS_COUNT; days++) {
                for (let hours = 0; hours < 24 && executions.length < CONFIG.NEXT_EXECUTIONS_COUNT; hours++) {
                    for (let minutes = 0; minutes < 60 && executions.length < CONFIG.NEXT_EXECUTIONS_COUNT; minutes++) {
                        const testDate = new Date(now);
                        testDate.setDate(testDate.getDate() + days);
                        testDate.setHours(hours, minutes, 0, 0);
                        
                        if (testDate > now && this.matchesCron(testDate, parsed)) {
                            // Avoid duplicates
                            if (!executions.some(d => d.getTime() === testDate.getTime())) {
                                executions.push(testDate);
                            }
                        }
                    }
                }
            }
        }

        return executions.sort((a, b) => a.getTime() - b.getTime());
    }

    /**
     * Check if a date matches a cron expression
     * @param {Date} date - Date to check
     * @param {Object} parsed - Parsed cron expression
     * @returns {boolean} True if date matches
     */
    static matchesCron(date, parsed) {
        const minute = date.getMinutes();
        const hour = date.getHours();
        const day = date.getDate();
        const month = date.getMonth() + 1; // JavaScript months are 0-indexed
        const weekday = date.getDay();

        return (
            this.matchesField(minute, parsed.minute, 0, 59) &&
            this.matchesField(hour, parsed.hour, 0, 23) &&
            this.matchesField(day, parsed.day, 1, 31) &&
            this.matchesField(month, parsed.month, 1, 12) &&
            this.matchesField(weekday, parsed.weekday, 0, 7)
        );
    }

    /**
     * Check if a value matches a cron field
     * @param {number} value - Value to check
     * @param {Object} field - Parsed field object
     * @param {number} min - Minimum field value
     * @param {number} max - Maximum field value
     * @returns {boolean} True if matches
     */
    static matchesField(value, field, min, max) {
        switch (field.type) {
            case 'any':
                return true;
            case 'value':
                return value === field.value || (field.value === 7 && value === 0);
            case 'range':
                return value >= field.min && value <= field.max;
            case 'list':
                return field.values.includes(value) || (field.values.includes(7) && value === 0);
            case 'step':
                return value >= field.min && value <= field.max && 
                       (value - field.min) % field.step === 0;
            case 'rangeStep':
                return value >= field.min && value <= field.max && 
                       (value - field.min) % field.step === 0;
            default:
                return false;
        }
    }

    /**
     * Format relative time from now
     * @param {Date} date - Future date
     * @returns {string} Relative time string
     */
    static getRelativeTime(date) {
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) {
            return 'in less than a minute';
        } else if (diffMins < 60) {
            return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
        } else if (diffHours < 24) {
            const remainingMins = diffMins % 60;
            if (remainingMins === 0) {
                return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
            } else {
                return `in ${diffHours}h ${remainingMins}m`;
            }
        } else {
            const remainingHours = diffHours % 24;
            if (remainingHours === 0) {
                return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
            } else {
                return `in ${diffDays}d ${remainingHours}h`;
            }
        }
    }
}
