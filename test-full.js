import { NaturalLanguageParser } from './js/NaturalLanguageParser.js';

const parser = new NaturalLanguageParser();

const test1 = 'every monday and thursday at 10am in January to April';
console.log('\nTest 1:', test1);
const cron1 = parser.parse(test1);
console.log('Result:', cron1);
console.log('Parser used:', parser.getLastParserUsed());

const test2 = 'Monday to Friday at 9:30am';
console.log('\nTest 2:', test2);
const cron2 = parser.parse(test2);
console.log('Result:', cron2);
console.log('Parser used:', parser.getLastParserUsed());
