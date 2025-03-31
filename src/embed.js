/**
 * Support for embedding SQL in JavaScript and Python files
 * Updated for Prettier v3 API
 */

const sqlParser = require('./parser');
const sqlPrinter = require('./printer');

function createSqlNode(text) {
  return {
    type: 'sql',
    raw: text,
    value: text
  };
}

// Handles SQL template literals in JavaScript
function embedJavaScript(textToDoc, path, options) {
  const node = path.getValue();
  
  // Check for tagged template literals with SQL tags
  if (
    node.type === 'TaggedTemplateExpression' &&
    node.tag.type === 'Identifier' && 
    ['sql', 'SQL', 'sqlTemplate'].includes(node.tag.name)
  ) {
    const sqlText = node.quasi.quasis[0].value.raw;
    const sqlNode = createSqlNode(sqlText);
    return sqlPrinter.print({
      getValue: () => sqlNode
    }, options);
  }
  
  // Check for string literals assigned to SQL-related variables
  if (
    node.type === 'VariableDeclarator' &&
    node.id.name && 
    node.id.name.toLowerCase().includes('sql') &&
    node.init && 
    node.init.type === 'StringLiteral'
  ) {
    const sqlText = node.init.value;
    const sqlNode = createSqlNode(sqlText);
    return sqlPrinter.print({
      getValue: () => sqlNode
    }, options);
  }
  
  // No SQL content found
  return null;
}

// Handles SQL strings in Python files
function embedPython(textToDoc, path, options) {
  const node = path.getValue();
  
  // Look for string assignments to variables containing 'sql'
  if (
    node.type === 'Assign' && 
    node.targets && 
    node.targets.length > 0 &&
    node.targets[0].id && 
    node.targets[0].id.toLowerCase && 
    node.targets[0].id.toLowerCase().includes('sql') && 
    node.value && 
    node.value.type === 'Str'
  ) {
    const sqlText = node.value.value;
    const sqlNode = createSqlNode(sqlText);
    return sqlPrinter.print({
      getValue: () => sqlNode
    }, options);
  }
  
  // No SQL content found
  return null;
}

// Updated for Prettier v3 API - embed now takes different parameters
function embed(path, options, textToDoc) {
  // Get the parser name to determine which language we're in
  const parser = options.parser;
  
  if (parser === 'babel' || parser === 'babel-ts' || parser === 'typescript' || parser === 'flow') {
    return embedJavaScript(textToDoc, path, options);
  }
  
  if (parser === 'python') {
    return embedPython(textToDoc, path, options);
  }
  
  return null;
}

module.exports = embed;