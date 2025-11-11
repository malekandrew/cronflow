# CronFlow - GitHub Copilot Instructions

## Project Overview
CronFlow is a vanilla JavaScript (ES6+) web application that converts natural language to cron expressions. Pure client-side, no build process, uses ES6 modules directly in browser.

## Architecture

### Module System & Dependencies
- **ES6 modules** - All files use `import`/`export`, loaded with `<script type="module">`
- **No bundler** - Code runs directly in browser, requires HTTP server (not `file://`)
- **Single entry point** - `js/app.js` initializes AnimatedBackground and CronChecker
- **Dependency flow**: CronChecker → (NaturalLanguageParser, CronParser, CronScheduler, CronExplanationGenerator) → constants.js

### Key Components

**1. CronChecker (js/CronChecker.js)** - Main orchestrator
- Manages two input modes: natural language and cron expression
- Pattern: Constructor initializes DOM refs, event listeners, then calls `showExamples()`
- Uses composition, not inheritance: instantiates NaturalLanguageParser, imports static utility classes
- HTML element IDs are **camelCase** (e.g., `naturalInput`, `cronInput`, `convertedCron`)

**2. NaturalLanguageParser (js/NaturalLanguageParser.js)** - Pattern-based NLP
- `patterns` array with regex + handler functions (see `initializePatterns()`)
- Evaluates patterns sequentially until first match
- Time parsing: supports `3pm`, `14:30`, `9:30am`, special words like `midnight`/`noon`
- Weekday parsing: handles logical operators (`and`, `or`, comma-separated)
- Returns cron string or `null` if no pattern matches

**3. CronParser (js/CronParser.js)** - Static utility class
- Validates and parses standard 5-field cron: `minute hour day month weekday`
- Field types: `any` (*), `value` (5), `range` (1-5), `list` (1,3,5), `step` (*/5), `rangeStep` (1-10/2)
- Returns structured object: `{ minute: {...}, hour: {...}, day: {...}, month: {...}, weekday: {...} }`

**4. CronScheduler (js/CronScheduler.js)** - Execution calculator
- Two-phase lookahead: quick scan (100 minutes), then thorough scan (7 days)
- `matchesCron()` checks if Date matches parsed cron fields
- `getRelativeTime()` formats human-readable time ("in 5 minutes", "in 2 hours")

**5. AnimatedBackground (js/AnimatedBackground.js)** - Canvas particle system
- Independent lifecycle: instantiated in app.js, doesn't interact with other modules
- Particle count, colors, physics constants in `CONFIG` and `PARTICLE_COLORS`

## Critical Patterns

### Configuration Management
**All magic numbers go in `js/constants.js`**
```javascript
// Good: Extract to constants.js
export const CONFIG = {
    DEFAULT_WEEKDAY_HOUR: 9,
    NEXT_EXECUTIONS_COUNT: 5
};

// Bad: Magic numbers in code
if (executions.length < 5) { ... }  // Use CONFIG.NEXT_EXECUTIONS_COUNT
```

### Error Messages
Use template strings from `ERROR_MESSAGES` object:
```javascript
throw new Error(ERROR_MESSAGES.INVALID_STEP.replace('{{value}}', step));
```

### JSDoc Documentation
All public methods require JSDoc with `@param` and `@returns`:
```javascript
/**
 * Parse natural language to cron expression
 * @param {string} text - Natural language input
 * @returns {string|null} Cron expression or null if parsing fails
 */
parse(text) { ... }
```

### HTML Element Access
Elements are initialized once in `initializeElements()`, stored as instance properties:
```javascript
// Good: Initialize in constructor
this.naturalInput = document.getElementById('naturalInput');

// Bad: Repeated querySelector calls
document.getElementById('naturalInput').value;
```

### Static vs Instance Methods
- **Static** for pure utility functions (CronParser, CronScheduler, CronExplanationGenerator)
- **Instance** for stateful classes (CronChecker, NaturalLanguageParser, AnimatedBackground)

## Development Workflow

### Running Locally
```bash
npx http-server -p 8080  # Recommended
# or: python3 -m http.server 8080
```
Then open http://localhost:8080

