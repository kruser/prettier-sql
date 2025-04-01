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
      'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT', 'AND', 'OR',
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

    // Add newlines before main SQL clauses
    keywords.forEach(keyword => {
      // Create regex that matches the keyword at word boundaries
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      // Single space after keywords, not double
      sql = sql.replace(regex, `\n${keywordsCase === 'uppercase' ? keyword.toUpperCase() : 
                                    keywordsCase === 'lowercase' ? keyword.toLowerCase() : 
                                    keyword}`);
    });

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

    // Handle WITH clauses and CTEs
    sql = sql.replace(/\n(WITH\s+[^(]+)\s+AS\s*\(/g, '$1 AS (');

    // Add 4 spaces of indentation to SQL within CTEs
    sql = sql.replace(/\((\n+)(\s*)SELECT/g, '(\n    SELECT');

    // Indent all clauses inside CTEs
    let inCTE = false;
    const lines = sql.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if we're starting a CTE
      if (line.match(/^\w+\s+AS\s*\($/)) {
        inCTE = true;
        continue;
      }

      // Check if we're ending a CTE
      if (line === ')' || line === '),') {
        inCTE = false;
        continue;
      }

      // If inside a CTE, add 4 spaces of indentation to all lines
      if (inCTE && !line.match(/^\s*SELECT/i) && !line.match(/^\s*FROM/i) &&
          !line.match(/^\s*WHERE/i) && !line.match(/^\s*ORDER BY/i) &&
          !line.match(/^\s*GROUP BY/i) && !line.match(/^\s*HAVING/i) && 
          !line.match(/^\s*JOIN/i) && !line.match(/^\s*AND/i) && 
          !line.match(/^\s*OR/i) && !line.match(/^$/)) {
        lines[i] = '    ' + lines[i];
      } else if (inCTE && line.match(/^\s*(FROM|WHERE|ORDER BY|GROUP BY|HAVING|JOIN|AND|OR)/i)) {
        // These keywords should be indented in CTEs
        lines[i] = '    ' + lines[i];
      }
    }
    sql = lines.join('\n');

    // Get GROUP BY option
    const groupByOneLine = options.sqlGroupBySingleLine || false;

    // Handle comma position (end or start of line)
    if (commaPosition === 'start') {
      // First, apply comma formatting to the whole SQL string
      sql = sql.replace(/,\s*/g, '\n     , ');
      
      // Then, adjust commas in GROUP BY sections if they should be multi-line
      if (!groupByOneLine) {
        sql = sql.replace(/\n(GROUP BY.*?)(?=\n[A-Z]|$)/gs, (match) => {
          return match.replace(/\n\s+,\s+/g, '\n       , ');
        });
      } else {
        // For single-line GROUP BY statements, put commas back without newlines
        sql = sql.replace(/\n(GROUP BY)(.*?)(?=\n[A-Z]|$)/gs, (match, groupBy, columns) => {
          // Replace newline + spaces + comma with just a comma and space
          let fixedColumns = columns.replace(/\n\s+,\s+/g, ', ');
          return `\n${groupBy}${fixedColumns}`;
        });
      }
    } else {
      // For end commas
      sql = sql.replace(/,\s*/g, ',\n');
      
      // Handle single-line GROUP BY
      if (groupByOneLine) {
        sql = sql.replace(/\n(GROUP BY)(.*?)(?=\n[A-Z]|$)/gs, (match, groupBy, columns) => {
          // Replace comma + newline with just a comma and space
          let fixedColumns = columns.replace(/,\n\s+/g, ', ');
          return `\n${groupBy}${fixedColumns}`;
        });
      }
    }

    // Handle parentheses - function calls shouldn't be split
    // Only format parentheses that aren't part of a function call
    sql = sql.replace(/\)\s*(?!AS|,|AND|OR|WHERE|FROM|SELECT|GROUP|ORDER|HAVING|ON)(\s*)/g, '\n)$1');

    // Handle JOIN ... ON statements - keep ON on same line
    sql = sql.replace(/\n(ON\b)/gi, ' $1');

    // Handle semicolon - place on its own line
    sql = sql.replace(/;/g, '\n;');

    // Special handling for AND/OR to indent them
    sql = sql.replace(/\n(AND|OR)\b/gi, '\n  $1');

    // Remove extra blank lines
    sql = sql.replace(/\n\s*\n+/g, '\n');

    // Remove trailing whitespace from each line
    sql = sql.split('\n').map(line => line.trimRight()).join('\n');

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
      default: 'start',
      description: 'Control the position of commas in SQL lists',
      choices: [
        { value: 'end', description: 'Place commas at the end of lines' },
        { value: 'start', description: 'Place commas at the start of new lines' }
      ]
    },
    sqlGroupBySingleLine: {
      type: 'boolean',
      default: false,
      description: 'Keep GROUP BY statements on a single line instead of breaking out each column'
    }
  }
};