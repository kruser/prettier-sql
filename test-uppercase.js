const prettier = require('prettier');
const fs = require('fs');

const sqlContent = fs.readFileSync('./examples/function-case.sql', 'utf8');

// Format with uppercase function names
prettier.format(sqlContent, {
  parser: 'sql',
  plugins: ['./src/index.js'],
  sqlKeywordsCase: 'uppercase',
  sqlFunctionsCase: 'uppercase'
}).then(result => {
  console.log("==== RESULT WITH UPPERCASE FUNCTIONS ====");
  console.log(result);
  console.log("========================================");
});
