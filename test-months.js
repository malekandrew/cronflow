import { SemanticNLPEngine } from './js/SemanticNLPEngine.js';

const engine = new SemanticNLPEngine();

// Test case 1: Complex phrase with months
const test1 = 'every monday and thursday at 10am in January to April every year';
console.log('\nTest 1:', test1);
const result1 = engine.parse(test1);
console.log('Result:', JSON.stringify(result1, null, 2));

// Test case 2: Simpler with months
const test2 = 'every Tuesday in January to March';
console.log('\nTest 2:', test2);
const result2 = engine.parse(test2);
console.log('Result:', JSON.stringify(result2, null, 2));

// Test case 3: Just months
const test3 = 'in January to April';
console.log('\nTest 3:', test3);
const result3 = engine.parse(test3);
console.log('Result:', JSON.stringify(result3, null, 2));
