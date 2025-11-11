/**
 * CronFlow - Main Application Entry Point
 * Initializes all components and starts the application
 */

import { AnimatedBackground } from './AnimatedBackground.js';
import { CronChecker } from './CronChecker.js';

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animated background
    new AnimatedBackground();
    
    // Initialize main cron checker application
    new CronChecker();
    
    console.log('CronFlow initialized successfully');
});
