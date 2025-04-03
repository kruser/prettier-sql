const prettier = require('prettier');
const fs = require('fs');

const sqlContent = fs.readFileSync('./examples/function-casing.sql', 'utf8');

// Format with lowercase function names
prettier.format(sqlContent, {
  parser: 'sql',
  plugins: ['./src/index.js'],
  sqlKeywordsCase: 'uppercase',
  sqlFunctionsCase: 'lowercase'
}).then(result => {
  console.log("==== RESULT WITH LOWERCASE FUNCTIONS (COMPLEX) ====");
  console.log(result);
  console.log("=================================================");
});

// Format with uppercase function names 
prettier.format(sqlContent, {
  parser: 'sql',
  plugins: ['./src/index.js'],
  sqlKeywordsCase: 'uppercase',
  sqlFunctionsCase: 'uppercase'
}).then(result => {
  console.log("==== RESULT WITH UPPERCASE FUNCTIONS (COMPLEX) ====");
  console.log(result);
  console.log("=================================================");
});
