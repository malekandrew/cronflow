// Cron Checker JavaScript

// Animated Background
class AnimatedBackground {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        this.particleCount = 80;
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.createParticles();
        this.setupEventListeners();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.particles = [];
            this.createParticles();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            const size = Math.random() * 3 + 1;
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const speedX = (Math.random() - 0.5) * 0.5;
            const speedY = (Math.random() - 0.5) * 0.5;
            
            this.particles.push({
                x,
                y,
                size,
                speedX,
                speedY,
                baseX: x,
                baseY: y
            });
        }
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let particle of this.particles) {
            // Calculate distance from mouse
            if (this.mouse.x != null && this.mouse.y != null) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Push particles away from mouse
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    particle.x -= Math.cos(angle) * force * 3;
                    particle.y -= Math.sin(angle) * force * 3;
                }
            }
            
            // Gradually return to base position
            const dxBase = particle.baseX - particle.x;
            const dyBase = particle.baseY - particle.y;
            particle.x += dxBase * 0.02 + particle.speedX;
            particle.y += dyBase * 0.02 + particle.speedY;
            
            // Wrap around screen edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle with gradient
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 2
            );
            gradient.addColorStop(0, 'rgba(102, 126, 234, 0.8)');
            gradient.addColorStop(0.5, 'rgba(79, 209, 199, 0.4)');
            gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Draw connections between nearby particles
        this.connectParticles();
    }

    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = (120 - distance) / 120 * 0.15;
                    this.ctx.strokeStyle = `rgba(102, 126, 234, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    animate() {
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }
}

// Natural Language to Cron Converter
class NaturalLanguageParser {
    constructor() {
        this.weekdayMap = {
            'sunday': 0, 'sun': 0,
            'monday': 1, 'mon': 1,
            'tuesday': 2, 'tue': 2, 'tues': 2,
            'wednesday': 3, 'wed': 3,
            'thursday': 4, 'thu': 4, 'thur': 4, 'thurs': 4,
            'friday': 5, 'fri': 5,
            'saturday': 6, 'sat': 6
        };
        
        this.patterns = this.initializePatterns();
    }

    parseWeekdays(text) {
        const days = [];
        text = text.toLowerCase();
        
        for (let [name, num] of Object.entries(this.weekdayMap)) {
            const regex = new RegExp(`\\b${name}\\b`, 'i');
            if (regex.test(text)) {
                if (!days.includes(num)) {
                    days.push(num);
                }
            }
        }
        
        return days.sort((a, b) => a - b);
    }

    parseTime(text) {
        // Try to extract time in various formats
        const timePatterns = [
            /(\d+):(\d+)\s*(am|pm)/i,
            /(\d+)\s*(am|pm)/i,
            /at\s+(\d+):(\d+)/i,
            /at\s+(\d+)/i
        ];

        for (let pattern of timePatterns) {
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

    initializePatterns() {
        return [
            // Multiple days with "and" or "," (must be before single day patterns)
            {
                regex: /(?:on\s+)?(?:every\s+)?([a-z,\s]+(?:and|,)\s*[a-z]+)(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const daysText = match[1];
                    const timeText = match[2] || '';
                    
                    // Check if this contains day names
                    const hasDays = /monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun/i.test(daysText);
                    
                    if (!hasDays) return null;
                    
                    const days = this.parseWeekdays(daysText);
                    
                    if (days.length === 0) return null;
                    
                    const time = this.parseTime(text) || { hour: 9, minute: 0 };
                    
                    return `${time.minute} ${time.hour} * * ${days.join(',')}`;
                }
            },
            
            // Every X minutes/hours
            {
                regex: /every (\d+) (?:minute|minutes|min|mins)/i,
                handler: (match) => `*/${match[1]} * * * *`
            },
            {
                regex: /every (\d+) (?:hour|hours|hr|hrs)/i,
                handler: (match) => `0 */${match[1]} * * *`
            },
            {
                regex: /every minute/i,
                handler: () => `* * * * *`
            },
            {
                regex: /every hour/i,
                handler: () => `0 * * * *`
            },
            
            // Weekdays/Weekends with optional time
            {
                regex: /(?:every\s+)?(?:weekday|weekdays|monday through friday|mon-fri)(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const time = this.parseTime(text) || { hour: 9, minute: 0 };
                    return `${time.minute} ${time.hour} * * 1-5`;
                }
            },
            {
                regex: /(?:every\s+)?(?:weekend|weekends|saturday and sunday|sat and sun)(?:\s+at\s+)?(.+)?/i,
                handler: (match, text) => {
                    const time = this.parseTime(text) || { hour: 10, minute: 0 };
                    return `${time.minute} ${time.hour} * * 6,0`;
                }
            },
            
            // Specific day with time (must come before single day patterns)
            {
                regex: /(?:every\s+)?(?:on\s+)?(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\s+at\s+(\d+)(?::(\d+))?\s*(am|pm)/i,
                handler: (match) => {
                    const dayName = match[1].toLowerCase();
                    const dayNum = this.weekdayMap[dayName];
                    let hour = parseInt(match[2]);
                    const minute = match[3] ? parseInt(match[3]) : 0;
                    const period = match[4].toLowerCase();
                    
                    if (period === 'pm' && hour !== 12) hour += 12;
                    if (period === 'am' && hour === 12) hour = 0;
                    
                    return `${minute} ${hour} * * ${dayNum}`;
                }
            },
            
            // Single day without time
            {
                regex: /(?:every\s+)?(?:on\s+)?(monday|mon)(?!\s+and)(?!\s*,)/i,
                handler: () => `0 9 * * 1`
            },
            {
                regex: /(?:every\s+)?(?:on\s+)?(tuesday|tue)(?!\s+and)(?!\s*,)/i,
                handler: () => `0 9 * * 2`
            },
            {
                regex: /(?:every\s+)?(?:on\s+)?(wednesday|wed)(?!\s+and)(?!\s*,)/i,
                handler: () => `0 9 * * 3`
            },
            {
                regex: /(?:every\s+)?(?:on\s+)?(thursday|thu)(?!\s+and)(?!\s*,)/i,
                handler: () => `0 9 * * 4`
            },
            {
                regex: /(?:every\s+)?(?:on\s+)?(friday|fri)(?!\s+and)(?!\s*,)/i,
                handler: () => `0 9 * * 5`
            },
            {
                regex: /(?:every\s+)?(?:on\s+)?(saturday|sat)(?!\s+and)(?!\s*,)/i,
                handler: () => `0 9 * * 6`
            },
            {
                regex: /(?:every\s+)?(?:on\s+)?(sunday|sun)(?!\s+and)(?!\s*,)/i,
                handler: () => `0 9 * * 0`
            },
            {
                regex: /(?:every\s+)?(?:on\s+)?(sunday|sun)(?!\s+and)(?!\s*,)/i,
                handler: () => `0 9 * * 0`
            },
            
            // Daily with time
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
            },
            
            // Just a time (applies to every day)
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
            
            // Monthly
            {
                regex: /first day of (?:the\s+)?(?:every\s+)?month/i,
                handler: () => `0 0 1 * *`
            },
            {
                regex: /last day of (?:the\s+)?(?:every\s+)?month/i,
                handler: () => `0 0 L * *`
            },
            
            // Special times
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

    parse(text) {
        text = text.trim();
        
        if (!text) {
            return null;
        }

        for (let pattern of this.patterns) {
            const match = text.match(pattern.regex);
            if (match) {
                const result = pattern.handler(match, text);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    }
}

class CronChecker {
    constructor() {
        this.cronInput = document.getElementById('cronInput');
        this.naturalInput = document.getElementById('naturalInput');
        this.errorMessage = document.getElementById('errorMessage');
        this.errorText = document.getElementById('errorText');
        this.explanationContent = document.getElementById('explanationContent');
        this.scheduleContent = document.getElementById('scheduleContent');
        this.resultsSection = document.getElementById('resultsSection');
        this.examplesSection = document.getElementById('examplesSection');
        
        // Mode toggle elements
        this.naturalModeBtn = document.getElementById('naturalModeBtn');
        this.cronModeBtn = document.getElementById('cronModeBtn');
        this.convertedCron = document.getElementById('convertedCron');
        this.convertedCronCode = document.getElementById('convertedCronCode');
        this.copyCronBtn = document.getElementById('copyCronBtn');
        this.formatHint = document.getElementById('formatHint');
        
        // Current mode
        this.currentMode = 'natural';
        
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

        // Natural language parser
        this.nlParser = new NaturalLanguageParser();

        this.init();
    }

    init() {
        // Real-time input listeners
        this.cronInput.addEventListener('input', (e) => {
            this.handleCronInput(e.target.value);
        });

        this.naturalInput.addEventListener('input', (e) => {
            this.handleNaturalInput(e.target.value);
        });

        // Mode toggle
        this.naturalModeBtn.addEventListener('click', () => {
            this.switchMode('natural');
        });

        this.cronModeBtn.addEventListener('click', () => {
            this.switchMode('cron');
        });

        // Copy button
        this.copyCronBtn.addEventListener('click', () => {
            this.copyCronToClipboard();
        });

        // Copy button
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

        // Initial state
        this.showExamples();
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        if (mode === 'natural') {
            this.naturalModeBtn.classList.add('active');
            this.cronModeBtn.classList.remove('active');
            this.naturalInput.style.display = 'block';
            this.cronInput.style.display = 'none';
            this.formatHint.textContent = 'Try: "every 5 minutes", "weekdays at 9am", "on Monday and Friday"';
            this.naturalInput.focus();
            
            // Clear and reset
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
            this.formatHint.textContent = 'Format: minute hour day month weekday';
            this.cronInput.focus();
            
            // Clear and reset
            const value = this.cronInput.value.trim();
            if (value) {
                this.handleCronInput(value);
            } else {
                this.showExamples();
            }
        }
    }

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
                const parsed = this.parseCron(cronExpression);
                this.displayResults(parsed, cronExpression);
                this.hideError();
            } catch (error) {
                this.showError(error.message);
                this.hideResults();
            }
        } else {
            this.convertedCron.style.display = 'none';
            this.showError('Could not understand that expression. Try: "every 5 minutes", "weekdays at 9am", "on Monday and Friday"');
            this.hideResults();
        }
    }

    copyCronToClipboard() {
        const cronText = this.convertedCronCode.textContent;
        navigator.clipboard.writeText(cronText).then(() => {
            this.copyCronBtn.classList.add('copied');
            this.copyCronBtn.innerHTML = '<i class="fas fa-check"></i>';
            
            setTimeout(() => {
                this.copyCronBtn.classList.remove('copied');
                this.copyCronBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });
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
    new AnimatedBackground();
    new CronChecker();
});