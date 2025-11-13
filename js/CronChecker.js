/**
 * CronChecker - Main application class that coordinates all functionality
 * Handles UI interactions, mode switching, and orchestrates parsing/display
 */

import { PLACEHOLDER_TEXT } from './constants.js';
import { NaturalLanguageParser } from './NaturalLanguageParser.js';
import { CronParser } from './CronParser.js';
import { CronScheduler } from './CronScheduler.js';
import { CronExplanationGenerator } from './CronExplanationGenerator.js';

export class CronChecker {
    constructor() {
        // Initialize natural language parser
        this.nlParser = new NaturalLanguageParser();
        
        // Current input mode
        this.currentMode = 'natural';
        
        // Initialize theme
        this.initializeTheme();
        
        // Get DOM elements
        this.initializeElements();
        
        // Set up event listeners
        this.initializeEventListeners();
        
        // Initial state
        this.showExamples();
    }

    /**
     * Initialize theme from localStorage
     */
    initializeTheme() {
        const savedTheme = localStorage.getItem('cronflow-theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-mode');
        }
    }

    /**
     * Initialize all DOM element references
     */
    initializeElements() {
        // Input elements
        this.naturalInput = document.getElementById('naturalInput');
        this.cronInput = document.getElementById('cronInput');
        this.convertedCron = document.getElementById('convertedCron');
        this.convertedCronCode = document.getElementById('convertedCronCode');
        this.copyCronBtn = document.getElementById('copyCronBtn');
        
        // Clear buttons
        this.clearNaturalBtn = document.getElementById('clearNaturalBtn');
        this.clearCronBtn = document.getElementById('clearCronBtn');
        
        // Mode toggle buttons
        this.naturalModeBtn = document.getElementById('naturalModeBtn');
        this.cronModeBtn = document.getElementById('cronModeBtn');
        
        // Display elements
        this.explanationContent = document.getElementById('explanationContent');
        this.scheduleContent = document.getElementById('scheduleContent');
        this.minuteField = document.getElementById('minuteField');
        this.hourField = document.getElementById('hourField');
        this.dayField = document.getElementById('dayField');
        this.monthField = document.getElementById('monthField');
        this.weekdayField = document.getElementById('weekdayField');
        
        // Sections
        this.resultsSection = document.getElementById('resultsSection');
        this.examplesSection = document.getElementById('examplesSection');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        
        // Help modal
        this.helpBtn = document.getElementById('helpBtn');
        this.helpModal = document.getElementById('helpModal');
        this.closeHelp = document.getElementById('closeHelp');
        
        // NLP modal
        this.nlpGuideBtn = document.getElementById('nlpGuideBtn');
        this.nlpModal = document.getElementById('nlpModal');
        this.closeNlp = document.getElementById('closeNlp');
        
        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');
        this.themeIcon = document.getElementById('themeIcon');
        this.themeLabel = document.getElementById('themeLabel');
        
        // Format hint
        this.formatHint = document.getElementById('formatHint');
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Natural language input
        this.naturalInput.addEventListener('input', (e) => {
            this.handleNaturalInput(e.target.value);
            this.toggleClearButton(this.naturalInput, this.clearNaturalBtn);
        });

        this.naturalInput.addEventListener('focus', () => {
            if (this.currentMode !== 'natural') {
                this.switchMode('natural');
            }
            this.toggleClearButton(this.naturalInput, this.clearNaturalBtn);
        });

        // Cron input
        this.cronInput.addEventListener('input', (e) => {
            this.handleCronInput(e.target.value);
            this.toggleClearButton(this.cronInput, this.clearCronBtn);
        });

        this.cronInput.addEventListener('focus', () => {
            if (this.currentMode !== 'cron') {
                this.switchMode('cron');
            }
            this.toggleClearButton(this.cronInput, this.clearCronBtn);
        });

        // Clear buttons
        this.clearNaturalBtn.addEventListener('click', () => {
            this.naturalInput.value = '';
            this.handleNaturalInput('');
            this.clearNaturalBtn.classList.remove('visible');
            this.naturalInput.focus();
        });

        this.clearCronBtn.addEventListener('click', () => {
            this.cronInput.value = '';
            this.handleCronInput('');
            this.clearCronBtn.classList.remove('visible');
            this.cronInput.focus();
        });

        // Mode toggle buttons
        this.naturalModeBtn.addEventListener('click', () => {
            this.switchMode('natural');
        });

        this.cronModeBtn.addEventListener('click', () => {
            this.switchMode('cron');
        });

        // Copy converted cron button
        this.copyCronBtn.addEventListener('click', () => {
            this.copyCronToClipboard();
        });

        // Example buttons
        document.querySelectorAll('.example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cronExpression = e.currentTarget.dataset.cron;
                this.switchMode('cron');
                this.cronInput.value = cronExpression;
                this.handleCronInput(cronExpression);
                this.cronInput.focus();
            });
        });

        // Natural language example buttons
        document.querySelectorAll('.natural-example-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.currentTarget.dataset.text;
                this.switchMode('natural');
                this.naturalInput.value = text;
                this.handleNaturalInput(text);
                this.naturalInput.focus();
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

        // NLP Guide modal
        this.nlpGuideBtn.addEventListener('click', () => {
            this.nlpModal.classList.add('show');
        });

        this.closeNlp.addEventListener('click', () => {
            this.nlpModal.classList.remove('show');
        });

        this.nlpModal.addEventListener('click', (e) => {
            if (e.target === this.nlpModal) {
                this.nlpModal.classList.remove('show');
            }
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Update theme label on load
        this.updateThemeUI();
    }

    /**
     * Switch between natural language and cron input modes
     * @param {string} mode - 'natural' or 'cron'
     */
    switchMode(mode) {
        this.currentMode = mode;
        
        if (mode === 'natural') {
            this.naturalModeBtn.classList.add('active');
            this.cronModeBtn.classList.remove('active');
            this.naturalInput.style.display = 'block';
            this.cronInput.style.display = 'none';
            this.formatHint.textContent = PLACEHOLDER_TEXT.NATURAL_HINT;
            this.naturalInput.focus();
            
            // Process current value if any
            const value = this.naturalInput.value.trim();
            if (value) {
                this.handleNaturalInput(value);
            } else {
                this.convertedCron.style.display = 'none';
                this.showExamples();
            }
        } else {
            this.cronModeBtn.classList.add('active');
            this.naturalModeBtn.classList.remove('active');
            this.cronInput.style.display = 'block';
            this.naturalInput.style.display = 'none';
            this.convertedCron.style.display = 'none';
            this.formatHint.textContent = PLACEHOLDER_TEXT.CRON_HINT;
            this.cronInput.focus();
            
            // Process current value if any
            const value = this.cronInput.value.trim();
            if (value) {
                this.handleCronInput(value);
            } else {
                this.showExamples();
            }
        }
    }

    /**
     * Handle natural language input
     * @param {string} text - Natural language text
     */
    handleNaturalInput(text) {
        text = text.trim();
        
        if (!text) {
            this.convertedCron.style.display = 'none';
            this.showExamples();
            this.hideError();
            return;
        }

        this.hideExamples();

        const cronExpression = this.nlParser.parse(text);
        
        if (cronExpression) {
            this.convertedCronCode.textContent = cronExpression;
            this.convertedCron.style.display = 'flex';
            
            try {
                const parsed = CronParser.parse(cronExpression);
                this.displayResults(parsed, cronExpression);
                this.hideError();
            } catch (error) {
                this.showError(error.message);
                this.hideResults();
            }
        } else {
            this.convertedCron.style.display = 'none';
            this.showError('Could not understand natural language input. Try examples like "every 5 minutes" or "weekdays at 9am"');
            this.hideResults();
        }
    }

    /**
     * Handle cron expression input
     * @param {string} cronExpression - Cron expression
     */
    handleCronInput(cronExpression) {
        cronExpression = cronExpression.trim();
        
        if (!cronExpression) {
            this.showExamples();
            this.hideError();
            return;
        }

        this.hideExamples();

        try {
            const parsed = CronParser.parse(cronExpression);
            this.displayResults(parsed, cronExpression);
            this.hideError();
        } catch (error) {
            this.showError(error.message);
            this.hideResults();
        }
    }

    /**
     * Display parsed cron results
     * @param {Object} parsed - Parsed cron expression
     * @param {string} cronExpression - Original cron expression
     */
    displayResults(parsed, cronExpression) {
        // Show explanation
        const explanation = CronExplanationGenerator.generateExplanation(parsed);
        this.explanationContent.innerHTML = `<p class="explanation-text">${explanation}</p>`;

        // Show field breakdown
        this.updateFieldBreakdown(parsed);

        // Show next executions
        const nextExecutions = CronScheduler.generateNextExecutions(parsed);
        this.displaySchedule(nextExecutions);

        this.showResults();
    }

    /**
     * Update field breakdown display
     * @param {Object} parsed - Parsed cron expression
     */
    updateFieldBreakdown(parsed) {
        this.minuteField.textContent = CronExplanationGenerator.formatFieldDescription(parsed.minute);
        this.hourField.textContent = CronExplanationGenerator.formatFieldDescription(parsed.hour);
        this.dayField.textContent = CronExplanationGenerator.formatFieldDescription(parsed.day);
        this.monthField.textContent = CronExplanationGenerator.formatFieldDescription(parsed.month);
        this.weekdayField.textContent = CronExplanationGenerator.formatFieldDescription(parsed.weekday);
    }

    /**
     * Display execution schedule
     * @param {Date[]} executions - Array of execution dates
     */
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

            const relativeTime = CronScheduler.getRelativeTime(date);

            return `
                <div class="execution-item ${index === 0 ? 'next' : ''}">
                    <div class="execution-time">${timeString}</div>
                    <div class="execution-relative">${relativeTime}</div>
                </div>
            `;
        }).join('');

        this.scheduleContent.innerHTML = scheduleHtml;
    }

    /**
     * Copy converted cron expression to clipboard
     */
    copyCronToClipboard() {
        const cronText = this.convertedCronCode.textContent;
        navigator.clipboard.writeText(cronText).then(() => {
            this.copyCronBtn.classList.add('copied');
            this.copyCronBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            setTimeout(() => {
                this.copyCronBtn.classList.remove('copied');
                this.copyCronBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
    }

    /**
     * Show results section
     */
    showResults() {
        this.resultsSection.style.display = 'grid';
        this.resultsSection.classList.add('fade-in');
    }

    /**
     * Hide results section
     */
    hideResults() {
        this.resultsSection.style.display = 'none';
        this.resultsSection.classList.remove('fade-in');
    }

    /**
     * Show examples section
     */
    showExamples() {
        this.examplesSection.style.display = 'block';
        this.hideResults();
    }

    /**
     * Hide examples section
     */
    hideExamples() {
        this.examplesSection.style.display = 'none';
    }

    /**
     * Toggle clear button visibility based on input value
     * @param {HTMLInputElement} input - Input element
     * @param {HTMLButtonElement} button - Clear button element
     */
    toggleClearButton(input, button) {
        if (input.value.trim()) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    }

    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
        this.errorMessage.classList.add('shake');
        
        setTimeout(() => {
            this.errorMessage.classList.remove('shake');
        }, 500);
    }

    /**
     * Hide error message
     */
    hideError() {
        this.errorMessage.style.display = 'none';
    }

    /**
     * Toggle between light and dark theme
     */
    toggleTheme() {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('cronflow-theme', isLight ? 'light' : 'dark');
        this.updateThemeUI();
    }

    /**
     * Update theme toggle button UI
     */
    updateThemeUI() {
        const isLight = document.body.classList.contains('light-mode');
        if (isLight) {
            this.themeIcon.className = 'fas fa-sun';
            this.themeLabel.textContent = 'Light';
        } else {
            this.themeIcon.className = 'fas fa-moon';
            this.themeLabel.textContent = 'Dark';
        }
    }
}