### Testing Changes
1. Check browser console for "CronFlow initialized successfully"
2. Verify Network tab shows all `.js` files load (status 200)
3. Test both input modes with examples from `index.html`
4. Check for console errors (none expected)

### Adding Natural Language Patterns
1. Add pattern to `initializePatterns()` array in NaturalLanguageParser.js
2. Pattern object: `{ regex: /.../, handler: (match, text) => 'cron' }`
3. Test with actual input, patterns evaluated in array order (first match wins)
4. Add example to HTML if user-facing

### Adding New Cron Field Types
1. Add validation in `CronParser.validateField()`
2. Add parsing logic in `CronParser.parseField()`
3. Handle in `CronScheduler.matchesField()`
4. Format in `CronExplanationGenerator.formatFieldDescription()`

## Common Gotchas

1. **Module loading requires HTTP server** - `file://` protocol causes CORS errors
2. **HTML IDs are camelCase** - Match exactly: `naturalInput`, not `natural-input`
3. **Cron weekdays: 0 and 7 both = Sunday** - Handle in matching logic
4. **JavaScript months are 0-indexed** - Date.getMonth() returns 0-11, cron uses 1-12
5. **Pattern order matters** - NaturalLanguageParser evaluates patterns sequentially
6. **No build step** - Changes reflect immediately on refresh, no transpilation

## File Structure
```
js/
├── app.js                         # Entry point (17 lines)
├── constants.js                   # All config values (95 lines)
├── CronChecker.js                 # Main UI orchestrator (385 lines)
├── NaturalLanguageParser.js       # Pattern-based NLP (447 lines)
├── CronParser.js                  # Cron validation/parsing (271 lines)
├── CronScheduler.js               # Execution calculator (141 lines)
├── CronExplanationGenerator.js    # Human-readable output (155 lines)
└── AnimatedBackground.js          # Canvas animation (228 lines)
```

## When Adding Features

**New natural language pattern?** → NaturalLanguageParser.js  
**New cron field syntax?** → CronParser.js + CronScheduler.js + CronExplanationGenerator.js  
**New UI component?** → CronChecker.js + index.html + styles.css  
**New config value?** → constants.js  
**Animation change?** → AnimatedBackground.js

Always update JSDoc, maintain single responsibility per module, extract constants.

## Commit Message Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat** - New feature
- **fix** - Bug fix
- **docs** - Documentation only changes
- **style** - Code style changes (formatting, semicolons, etc.)
- **refactor** - Code change that neither fixes a bug nor adds a feature
- **test** - Adding or updating tests
- **chore** - Maintenance tasks (dependencies, build, etc.)

### Scopes (optional but recommended)
- **nlp** - Natural language parser changes
- **ui** - User interface changes
- **branding** - Logo, styling, visual identity
- **animation** - Canvas particle system
- **parser** - Cron parsing logic
- **scheduler** - Execution timing logic

### Examples

**Good commit messages:**
```
feat(nlp): add monthly and yearly natural language patterns

- Support "once a month", "15th of each month"
- Support "quarterly", "once a year"
- Add logical operator support for "Monday and Friday"
- Extend patterns array with 15 additional handlers
```

```
refactor: modularize codebase with ES6 modules

BREAKING CHANGE: Requires HTTP server (ES6 modules)

Split monolithic script.js into 8 focused modules:
- app.js (entry point)
- CronChecker.js (UI orchestration)
- NaturalLanguageParser.js (NLP patterns)
- CronParser.js, CronScheduler.js, CronExplanationGenerator.js
- AnimatedBackground.js, constants.js
```

```
docs: prioritize npx http-server over Python in guides

- Recommend Node.js npx method as primary
- Remove PHP server option (outdated)
- Update both README and QUICK_START
```

**Bad commit messages:**
```
update stuff
fix bug
refactor
WIP
```

### Guidelines
- **Be specific** - "add canvas particle animation" not "add animated background"
- **Quantify changes** - "20+ patterns", "8 modules", "15 additional patterns"
- **Use imperative mood** - "add feature" not "added feature" or "adds feature"
- **List what changed** - Use bullet points for complex commits
- **Explain why** - Add context for architectural decisions
- **Note breaking changes** - Use BREAKING CHANGE footer when applicable
