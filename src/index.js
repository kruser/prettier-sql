'use strict';

// Simple SQL parser with just enough implementation to work
const parser = {
  parse: text => ({
    type: 'sql',
    value: text
  }),
  locStart: () => 0,
  locEnd: node => node.value.length
};

// Simple SQL printer
function printSql(path, options) {
  const node = path.getValue();
  
  if (node.type === 'sql') {
    // Basic SQL formatting - split by keywords and standardize spacing
    let sql = node.value;
    
    // Get SQL formatting options from prettier options
    const keywordsCase = options.sqlKeywordsCase || 'uppercase'; // 'uppercase', 'lowercase', or 'preserve'
    const commaPosition = options.sqlCommaPosition || 'end'; // 'end' or 'start'
    
    // Define SQL keywords for formatting
    let keywords = [
      'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'JOIN', 
      'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN',
      'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
      'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'TRUNCATE', 'WITH',
      'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT', 'ON', 'AND', 'OR',
      'IN', 'NOT IN', 'EXISTS', 'NOT EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
    ];
    
    // Simple formatter - replace multiple whitespaces with single space
    sql = sql.replace(/\s+/g, ' ').trim();
    
    // Handle keyword case
    if (keywordsCase === 'uppercase' || keywordsCase === 'lowercase') {
      // Create a regex pattern for all keywords with word boundaries
      const keywordPattern = keywords.map(k => 
        // Escape any regex special characters in the keyword
        k.replace(/[-\/\^\$*+?.()|[\]{}]/g, '\\$&')
      ).join('|');
      const keywordRegex = new RegExp(`\\b(${keywordPattern})\\b`, 'gi');
      
      // Replace keywords with proper case
      sql = sql.replace(keywordRegex, match => 
        keywordsCase === 'uppercase' ? match.toUpperCase() : match.toLowerCase()
      );
    }
    
    // Replace AS keywords and align them
    // First standardize spacing around AS
    sql = sql.replace(/\s+AS\s+/gi, ' AS ');
    
    // Find the position of the AS keywords to align them
    const asPositions = [];
    const asMatches = sql.match(/\S+\s+AS\s+\S+/g) || [];
    
    if (asMatches.length > 0) {
      let maxAsPosition = 0;
      
      // Find the furthest position of the AS keyword
      asMatches.forEach(match => {
        const asPosition = match.indexOf(' AS ');
        if (asPosition > maxAsPosition) {
          maxAsPosition = asPosition;
        }
      });
      
      // Now pad all AS keywords to align them
      if (maxAsPosition > 0) {
        const asRegex = /(\S+)(\s+AS\s+)(\S+)/g;
        sql = sql.replace(asRegex, (match, before, as, after) => {
          const padding = ' '.repeat(Math.max(0, maxAsPosition - before.length));
          return `${before}${padding}${as}${after}`;
        });
      }
    }
    
    // Add newlines before main SQL clauses
    keywords.forEach(keyword => {
      // Create regex that matches the keyword at word boundaries
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      // Single space after keywords, not double
      sql = sql.replace(regex, `\n${keywordsCase === 'uppercase' ? keyword.toUpperCase() : 
                                    keywordsCase === 'lowercase' ? keyword.toLowerCase() : 
                                    keyword}`);
    });
    
    // Handle comma position (end or start of line)
    if (commaPosition === 'start') {
      // Line up commas under the first letter of SELECT
      sql = sql.replace(/,\s*/g, '\n     , ');
    } else {
      sql = sql.replace(/,\s*/g, ',\n');
    }
    
    // Handle semicolon - place on its own line
    sql = sql.replace(/;/g, '\n;');
    
    // Special handling for AND/OR to indent them
    sql = sql.replace(/\n(AND|OR)\b/gi, '\n  $1');
    
    return sql.trim();
  }
  
  return '';
}

// Export the plugin
module.exports = {
  // Languages parsers
  parsers: {
    sql: {
      parse: parser.parse,
      astFormat: 'sql',
      locStart: parser.locStart,
      locEnd: parser.locEnd,
      extensions: ['.sql']
    }
  },
  
  // Language printers
  printers: {
    sql: {
      print: printSql
    }
  },

  // Plugin options
  options: {
    sqlKeywordsCase: {
      type: 'choice',
      default: 'uppercase',
      description: 'Control the letter casing of SQL keywords',
      choices: [
        { value: 'uppercase', description: 'Uppercase SQL keywords' },
        { value: 'lowercase', description: 'Lowercase SQL keywords' },
        { value: 'preserve', description: 'Preserve the original casing' }
      ]
    },
    sqlCommaPosition: {
      type: 'choice',
      default: 'end',
      description: 'Control the position of commas in SQL lists',
      choices: [
        { value: 'end', description: 'Place commas at the end of lines' },
        { value: 'start', description: 'Place commas at the start of new lines' }
      ]
    }
  }
};