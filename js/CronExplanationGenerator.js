/**
 * CronExplanationGenerator - Generate human-readable descriptions of cron expressions
 * Formats field descriptions and creates natural language explanations
 */

export class CronExplanationGenerator {
    /**
     * Month names for display
     */
    static MONTH_NAMES = [
        '', 'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    /**
     * Weekday names for display
     */
    static WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    /**
     * Generate a complete human-readable explanation
     * @param {Object} parsed - Parsed cron expression
     * @returns {string} Human-readable explanation
     */
    static generateExplanation(parsed) {
        const parts = [];
        
        // Build minute description
        if (parsed.minute.type === 'any') {
            if (parsed.hour.type === 'any') {
                parts.push('every minute');
            } else {
                parts.push('every minute');
            }
        } else if (parsed.minute.type === 'step') {
            parts.push(`every ${parsed.minute.step} minute${parsed.minute.step > 1 ? 's' : ''}`);
        } else {
            parts.push(`at minute ${this.formatFieldDescription(parsed.minute)}`);
        }

        // Build hour description
        if (parsed.hour.type !== 'any') {
            if (parsed.hour.type === 'step') {
                parts.push(`every ${parsed.hour.step} hour${parsed.hour.step > 1 ? 's' : ''}`);
            } else {
                parts.push(`at ${this.formatHour(parsed.hour)}`);
            }
        }

        // Build day description
        if (parsed.day.type !== 'any') {
            parts.push(`on day ${this.formatFieldDescription(parsed.day)} of the month`);
        }

        // Build month description
        if (parsed.month.type !== 'any') {
            parts.push(`in ${this.formatMonth(parsed.month)}`);
        }

        // Build weekday description
        if (parsed.weekday.type !== 'any') {
            parts.push(`on ${this.formatWeekday(parsed.weekday)}`);
        }

        let explanation = 'Runs ' + parts.join(' ');
        
        // Capitalize first letter
        return explanation.charAt(0).toUpperCase() + explanation.slice(1);
    }

    /**
     * Format a generic field description
     * @param {Object} field - Parsed field object
     * @returns {string} Formatted description
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
     * Format hour field with AM/PM notation
     * @param {Object} hourField - Parsed hour field
     * @returns {string} Formatted hour description
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
     * @returns {string} Formatted month description
     */
    static formatMonth(monthField) {
        if (monthField.type === 'value') {
            return this.MONTH_NAMES[monthField.value];
        } else if (monthField.type === 'list') {
            return monthField.values.map(m => this.MONTH_NAMES[m]).join(', ');
        } else if (monthField.type === 'range') {
            return `${this.MONTH_NAMES[monthField.min]} to ${this.MONTH_NAMES[monthField.max]}`;
        }
        return `month ${this.formatFieldDescription(monthField)}`;
    }

    /**
     * Format weekday field with day names
     * @param {Object} weekdayField - Parsed weekday field
     * @returns {string} Formatted weekday description
     */
    static formatWeekday(weekdayField) {
        if (weekdayField.type === 'value') {
            let day = weekdayField.value;
            if (day === 7) day = 0; // Convert 7 to Sunday (0)
            return this.WEEKDAY_NAMES[day];
        } else if (weekdayField.type === 'list') {
            return weekdayField.values.map(d => {
                if (d === 7) d = 0;
                return this.WEEKDAY_NAMES[d];
            }).join(', ');
        } else if (weekdayField.type === 'range') {
            let min = weekdayField.min, max = weekdayField.max;
            if (min === 7) min = 0;
            if (max === 7) max = 0;
            return `${this.WEEKDAY_NAMES[min]} to ${this.WEEKDAY_NAMES[max]}`;
        }
        return `weekday ${this.formatFieldDescription(weekdayField)}`;
    }
}
