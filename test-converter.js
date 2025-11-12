import { NLPToCronConverter } from './js/NLPToCronConverter.js';

const converter = new NLPToCronConverter();

const nlpResult = {
  "frequency": null,
  "time": {
    "hour": 10,
    "minute": 0,
    "source": "regex"
  },
  "weekdays": [1, 4],
  "months": [1, 2, 3, 4],
  "dayOfMonth": null,
  "ordinal": null,
  "recurring": "yearly"
};

console.log('NLP Result:', JSON.stringify(nlpResult, null, 2));
const cron = converter.convert(nlpResult);
console.log('\nGenerated Cron:', cron);
