/**
 * CronParser - Utilities for parsing and validating cron expressions
 * Handles validation, field parsing, and cron format conversion
 */

import { ERROR_MESSAGES, MONTH_NAMES, WEEKDAY_NAMES } from './constants.js';

export class CronParser {
    /**
     * Parse a cron expression into structured data
     * @param {string} cronExpression - The cron expression to parse
     * @returns {Object} Parsed cron data
     */
    static parse(cronExpression) {
        const parts = cronExpression.split(/\s+/);
        
        if (parts.length !== 5) {
            throw new Error(ERROR_MESSAGES.INVALID_FIELD_COUNT);
        }

        const [minute, hour, day, month, weekday] = parts;

        // Validate each field
        this.validateField(minute, 'minute', 0, 59);
        this.validateField(hour, 'hour', 0, 23);
        this.validateField(day, 'day', 1, 31);
        this.validateField(month, 'month', 1, 12);
        this.validateField(weekday, 'weekday', 0, 7);

        return {
            minute: this.parseField(minute, 0, 59),
            hour: this.parseField(hour, 0, 23),
            day: this.parseField(day, 1, 31),
            month: this.parseField(month, 1, 12),
            weekday: this.parseField(weekday, 0, 7)
        };
    }

    /**
     * Validate a cron field
     * @param {string} field - The field value
     * @param {string} name - The field name
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     */
    static validateField(field, name, min, max) {
        if (!field || field === '') {
            throw new Error(ERROR_MESSAGES.EMPTY_FIELD.replace('{{field}}', name));
        }

        if (!/^[0-9,\-\*/]+$/.test(field)) {
            throw new Error(ERROR_MESSAGES.INVALID_CHARACTERS.replace('{{field}}', name));
        }
    }

    /**
     * Parse a single cron field into structured data
     * @param {string} field - The field value
     * @param {number} min - Minimum allowed value
     * @param {number} max - Maximum allowed value
     * @returns {Object} Parsed field data
     */
    static parseField(field, min, max) {
        if (field === '*') {
            return { type: 'any', description: 'any' };
        }

        // Handle step values (e.g., */5, 0-23/2)
        if (field.includes('/')) {
            return this.parseStepField(field, min, max);
        }

        // Handle ranges (e.g., 1-5)
        if (field.includes('-')) {
            return this.parseRangeField(field);
        }

        // Handle lists (e.g., 1,3,5)
        if (field.includes(',')) {
            return this.parseListField(field);
        }

        // Handle single value
        return this.parseSingleValue(field, min, max);
    }

    /**
     * Parse step field (star/5 or 0-23/2)
     * @param {string} field - Field to parse
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {Object} Parsed field object
     */
    static parseStepField(field, min, max) {
        const [range, step] = field.split('/');
        const stepNum = parseInt(step);
        
        if (isNaN(stepNum) || stepNum <= 0) {
            throw new Error(ERROR_MESSAGES.INVALID_STEP.replace('{{value}}', step));
        }

        if (range === '*') {
            return {
                type: 'step',
                step: stepNum,
                min: min,
                max: max,
                description: `every ${stepNum}`
            };
        } else {
            const [rangeMin, rangeMax] = range.split('-').map(n => parseInt(n));
            return {
                type: 'rangeStep',
                step: stepNum,
                min: rangeMin,
                max: rangeMax,
                description: `every ${stepNum} from ${rangeMin} to ${rangeMax}`
            };
        }
    }

    /**
     * Parse range field (1-5)
     */
    static parseRangeField(field) {
        const parts = field.split('-');
        if (parts.length !== 2) {
            throw new Error(ERROR_MESSAGES.INVALID_RANGE_FORMAT.replace('{{value}}', field));
        }
        
        const [rangeMin, rangeMax] = parts.map(n => parseInt(n));
        
        if (isNaN(rangeMin) || isNaN(rangeMax)) {
            throw new Error(ERROR_MESSAGES.INVALID_RANGE_VALUES.replace('{{value}}', field));
        }
        
        if (rangeMin > rangeMax) {
            throw new Error(
                ERROR_MESSAGES.INVALID_RANGE_ORDER
                    .replace('{{min}}', rangeMin)
                    .replace('{{max}}', rangeMax)
            );
        }

        return {
            type: 'range',
            min: rangeMin,
            max: rangeMax,
            description: `${rangeMin} to ${rangeMax}`
        };
    }

