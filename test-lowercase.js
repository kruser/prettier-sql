const prettier = require('prettier');
const fs = require('fs');

const sqlContent = fs.readFileSync('./examples/function-case.sql', 'utf8');

// Format with lowercase function names
prettier.format(sqlContent, {
  parser: 'sql',
  plugins: ['./src/index.js'],
  sqlKeywordsCase: 'uppercase',
  sqlFunctionsCase: 'lowercase'
}).then(result => {
  console.log("==== RESULT WITH LOWERCASE FUNCTIONS ====");
  console.log(result);
  console.log("========================================");
});
