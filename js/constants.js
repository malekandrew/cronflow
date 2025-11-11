/**
 * CronFlow - Application Constants
 * Configuration values and constants used throughout the application
 */

export const CONFIG = {
    // Background animation settings
    PARTICLE_COUNT: 80,
    MOUSE_RADIUS: 150,
    PARTICLE_SIZE_MIN: 1,
    PARTICLE_SIZE_MAX: 4,
    PARTICLE_SPEED_MAX: 0.5,
    PARTICLE_FORCE_MULTIPLIER: 3,
    PARTICLE_RETURN_SPEED: 0.02,
    CONNECTION_DISTANCE: 120,
    CONNECTION_OPACITY: 0.15,
    
    // Default times for cron expressions (when not specified)
    DEFAULT_WEEKDAY_HOUR: 9,
    DEFAULT_WEEKEND_HOUR: 10,
    DEFAULT_MINUTE: 0,
    DEFAULT_HOUR: 0,
    
    // UI constants
    COPY_BUTTON_RESET_DELAY: 2000,
    ERROR_SHAKE_DURATION: 500,
    NEXT_EXECUTIONS_COUNT: 5,
    LOOKAHEAD_MINUTES: 100,
    LOOKAHEAD_DAYS: 7
};

export const PARTICLE_COLORS = {
    PRIMARY: 'rgba(102, 126, 234, 0.8)',
    SECONDARY: 'rgba(79, 209, 199, 0.4)',
    TRANSPARENT: 'rgba(102, 126, 234, 0)',
    CONNECTION: 'rgba(102, 126, 234, {{opacity}})'
};

/**
 * Weekday name mappings for natural language parsing
 */
export const WEEKDAY_MAP = {
    'sunday': 0, 'sun': 0,
    'monday': 1, 'mon': 1,
    'tuesday': 2, 'tue': 2, 'tues': 2,
    'wednesday': 3, 'wed': 3,
    'thursday': 4, 'thu': 4, 'thur': 4, 'thurs': 4,
    'friday': 5, 'fri': 5,
    'saturday': 6, 'sat': 6,
    'weekday': 'weekday',
    'weekdays': 'weekday',
    'weekend': 'weekend',
    'weekends': 'weekend'
};

/**
 * Weekday names for display
 */
export const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Month names for display
 */
export const MONTH_NAMES = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Month name mappings for natural language parsing
 */
export const MONTH_MAP = {
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

/**
 * Error messages for validation
 */
export const ERROR_MESSAGES = {
    INVALID_FIELD_COUNT: 'Cron expression must have exactly 5 fields: minute hour day month weekday',
    EMPTY_FIELD: '{{field}} field cannot be empty',
    INVALID_CHARACTERS: '{{field}} field contains invalid characters',
    INVALID_STEP: 'Invalid step value: {{value}}',
    INVALID_RANGE_FORMAT: 'Invalid range format: {{value}}',
    INVALID_RANGE_VALUES: 'Invalid range values: {{value}}',
    INVALID_RANGE_ORDER: 'Invalid range: {{min}} is greater than {{max}}',
    INVALID_LIST_VALUE: 'Invalid list value: {{value}}',
    INVALID_VALUE: 'Invalid value: {{value}}',
    OUT_OF_RANGE: 'Value {{value}} is out of range ({{min}}-{{max}})',
    NATURAL_LANGUAGE_FAILED: 'Could not understand that expression. Try: "once a month", "15th of each month", "quarterly", "weekdays at 9am", "every Monday and Friday"'
};

/**
 * Placeholder text for inputs
 */
export const PLACEHOLDER_TEXT = {
    NATURAL: 'Try: "once a month" or "15th of each month" or "quarterly" or "every Monday at 3pm"',
    CRON: 'Enter your cron expression (e.g., 0 9 * * 1-5)',
    NATURAL_HINT: 'Try: "once a month", "15th of each month", "quarterly", "every Monday at 3pm"',
    CRON_HINT: 'Format: minute hour day month weekday'
};
