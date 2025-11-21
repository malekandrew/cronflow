<div align="center">

# ⏰ CronFlow

**Master your cron expressions with natural language and real-time feedback**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![ES6 Modules](https://img.shields.io/badge/ES6-Modules-green)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://malekandrew.github.io/cronflow/)

**[🚀 Live Demo](https://malekandrew.github.io/cronflow/)** | [Features](#-features) | [Architecture](#-architecture) | [Local Setup](#-local-development) | [Documentation](#-documentation)

---

</div>

## 🌟 Features

- **🗣️ Advanced Natural Language Processing**: Powered by compromise.js and chrono-node with intelligent regex fallback
- **🧠 Complex Multi-Part Phrases**: Parse schedules like "every monday and thursday at 10am in January to April"
- **🔢 Word Number Support**: Understand "every five minutes", "every couple of hours", "every dozen days"
- **📅 Date Range Parsing**: Handle "Monday to Friday", "January to March", with wrap-around support
- **🕐 Smart Time Defaults**: Omitted times automatically default to midnight (00:00)
- **🌓 Light/Dark Mode Toggle**: Seamless theme switching with localStorage persistence
- **✅ Real-time Validation**: Instant feedback on cron expression validity with human-readable explanations
- **⏭️ Next Execution Times**: View the next 5 scheduled runs with relative time formatting
- **🔍 Field Breakdown**: Detailed component analysis (minute, hour, day, month, weekday)
- **✨ Interactive Background**: Subtle particle animation that responds to cursor movement
- **📋 Copy to Clipboard**: One-click copy of generated cron expressions
- **🎨 Modern UI**: Clean, responsive design with smooth animations

## 🚀 Try It Now

**Live Demo:** [https://malekandrew.github.io/cronflow/](https://malekandrew.github.io/cronflow/)

No installation required! CronFlow uses CDN-hosted dependencies and runs entirely in your browser.

## 💻 Local Development

### Prerequisites

- A modern web browser (Chrome 61+, Firefox 60+, Safari 11+, or Edge 16+)
- Node.js or Python 3 (for local server)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/malekandrew/cronflow.git
   cd cronflow
   ```

2. **Start a local server**
   
   Choose one of the following methods:
   
   **Node.js (Recommended):**
   ```bash
   npm start
   # or
   npx http-server -p 8080
   ```
   
   **Python:**
   ```bash
   python3 -m http.server 8080
   ```

3. **Open in browser**
   
   Navigate to [http://localhost:8080](http://localhost:8080)

> **Note:** A web server is required because the application uses ES6 modules, which need HTTP protocol (not `file://`).

### Dependencies

CronFlow uses **CDN-hosted dependencies** (compromise.js and chrono-node) - no `npm install` required! This enables:
- ✅ Zero-config deployment to any static host
- ✅ Fast loading via global CDN edge caching
- ✅ No build step or bundler needed
- ✅ Pure ES6 modules running directly in browser

## 📸 Screenshots

### Natural Language Mode
Type in plain English and see the cron expression generated instantly:

**Simple Intervals:**
- "every 5 minutes" → `*/5 * * * *`
- "every couple of hours" → `0 */2 * * *`

**Scheduled Times:**
- "weekdays at 9am" → `0 9 * * 1-5`
- "Monday to Friday at 9:30am" → `30 9 * * 1-5`
- "every Monday and Friday at 2:30pm" → `30 14 * * 1,5`

**Complex Schedules:**
- "every monday and thursday at 10am in January to April" → `0 10 * 1,2,3,4 1,4`
- "business days at 9am" → `0 9 * * 1-5`
- "every weekday at 10am in June to August" → `0 10 * 6,7,8 1-5`

**Monthly & Yearly:**
- "quarterly at midnight" → `0 0 1 */3 *`
- "on the 15th of each month at 3pm" → `0 15 15 * *`
- "at the start of every month" → `0 0 1 * *`
- "annually on December 25th at midnight" → `0 0 25 12 *`

**Special Cases:**
- "every Monday" (defaults to midnight) → `0 0 * * 1`
- "daily at midnight" → `0 0 * * *`
- "every other day at noon" → `0 12 */2 * *`

### Cron Expression Mode
Enter standard cron expressions and get human-readable explanations with execution schedules.

## 🏗️ Architecture

CronFlow follows a modular architecture with clear separation of concerns:

```mermaid
graph TB
    subgraph "Entry Point"
        A[app.js]
    end
    
    subgraph "UI Layer"
        B[CronChecker.js]
        C[AnimatedBackground.js]
    end
    
    subgraph "NLP Layer - NEW"
        D[SemanticNLPEngine.js<br/>compromise.js + chrono-node]
        E[NLPToCronConverter.js]
    end
    
    subgraph "Parser Layer"
        F[NaturalLanguageParser.js<br/>Hybrid: NLP + Regex]
        G[CronParser.js]
    end
    
    subgraph "Logic Layer"
        H[CronScheduler.js]
        I[CronExplanationGenerator.js]
    end
    
    subgraph "Configuration"
        J[constants.js]
    end
    
    A --> B
    A --> C
    B --> F
    B --> G
    B --> H
    B --> I
    F --> D
    F --> E
    D --> J
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J
    C --> J
    
    style A fill:#667eea
    style B fill:#764ba2
    style C fill:#4fd1c7
    style D fill:#10b981
    style E fill:#10b981
    style F fill:#f093fb
    style G fill:#f5576c
    style H fill:#feca57
    style I fill:#48dbfb
    style J fill:#ff9ff3
````

### Module Responsibilities

| Module | Purpose | Lines |
|--------|---------|-------|
| **app.js** | Application entry point and initialization | 17 |
| **constants.js** | Centralized configuration and constants | 95 |
| **AnimatedBackground.js** | Canvas particle animation system | 228 |
| **SemanticNLPEngine.js** | 🆕 Advanced NLP using compromise + chrono-node | 507 |
| **NLPToCronConverter.js** | 🆕 Converts structured NLP to cron expressions | 400 |
| **NaturalLanguageParser.js** | Hybrid parser (NLP primary, regex fallback) | 504 |
| **CronParser.js** | Cron expression parsing and validation | 271 |
| **CronScheduler.js** | Execution time calculations | 141 |
| **CronExplanationGenerator.js** | Human-readable descriptions | 155 |
| **CronChecker.js** | Main UI orchestration and event handling | 490 |

### Component Interaction Flow

```mermaid
sequenceDiagram
    participant U as User
    participant UI as CronChecker
    participant NL as NaturalLanguageParser
    participant SE as SemanticNLPEngine
    participant NC as NLPToCronConverter
    participant CP as CronParser
    participant CS as CronScheduler
    participant CE as CronExplanationGenerator
    
    U->>UI: Type "every monday and thursday at 10am"
    UI->>NL: parse(text)
    NL->>SE: parse(text)
    SE-->>NL: {time, weekdays, months, ...}
    NL->>NC: convert(nlpResult)
    NC-->>NL: "0 10 * * 1,4"
    alt NLP Success
        NL-->>UI: "0 10 * * 1,4"
    else NLP Failed
        NL->>NL: parseWithRegex(text)
        NL-->>UI: Regex result
    end
    UI->>CP: parse("0 10 * * 1,4")
    CP-->>UI: {parsed cron object}
    UI->>CE: generateExplanation(parsed)
    CE-->>UI: "Runs every Monday and Thursday at 10:00 AM"
    UI->>CS: generateNextExecutions(parsed)
    CS-->>UI: [Date, Date, Date, ...]
    UI->>U: Display results
```

## 📁 Project Structure

```
cronflow/
├── index.html                          # Main HTML file
├── styles.css                          # Complete styling and animations
├── js/                                 # Modular JavaScript files
│   ├── app.js                         # Application entry point
│   ├── constants.js                   # Configuration and constants
│   ├── AnimatedBackground.js          # Particle animation system
│   ├── SemanticNLPEngine.js           # 🆕 Advanced NLP parser (compromise + chrono)
│   ├── NLPToCronConverter.js          # 🆕 NLP result to cron converter
│   ├── NaturalLanguageParser.js       # Hybrid parser (NLP + regex fallback)
│   ├── CronParser.js                  # Cron expression parser/validator
│   ├── CronScheduler.js               # Execution time calculator
│   ├── CronExplanationGenerator.js    # Human-readable descriptions
│   └── CronChecker.js                 # Main application orchestrator
├── package.json                        # Dependencies (compromise, chrono-node)
├── README.md                          # Project documentation
├── QUICK_START.md                     # Quick start guide
└── CONTRIBUTING.md                    # Contributing guidelines
```

## 📚 Documentation

### Natural Language Patterns

CronFlow uses advanced NLP (compromise.js + chrono-node) with regex fallback to support complex patterns:

#### Time-Based Intervals
- `every N minutes/hours` → `*/N * * * *` or `0 */N * * *`
- `every minute/hour/day` → `* * * * *`, `0 * * * *`, `0 0 * * *`
- `every five minutes` → `*/5 * * * *` (word numbers supported)
- `every couple of hours` → `0 */2 * * *`
- `every other day` → `0 0 */2 * *`

#### Daily Schedules
- `daily at 3pm` → `0 15 * * *`
- `every day at 9:30am` → `30 9 * * *`
- `business days at 9am` → `0 9 * * 1-5`

#### Weekly Schedules
- `every Monday` → `0 0 * * 1` (defaults to midnight)
- `every Monday at 9am` → `0 9 * * 1`
- `weekdays at 9am` → `0 9 * * 1-5`
- `Monday to Friday at 9:30am` → `30 9 * * 1-5` (range support)
- `every Monday and Friday at 2:30pm` → `30 14 * * 1,5`
- `every saturday and sunday at 8am` → `0 8 * * 0,6`

#### Monthly Schedules
- `once a month` → `0 0 1 * *`
- `on the 15th of each month at 3pm` → `0 15 15 * *`
- `at the start of every month` → `0 0 1 * *`
- `first monday of every month` → `0 0 1-7 * 1` (approximation)

#### Complex Multi-Component Schedules
- `every monday and thursday at 10am in January to April` → `0 10 * 1,2,3,4 1,4`
- `every Tuesday and Thursday in March` → `0 0 * 3 2,4`
- `every weekday at 10am in June to August` → `0 10 * 6,7,8 1-5`

#### Yearly Schedules
- `quarterly at midnight` → `0 0 1 */3 *`
- `annually on December 25th at midnight` → `0 0 25 12 *`

### NLP Features

**Word-to-Number Conversion:**
- "five minutes" → 5
- "couple of hours" → 2
- "dozen" → 12

**Smart Normalization:**
- "business days" → "weekdays"
- "mon-fri" → "Monday to Friday"
- "every other" → "every 2"

**Date Range Support:**
- "Monday to Friday" → weekdays 1-5
- "January to March" → months 1,2,3
- Wrap-around: "November to February" → 11,12,1,2

**Default Time:**
- Phrases without explicit times default to 00:00 (midnight)
- Example: "every Monday" → `0 0 * * 1`

### Cron Expression Format

Standard 5-field cron format:
```
* * * * *
│ │ │ │ │
│ │ │ │ └─── Weekday (0-7, 0 and 7 = Sunday)
│ │ │ └───── Month (1-12)
│ │ └─────── Day of Month (1-31)
│ └───────── Hour (0-23)
└─────────── Minute (0-59)
```

#### Special Characters
- `*` - Any value
- `,` - List (e.g., `1,3,5`)
- `-` - Range (e.g., `1-5`)
- `/` - Step (e.g., `*/5` or `1-10/2`)

### API Reference

#### CronParser

```javascript
import { CronParser } from './js/CronParser.js';

// Parse a cron expression
const parsed = CronParser.parse('*/5 * * * *');
// Returns: { minute: {...}, hour: {...}, day: {...}, month: {...}, weekday: {...} }
```

#### NaturalLanguageParser

```javascript
import { NaturalLanguageParser } from './js/NaturalLanguageParser.js';

const parser = new NaturalLanguageParser();
const cron = parser.parse('every 5 minutes');
// Returns: '*/5 * * * *'
```

#### CronScheduler

```javascript
import { CronScheduler } from './js/CronScheduler.js';

const executions = CronScheduler.generateNextExecutions(parsed);
// Returns: [Date, Date, Date, Date, Date]
```

## 🛠️ Development

### Code Quality

The codebase follows modern JavaScript best practices:

- ✅ **ES6+ Features**: Classes, modules, arrow functions, template literals
- ✅ **Modular Architecture**: Single responsibility principle
- ✅ **JSDoc Documentation**: Comprehensive inline documentation
- ✅ **DRY Principle**: No code duplication
- ✅ **Descriptive Naming**: Self-documenting code
- ✅ **Error Handling**: Centralized error messages
- ✅ **Constants Extraction**: No magic numbers

### Testing

You can test individual modules in the browser console:

```javascript
// Test natural language parsing
import { NaturalLanguageParser } from './js/NaturalLanguageParser.js';
const parser = new NaturalLanguageParser();
console.log(parser.parse('every Monday at 3pm')); // "0 15 * * 1"

// Test cron parsing
import { CronParser } from './js/CronParser.js';
console.log(CronParser.parse('0 9 * * 1-5'));
```

### Adding New Features

1. Create a new module in `/js` folder
2. Import required dependencies
3. Export your class or functions
4. Import in the relevant module
5. Update documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Examples

### Common Cron Patterns

| Description | Natural Language | Cron Expression |
|-------------|------------------|-----------------|
| Every 5 minutes | `every 5 minutes` | `*/5 * * * *` |
| Every hour | `every hour` | `0 * * * *` |
| Daily at midnight | `daily at midnight` | `0 0 * * *` |
| Weekdays at 9am | `weekdays at 9am` | `0 9 * * 1-5` |
| Every Monday | `every Monday` | `0 9 * * 1` |
| First of month | `once a month` | `0 0 1 * *` |
| Quarterly | `quarterly` | `0 0 1 1,4,7,10 *` |
| Yearly | `once a year` | `0 0 1 1 *` |

## 🐛 Troubleshooting

### Module Loading Errors

**Problem:** `Failed to load module` or CORS errors  
**Solution:** Ensure you're using a web server (http://), not opening files directly (file://)

### Blank Page

**Problem:** Page loads but shows nothing  
**Solution:** Check browser console for errors. Verify all files are in correct locations.

### Element Not Found Errors

**Problem:** `Cannot read properties of null`  
**Solution:** Verify HTML element IDs match JavaScript selectors in CronChecker.js

## 🌐 Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome | 61+ |
| Firefox | 60+ |
| Safari | 11+ |
| Edge | 16+ |

ES6 modules and modern JavaScript features are required.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with vanilla JavaScript (no frameworks!)
- NLP powered by [compromise.js](https://github.com/spencermountain/compromise) and [chrono-node](https://github.com/wanasit/chrono)
- Dependencies served via [jsDelivr CDN](https://www.jsdelivr.com/)
- Animated background powered by Canvas API
- Icons from [Font Awesome](https://fontawesome.com/)
- Fonts from [Google Fonts](https://fonts.google.com/) (Inter, Orbitron)
- Hosted on [GitHub Pages](https://pages.github.com/)

## 📧 Contact

For questions or feedback, please [open an issue](https://github.com/malekandrew/cronflow/issues) on GitHub.

---

<div align="center">

**Made with ❤️ using GitHub Copilot**

[🌐 Live Demo](https://malekandrew.github.io/cronflow/) • [⭐ Star on GitHub](https://github.com/malekandrew/cronflow) • [🐛 Report Bug](https://github.com/malekandrew/cronflow/issues)

</div>
