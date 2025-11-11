// Cron Checker JavaScript
class CronChecker {
    constructor() {
        this.cronInput = document.getElementById('cronInput');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.explanationContent = document.getElementById('explanationContent');
        this.scheduleContent = document.getElementById('scheduleContent');
        this.resultsSection = document.getElementById('resultsSection');
        this.examplesSection = document.getElementById('examplesSection');
        
        // Field breakdown elements
        this.minuteField = document.getElementById('minuteField');
        this.hourField = document.getElementById('hourField');
        this.dayField = document.getElementById('dayField');
        this.monthField = document.getElementById('monthField');
        this.weekdayField = document.getElementById('weekdayField');

        // Help modal elements
        this.helpModal = document.getElementById('helpModal');
        this.helpBtn = document.getElementById('helpBtn');
        this.closeHelp = document.getElementById('closeHelp');

        this.init();
    }

    init() {
        // Real-time input listener
        this.cronInput.addEventListener('input', (e) => {
            this.handleCronInput(e.target.value);
        });

        // Example buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cronExpression = e.currentTarget.dataset.cron;
                this.cronInput.value = cronExpression;
                this.handleCronInput(cronExpression);
                this.cronInput.focus();
            });
        });

        // Help modal
        this.helpBtn.addEventListener('click', () => {
            this.helpModal.classList.add('show');
        });

        this.closeHelp.addEventListener('click', () => {
            this.helpModal.classList.remove('show');
        });

        this.helpModal.addEventListener('click', (e) => {
            if (e.target === this.helpModal) {
                this.helpModal.classList.remove('show');
            }
        });

        // Initial state
        this.showExamples();
    }

    handleCronInput(cronExpression) {
        cronExpression = cronExpression.trim();
        
        if (!cronExpression) {
            this.showExamples();
            this.hideError();
            return;
        }

        this.hideExamples();

        try {
            const parsed = this.parseCron(cronExpression);
            this.displayResults(parsed, cronExpression);
            this.hideError();
        } catch (error) {
            this.showError(error.message);
            this.hideResults();
        }
    }

    parseCron(cronExpression) {
        const parts = cronExpression.split(/\s+/);
        
        if (parts.length !== 5) {
            throw new Error('Cron expression must have exactly 5 fields: minute hour day month weekday');
        }

        const [minute, hour, day, month, weekday] = parts;

        // Validate each field
        this.validateField(minute, 'minute', 0, 59);
        this.validateField(hour, 'hour', 0, 23);
        this.validateField(day, 'day', 1, 31);
        this.validateField(month, 'month', 1, 12);
        this.validateField(weekday, 'weekday', 0, 7); // 0 and 7 both represent Sunday

        return {
            minute: this.parseField(minute, 0, 59),
            hour: this.parseField(hour, 0, 23),
            day: this.parseField(day, 1, 31),
            month: this.parseField(month, 1, 12),
            weekday: this.parseField(weekday, 0, 7)
        };
    }

    validateField(field, name, min, max) {
        if (!field || field === '') {
            throw new Error(`${name} field cannot be empty`);
        }

        // Check for invalid characters
        if (!/^[0-9,\-\*/]+$/.test(field)) {
            throw new Error(`${name} field contains invalid characters`);
        }
    }

    parseField(field, min, max) {
        if (field === '*') {
            return { type: 'any', description: 'any' };
        }

        // Handle step values (e.g., */5, 0-23/2)
        if (field.includes('/')) {
            const [range, step] = field.split('/');
            const stepNum = parseInt(step);
            
            if (isNaN(stepNum) || stepNum <= 0) {
                throw new Error(`Invalid step value: ${step}`);
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
                // Range with step (e.g., 0-23/2)
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

        // Handle ranges (e.g., 1-5)
        if (field.includes('-')) {
            const parts = field.split('-');
            if (parts.length !== 2) {
                throw new Error(`Invalid range format: ${field}`);
            }
            
            const [rangeMin, rangeMax] = parts.map(n => parseInt(n));
            
            if (isNaN(rangeMin) || isNaN(rangeMax)) {
                throw new Error(`Invalid range values: ${field}`);
            }
            
            if (rangeMin > rangeMax) {
                throw new Error(`Invalid range: ${rangeMin} is greater than ${rangeMax}`);
            }

            return {
                type: 'range',
                min: rangeMin,
                max: rangeMax,
                description: `${rangeMin} to ${rangeMax}`
            };
        }

        // Handle lists (e.g., 1,3,5)
        if (field.includes(',')) {
            const values = field.split(',').map(n => parseInt(n));
            
            for (let value of values) {
                if (isNaN(value)) {
                    throw new Error(`Invalid list value: ${field}`);
                }
            }

            return {
                type: 'list',
                values: values,
                description: values.join(', ')
            };
        }

        // Handle single value
        const value = parseInt(field);
        if (isNaN(value)) {
            throw new Error(`Invalid value: ${field}`);
        }

        if (value < min || value > max) {
            throw new Error(`Value ${value} is out of range (${min}-${max})`);
        }

        return {
            type: 'value',
            value: value,
            description: value.toString()
        };
    }

    generateExplanation(parsed) {
        const parts = [];
        
        // Build human-readable explanation
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

        if (parsed.hour.type !== 'any') {
            if (parsed.hour.type === 'step') {
                parts.push(`every ${parsed.hour.step} hour${parsed.hour.step > 1 ? 's' : ''}`);
            } else {
                parts.push(`at ${this.formatHour(parsed.hour)}`);
            }
        }

        if (parsed.day.type !== 'any') {
            parts.push(`on day ${this.formatFieldDescription(parsed.day)} of the month`);
        }

        if (parsed.month.type !== 'any') {
            parts.push(`in ${this.formatMonth(parsed.month)}`);
        }

        if (parsed.weekday.type !== 'any') {
            parts.push(`on ${this.formatWeekday(parsed.weekday)}`);
        }

        let explanation = 'Runs ' + parts.join(' ');
        
        // Capitalize first letter
        return explanation.charAt(0).toUpperCase() + explanation.slice(1);
    }

    formatFieldDescription(field) {
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

    formatHour(hourField) {
        if (hourField.type === 'value') {
            const hour = hourField.value;
            if (hour === 0) return '12:00 AM';
            if (hour < 12) return `${hour}:00 AM`;
            if (hour === 12) return '12:00 PM';
            return `${hour - 12}:00 PM`;
        }
        return `hour ${this.formatFieldDescription(hourField)}`;
    }

    formatMonth(monthField) {
        const months = [
            '', 'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        if (monthField.type === 'value') {
            return months[monthField.value];
        } else if (monthField.type === 'list') {
            return monthField.values.map(m => months[m]).join(', ');
        } else if (monthField.type === 'range') {
            return `${months[monthField.min]} to ${months[monthField.max]}`;
        }
        return `month ${this.formatFieldDescription(monthField)}`;
    }

    formatWeekday(weekdayField) {
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        if (weekdayField.type === 'value') {
            let day = weekdayField.value;
            if (day === 7) day = 0; // Convert 7 to Sunday (0)
            return weekdays[day];
        } else if (weekdayField.type === 'list') {
            return weekdayField.values.map(d => {
                if (d === 7) d = 0;
                return weekdays[d];
            }).join(', ');
        } else if (weekdayField.type === 'range') {
            let min = weekdayField.min, max = weekdayField.max;
            if (min === 7) min = 0;
            if (max === 7) max = 0;
            return `${weekdays[min]} to ${weekdays[max]}`;
        }
        return `weekday ${this.formatFieldDescription(weekdayField)}`;
    }

    generateNextExecutions(parsed) {
        const now = new Date();
        const executions = [];
        
        // Generate next 5 execution times
        for (let i = 0; i < 100 && executions.length < 5; i++) {
            const testDate = new Date(now.getTime() + i * 60000); // Check every minute for the next 100 minutes
            
            if (this.matchesCron(testDate, parsed)) {
                executions.push(testDate);
            }
        }

        // If we didn't find enough in the next 100 minutes, look ahead further
        if (executions.length < 5) {
            for (let days = 0; days < 7 && executions.length < 5; days++) {
                for (let hours = 0; hours < 24 && executions.length < 5; hours++) {
                    for (let minutes = 0; minutes < 60 && executions.length < 5; minutes++) {
                        const testDate = new Date(now);
                        testDate.setDate(testDate.getDate() + days);
                        testDate.setHours(hours, minutes, 0, 0);
                        
                        if (testDate > now && this.matchesCron(testDate, parsed)) {
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

    matchesCron(date, parsed) {
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

    matchesField(value, field, min, max) {
        switch (field.type) {
            case 'any':
                return true;
            case 'value':
                return value === field.value || (field.value === 7 && value === 0); // Handle Sunday as 7
            case 'range':
                return value >= field.min && value <= field.max;
            case 'list':
                return field.values.includes(value) || (field.values.includes(7) && value === 0);
            case 'step':
                return value >= field.min && value <= field.max && (value - field.min) % field.step === 0;
            case 'rangeStep':
                return value >= field.min && value <= field.max && (value - field.min) % field.step === 0;
            default:
                return false;
        }
    }

    displayResults(parsed, cronExpression) {
        // Show explanation
        const explanation = this.generateExplanation(parsed);
        this.explanationContent.innerHTML = `<p class="explanation-text">${explanation}</p>`;

        // Show field breakdown
        this.updateFieldBreakdown(parsed);

        // Show next executions
        const nextExecutions = this.generateNextExecutions(parsed);
        this.displaySchedule(nextExecutions);

        this.showResults();
    }

    updateFieldBreakdown(parsed) {
        this.minuteField.textContent = this.formatFieldDescription(parsed.minute);
        this.hourField.textContent = this.formatFieldDescription(parsed.hour);
        this.dayField.textContent = this.formatFieldDescription(parsed.day);
        this.monthField.textContent = this.formatFieldDescription(parsed.month);
        this.weekdayField.textContent = this.formatFieldDescription(parsed.weekday);
    }

    displaySchedule(executions) {
        if (executions.length === 0) {
            this.scheduleContent.innerHTML = '<p class="no-executions">No executions found in the next week</p>';
            return;
        }

        const scheduleHtml = executions.map((date, index) => {
            const timeString = date.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const relativeTime = this.getRelativeTime(date);

            return `
                <div class="execution-item ${index === 0 ? 'next' : ''}">
                    <div class="execution-time">${timeString}</div>
                    <div class="execution-relative">${relativeTime}</div>
                </div>
            `;
        }).join('');

        this.scheduleContent.innerHTML = scheduleHtml;
    }

    getRelativeTime(date) {
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

    showResults() {
        this.resultsSection.style.display = 'grid';
        this.resultsSection.classList.add('fade-in');
    }

    hideResults() {
        this.resultsSection.style.display = 'none';
        this.resultsSection.classList.remove('fade-in');
    }

    showExamples() {
        this.examplesSection.style.display = 'block';
        this.hideResults();
    }

    hideExamples() {
        this.examplesSection.style.display = 'none';
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
        this.errorMessage.classList.add('shake');
        
        setTimeout(() => {
            this.errorMessage.classList.remove('shake');
        }, 500);
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CronChecker();
});