    /**
     * Parse list field (1,3,5)
     */
    static parseListField(field) {
        const values = field.split(',').map(n => parseInt(n));
        
        for (const value of values) {
            if (isNaN(value)) {
                throw new Error(ERROR_MESSAGES.INVALID_LIST_VALUE.replace('{{value}}', field));
            }
        }

        return {
            type: 'list',
            values: values,
            description: values.join(', ')
        };
    }

    /**
     * Parse single value field
     */
    static parseSingleValue(field, min, max) {
        const value = parseInt(field);
        if (isNaN(value)) {
            throw new Error(ERROR_MESSAGES.INVALID_VALUE.replace('{{value}}', field));
        }

        if (value < min || value > max) {
            throw new Error(
                ERROR_MESSAGES.OUT_OF_RANGE
                    .replace('{{value}}', value)
                    .replace('{{min}}', min)
                    .replace('{{max}}', max)
            );
        }

        return {
            type: 'value',
            value: value,
            description: value.toString()
        };
    }

    /**
     * Format field description for display
     * @param {Object} field - Parsed field object
     * @returns {string} Human-readable description
     */
    static formatFieldDescription(field) {
        switch (field.type) {
            case 'value':
                return field.value.toString();
            case 'range':
                return `${field.min}-${field.max}`;
            case 'list':
                return field.values.join(', ');
            case 'step':
                return `every ${field.step}`;
            case 'rangeStep':
                return `every ${field.step} from ${field.min} to ${field.max}`;
            default:
                return field.description;
        }
    }

    /**
     * Format hour field with AM/PM
     * @param {Object} hourField - Parsed hour field
     * @returns {string} Formatted hour string
     */
    static formatHour(hourField) {
        if (hourField.type === 'value') {
            const hour = hourField.value;
            if (hour === 0) return '12:00 AM';
            if (hour < 12) return `${hour}:00 AM`;
            if (hour === 12) return '12:00 PM';
            return `${hour - 12}:00 PM`;
        }
        return `hour ${this.formatFieldDescription(hourField)}`;
    }

    /**
     * Format month field with month names
     * @param {Object} monthField - Parsed month field
     * @returns {string} Formatted month string
     */
    static formatMonth(monthField) {
        if (monthField.type === 'value') {
            return MONTH_NAMES[monthField.value];
        } else if (monthField.type === 'list') {
            return monthField.values.map(m => MONTH_NAMES[m]).join(', ');
        } else if (monthField.type === 'range') {
            return `${MONTH_NAMES[monthField.min]} to ${MONTH_NAMES[monthField.max]}`;
        }
        return `month ${this.formatFieldDescription(monthField)}`;
    }

    /**
     * Format weekday field with day names
     * @param {Object} weekdayField - Parsed weekday field
     * @returns {string} Formatted weekday string
     */
    static formatWeekday(weekdayField) {
        if (weekdayField.type === 'value') {
            let day = weekdayField.value;
            if (day === 7) day = 0; // Convert 7 to Sunday (0)
            return WEEKDAY_NAMES[day];
        } else if (weekdayField.type === 'list') {
            return weekdayField.values.map(d => {
                if (d === 7) d = 0;
                return WEEKDAY_NAMES[d];
            }).join(', ');
        } else if (weekdayField.type === 'range') {
            let min = weekdayField.min, max = weekdayField.max;
            if (min === 7) min = 0;
            if (max === 7) max = 0;
            return `${WEEKDAY_NAMES[min]} to ${WEEKDAY_NAMES[max]}`;
        }
        return `weekday ${this.formatFieldDescription(weekdayField)}`;
    }
}
