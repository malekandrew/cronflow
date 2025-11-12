<div align="center">

# ⚡ CronFlow - Quick Start Guide

Get up and running with CronFlow in under 2 minutes!

</div>

---

## 🚀 Installation & Setup

### Step 1: Get the Code

```bash
# Clone the repository
git clone https://github.com/yourusername/cronflow.git

# Navigate to the project directory
cd cronflow
```

### Step 2: Start a Local Server

CronFlow uses ES6 modules, which require serving files over HTTP. Choose your preferred method:

#### Option A: Node.js with npx (Recommended)
```bash
npx http-server -p 8080
```
> No installation needed! `npx` comes with Node.js 5.2+ and runs packages directly.

#### Option B: Python
```bash
python3 -m http.server 8080
```
> Great if you have Python installed (most macOS/Linux systems do).

### Step 3: Open in Browser

Navigate to: **[http://localhost:8080](http://localhost:8080)**

> ⚠️ **Important**: Do not open `index.html` directly with `file://` protocol - this will cause CORS errors with ES6 modules.

---

## ✅ Verify Installation

### Check Console Output

1. Open browser DevTools (`F12` or `Cmd+Option+I`)
2. Go to the **Console** tab
3. You should see:
   ```
   CronFlow initialized successfully
   ```

### Check Network Tab

In DevTools **Network** tab, verify these files loaded successfully (status 200):
- ✅ `index.html`
- ✅ `styles.css`
- ✅ `js/app.js`
- ✅ `js/constants.js`
- ✅ `js/AnimatedBackground.js`
- ✅ `js/CronChecker.js`
- ✅ `js/SemanticNLPEngine.js` 🆕
- ✅ `js/NLPToCronConverter.js` 🆕
- ✅ `js/NaturalLanguageParser.js`
- ✅ `js/CronParser.js`
- ✅ `js/CronScheduler.js`
- ✅ `js/CronExplanationGenerator.js`
- ✅ `node_modules/compromise/...` 🆕
- ✅ `node_modules/chrono-node/...` 🆕

---

## 🎮 Using CronFlow

### Natural Language Mode (Default)

CronFlow uses advanced NLP (compromise.js + chrono-node) to understand complex phrases:

**Simple Intervals:**
- Type: `every 5 minutes`
- Result: `*/5 * * * *`

- Type: `every couple of hours`
- Result: `0 */2 * * *`

**Daily Schedules:**
- Type: `daily at 3pm`
- Result: `0 15 * * *`

- Type: `business days at 9am`
- Result: `0 9 * * 1-5`

**Weekly Schedules:**
- Type: `weekdays at 9am`
- Result: `0 9 * * 1-5`

- Type: `Monday to Friday at 9:30am`
- Result: `30 9 * * 1-5`

- Type: `every Monday and Friday at 2:30pm`
- Result: `30 14 * * 1,5`

**Complex Multi-Component:**
- Type: `every monday and thursday at 10am in January to April`
- Result: `0 10 * 1,2,3,4 1,4`

- Type: `every weekday at 10am in June to August`
- Result: `0 10 * 6,7,8 1-5`

**Monthly:**
- Type: `once a month`
- Result: `0 0 1 * *`

- Type: `on the 15th of each month at 3pm`
- Result: `0 15 15 * *`

- Type: `at the start of every month`
- Result: `0 0 1 * *`

**Yearly:**
- Type: `quarterly at midnight`
- Result: `0 0 1 */3 *`

- Type: `annually on December 25th at midnight`
- Result: `0 0 25 12 *`

**Word Numbers & Smart Parsing:**
- Type: `every five minutes` (word → number)
- Result: `*/5 * * * *`

- Type: `every other day at noon`
- Result: `0 12 */2 * *`

> 💡 **Tip**: If no time is specified, it defaults to midnight (00:00)
> Example: "every Monday" → `0 0 * * 1`

### Cron Expression Mode

1. Click the **"Cron Expression"** button
2. Enter a standard cron expression
3. See the human-readable explanation

**Try these:**
```
*/5 * * * *          → Every 5 minutes
0 9 * * 1-5          → Weekdays at 9:00 AM
30 14 * * 1,5        → Monday and Friday at 2:30 PM
0 0 1 * *            → First day of month at midnight
0 15 1 1,4,7,10 *    → Quarterly at 3:00 PM
```

### Click Example Buttons

Both modes have pre-configured examples. Click any example button to:
- Auto-fill the input
- Switch to the appropriate mode
- Display results immediately

---

## 🔍 Features to Explore

### 1. **Real-time Validation**
   - Type any cron expression or natural language
   - See instant feedback and error messages

### 2. **Human-Readable Explanation**
   - Every cron expression gets a plain English explanation
   - Example: `*/5 * * * *` → "Runs every 5 minutes"

### 3. **Next Execution Schedule**
   - View the next 5 execution times
   - See relative time (e.g., "in 5 minutes", "in 2 hours")

### 4. **Field Breakdown**
   - Understand each cron field individually:
     - Minute (0-59)
     - Hour (0-23)
     - Day of Month (1-31)
     - Month (1-12)
     - Weekday (0-7)

### 5. **Copy to Clipboard**
   - Click the copy button next to converted cron expressions
   - Instant clipboard copy with visual feedback

### 6. **Interactive Background**
   - Move your cursor around the page
   - Watch particles react to your mouse movement
   - Subtle and non-intrusive animation

---

## 🐛 Troubleshooting

### ❌ "Failed to load module" Error

**Problem**: Browser shows module loading errors  
**Solution**: 
- Make sure you're using `http://localhost:8080`, not `file:///path/to/index.html`
- A web server is required for ES6 modules
- Try a different server option (Python, Node.js, or PHP)

### ❌ Blank Page

**Problem**: Page loads but nothing appears  
**Solution**:
1. Open DevTools Console (`F12`)
2. Look for JavaScript errors
3. Check Network tab for failed file loads (404 errors)
4. Verify file structure matches expected layout

### ❌ "Cannot read properties of null"

**Problem**: Console shows element not found errors  
**Solution**:
- Clear browser cache and reload
- Verify `index.html` hasn't been modified
- Check that all element IDs are present in HTML

### ❌ Server Port Already in Use

**Problem**: Port 8080 is already occupied  
**Solution**:
```bash
# Use a different port
python3 -m http.server 8081
# Then open http://localhost:8081
```

---

## 📂 Project Structure

```
cronflow/
├── index.html              # Main HTML file
├── styles.css              # All styles and animations
├── js/                     # JavaScript modules
│   ├── app.js             # Entry point (initializes everything)
│   ├── constants.js       # Configuration constants
│   ├── AnimatedBackground.js
│   ├── CronChecker.js     # Main UI logic
│   ├── NaturalLanguageParser.js
│   ├── CronParser.js
│   ├── CronScheduler.js
│   └── CronExplanationGenerator.js
├── README.md              # Full documentation
├── QUICK_START.md         # This file
└── REFACTORING_SUMMARY.md # Technical details
```

---

## 🎯 Next Steps

### For Users
1. ✅ Bookmark the page for easy access
2. ✅ Try all natural language examples
3. ✅ Experiment with complex schedules
4. ✅ Use it for your actual cron jobs!

### For Developers
1. 📖 Read the [full README](README.md) for API documentation
2. 🔍 Explore the modular code structure
3. 🛠️ Check [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) for architecture details
4. 🤝 Consider contributing improvements

---

## 💡 Pro Tips

- **Combine patterns**: Try "every Monday and Friday at 9:30am"
- **Use the help button**: Click the `?` icon for a quick reference
- **Switch modes freely**: Toggle between natural language and cron syntax
- **Copy instantly**: Use the copy button for quick clipboard access
- **Watch the animation**: The subtle particle background reacts to your mouse!

---

<div align="center">

**Ready to master cron expressions?** 🎉

[📚 Full Documentation](README.md) • [🐛 Report Issues](https://github.com/yourusername/cronflow/issues) • [⭐ Star on GitHub](https://github.com/yourusername/cronflow)

</div>

[⭐ Star on GitHub](https://github.com/yourusername/cronflow)

</div>
