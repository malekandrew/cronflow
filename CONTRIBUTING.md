# Contributing to CronFlow

First off, thank you for considering contributing to CronFlow! 🎉

## Code of Conduct

This project and everyone participating in it is governed by respect, inclusivity, and collaboration. By participating, you are expected to uphold these values.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Browser and version** you're using
- **Console errors** from DevTools

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

- **Clear description** of the enhancement
- **Use cases** for the feature
- **Mockups or examples** if applicable
- **Implementation ideas** (optional)

### Pull Requests

1. **Fork the repository**
   ```bash
   git clone https://github.com/malekandrew/cronflow.git
   cd cronflow
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add JSDoc comments to new functions/classes
   - Test your changes thoroughly
   - Update documentation if needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```
   
   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding or updating tests
   - `chore:` - Maintenance tasks

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub.

## Development Guidelines

### Code Style

- **Use ES6+ features**: Classes, arrow functions, template literals
- **Modular design**: One class per file, single responsibility
- **JSDoc comments**: Document all public methods and classes
- **Descriptive naming**: Use clear, self-documenting names
- **No magic numbers**: Extract constants to `constants.js`
- **Error handling**: Provide user-friendly error messages

### Example Code Style

```javascript
/**
 * Parse a natural language time expression
 * @param {string} text - Natural language text
 * @returns {string|null} Cron expression or null if parsing fails
 */
parseTime(text) {
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    
    if (!timeMatch) {
        return null;
    }
    
    // Implementation...
}
```

### File Structure

When adding new modules:

```javascript
/**
 * ModuleName - Brief description
 * Detailed explanation of what this module does
 */

import { CONFIG } from './constants.js';

export class ModuleName {
    /**
     * Constructor description
     * @param {Type} param - Parameter description
     */
    constructor(param) {
        // Implementation
    }
    
    /**
     * Method description
     * @param {Type} param - Parameter description
     * @returns {Type} Return value description
     */
    methodName(param) {
        // Implementation
    }
}
```

### Testing

Before submitting a PR:

1. **Manual testing**
   - Test all natural language patterns
   - Test various cron expressions
   - Test error cases
   - Check in multiple browsers

2. **Browser console**
   - No JavaScript errors
   - All modules load successfully
   - "CronFlow initialized successfully" message appears

3. **Network tab**
   - All files load (no 404s)
   - No CORS errors

### Areas We'd Love Help With

- 🧪 **Unit tests**: Add testing framework and write tests
- 🌍 **Internationalization**: Support for multiple languages
- 🎨 **Themes**: Dark mode, custom color schemes
- 📱 **Mobile UX**: Improve mobile experience
- ⌨️ **Keyboard shortcuts**: Add keyboard navigation
- 📊 **More patterns**: Support additional natural language patterns
- ♿ **Accessibility**: Improve ARIA labels, screen reader support
- 📚 **Documentation**: Improve or translate documentation

## Project Structure

```
cronflow/
├── index.html                          # Main HTML
├── styles.css                          # All styles
├── js/                                 # JavaScript modules
│   ├── app.js                         # Entry point
│   ├── constants.js                   # Configuration
│   ├── AnimatedBackground.js          # Canvas animation
│   ├── CronChecker.js                 # Main UI logic
│   ├── NaturalLanguageParser.js       # NLP engine
│   ├── CronParser.js                  # Cron parsing
│   ├── CronScheduler.js               # Schedule calculator
│   └── CronExplanationGenerator.js    # Human-readable output
├── README.md                          # Main documentation
├── QUICK_START.md                     # Quick start guide
├── CONTRIBUTING.md                    # This file
└── LICENSE                            # MIT License
```

## Questions?

Feel free to open an issue with the `question` label if you need clarification on anything!

## Recognition

Contributors will be recognized in the README. Thank you for making CronFlow better! 🙌
