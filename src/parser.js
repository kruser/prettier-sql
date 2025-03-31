// This is a simple SQL parser for demonstration
// In a production plugin, you might use an existing SQL parser like 'sql-parser' or 'node-sql-parser'

function parse(text) {
  // For now, this is a very simplified AST structure
  // In a real implementation, you would parse SQL into a proper AST
  return {
    type: 'sql',
    raw: text,
    value: text
  };
}

function locStart(node) {
  return 0;
}

function locEnd(node) {
  return node.raw.length;
}

module.exports = {
  parse,
  locStart,
  locEnd
};
