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
    const functionsCase = options.sqlFunctionsCase || 'uppercase'; // 'uppercase', 'lowercase', or 'preserve'
    const groupByOneLine = options.sqlGroupBySingleLine || false;

    // Define SQL keywords for formatting
    let keywords = [
      'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'JOIN', 
      'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN',
      'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
      'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE', 'TRUNCATE', 'WITH',
      'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT', 'AND', 'OR',
      'IN', 'NOT IN', 'EXISTS', 'NOT EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
    ];

    // Define common SQL functions
    const sqlFunctions = [
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF',
      'CAST', 'CONVERT', 'SUBSTR', 'SUBSTRING', 'TRIM', 'LTRIM', 'RTRIM',
      'LENGTH', 'CHAR_LENGTH', 'ROUND', 'NOW', 'CURRENT_TIMESTAMP',
      'EXTRACT', 'DATEADD', 'DATEDIFF', 'TO_CHAR', 'TO_DATE',
      'UPPER', 'LOWER', 'INITCAP', 'CONCAT', 'REPLACE', 'REGEXP_REPLACE',
      'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'ROW_NUMBER',
      'RANK', 'DENSE_RANK', 'NTILE', 'LISTAGG', 'GROUP_CONCAT'
    ];

    // Use a simpler approach for handling comments
    // Split the SQL into lines and track comment-only lines
    const lines = sql.split('\n');
    const commentOnlyLines = [];
    const sqlWithoutCommentOnlyLines = [];
    
    // First pass: Identify comment-only lines and remove them temporarily
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Check if line is only a comment
      if (line.startsWith('--')) {
        commentOnlyLines.push({ index: sqlWithoutCommentOnlyLines.length, content: lines[i] });
      } else {
        sqlWithoutCommentOnlyLines.push(lines[i]);
      }
    }
    
    // Join the remaining lines back together for processing
    let sqlToFormat = sqlWithoutCommentOnlyLines.join('\n');
    
    // Extract inline comments within the remaining SQL and replace with placeholders
    const inlineComments = [];
    sqlToFormat = sqlToFormat.replace(/(--[^\n]*)/g, (match) => {
      const placeholder = `__COMMENT_${inlineComments.length}__`;
      inlineComments.push(match);
      return placeholder;
    });
    
    // Extract multi-line comments and replace with placeholders
    const multilineComments = [];
    sqlToFormat = sqlToFormat.replace(/\/\*[\s\S]*?\*\//g, (match) => {
      const placeholder = `__MULTICOMMENT_${multilineComments.length}__`;
      multilineComments.push(match);
      return placeholder;
    });
    
    // Extract function calls and replace with placeholders
    const functionCalls = [];
    sqlToFormat = sqlToFormat.replace(/\b(?:COUNT|SUM|AVG|MIN|MAX|COALESCE|NULLIF|CAST|CONVERT|SUBSTR|SUBSTRING|TRIM|LTRIM|RTRIM|LENGTH|CHAR_LENGTH|ROUND|NOW|CURRENT_TIMESTAMP|EXTRACT|DATEADD|DATEDIFF|TO_CHAR|TO_DATE|UPPER|LOWER|INITCAP|CONCAT|REPLACE|REGEXP_REPLACE|LAG|LEAD|FIRST_VALUE|LAST_VALUE|ROW_NUMBER|RANK|DENSE_RANK|NTILE|LISTAGG|GROUP_CONCAT)\s*\([^()]*(?:\([^()]*\)[^()]*)*\)/gi, (match) => {
      const placeholder = `__FUNCTION_${functionCalls.length}__`;
      functionCalls.push(match);
      return placeholder;
    });
    
    // Simple formatter - replace multiple whitespaces with single space
    sqlToFormat = sqlToFormat.replace(/\s+/g, ' ').trim();

    // Format function names
    if (functionsCase !== 'preserve') {
      // Create a regex pattern for functions
      const functionPattern = sqlFunctions.join('|');
      const functionRegex = new RegExp(`\\b(${functionPattern})\\b(?=\\s*\\()`, 'gi');
      
      // Format function names
      sqlToFormat = sqlToFormat.replace(functionRegex, (match) => 
        functionsCase === 'uppercase' ? match.toUpperCase() : match.toLowerCase()
      );
    }

    // Handle keyword case
    if (keywordsCase !== 'preserve') {
      // Create a regex pattern for all keywords with word boundaries
      const keywordPattern = keywords.map(k => 
        // Escape any regex special characters in the keyword
        k.replace(/[-\/\^\$*+?.()|[\]{}]/g, '\\$&')
      ).join('|');
      const keywordRegex = new RegExp(`\\b(${keywordPattern})\\b`, 'gi');
      
      // Replace keywords with proper case
      sqlToFormat = sqlToFormat.replace(keywordRegex, match => 
        keywordsCase === 'uppercase' ? match.toUpperCase() : match.toLowerCase()
      );
    }

    // Replace AS keywords and align them
    // First standardize spacing around AS
    sqlToFormat = sqlToFormat.replace(/\s+AS\s+/gi, ' AS ');
    
    // Find the position of the AS keywords to align them
    const asMatches = [];
    let match;
    const asRegex = /\S+\s+AS\s+\S+/g;
    while ((match = asRegex.exec(sqlToFormat)) !== null) {
      asMatches.push(match);
    }
    
    if (asMatches.length > 0) {
      let maxAsPosition = 0;
      
      // Find the furthest position of the AS keyword
      asMatches.forEach(match => {
        const asPosition = match[0].indexOf(' AS ');
        if (asPosition > maxAsPosition) {
          maxAsPosition = asPosition;
        }
      });
      
      // Now pad all AS keywords to align them
      if (maxAsPosition > 0) {
        const asAlignRegex = /(\S+)(\s+AS\s+)(\S+)/g;
        sqlToFormat = sqlToFormat.replace(asAlignRegex, (match, before, as, after) => {
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
      const formattedKeyword = keywordsCase === 'uppercase' ? keyword.toUpperCase() : 
                              keywordsCase === 'lowercase' ? keyword.toLowerCase() : 
                              keyword;
      sqlToFormat = sqlToFormat.replace(regex, `\n${formattedKeyword}`);
    });

    // Handle WITH clauses and CTEs
    sqlToFormat = sqlToFormat.replace(/\n(WITH\s+[^(]+)\s+AS\s*\(/g, '$1 AS (');

    // Add 4 spaces of indentation to SQL within CTEs
    sqlToFormat = sqlToFormat.replace(/\((\n+)(\s*)SELECT/g, '(\n    SELECT');

    // Indent all clauses inside CTEs
    let inCTE = false;
    const formattedLines = sqlToFormat.split('\n');
    for (let i = 0; i < formattedLines.length; i++) {
      const line = formattedLines[i].trim();

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

      // If inside a CTE, add 4 spaces of indentation to lines without keywords at the start
      if (inCTE && !line.match(/^\s*(SELECT|FROM|WHERE|ORDER BY|GROUP BY|HAVING|JOIN|AND|OR|$)/i)) {
        formattedLines[i] = '    ' + formattedLines[i];
      } else if (inCTE && line.match(/^\s*(FROM|WHERE|ORDER BY|GROUP BY|HAVING|JOIN|AND|OR)/i)) {
        // These keywords should be indented in CTEs
        formattedLines[i] = '    ' + formattedLines[i];
      }
    }
    sqlToFormat = formattedLines.join('\n');

    // Handle comma position (end or start of line)
    if (commaPosition === 'start') {
      // First, apply comma formatting to the whole SQL string
      sqlToFormat = sqlToFormat.replace(/,\s*/g, '\n     , ');
      
      // Then, adjust commas in GROUP BY sections if they should be multi-line
      if (!groupByOneLine) {
        sqlToFormat = sqlToFormat.replace(/\n(GROUP BY.*?)(?=\n[A-Z]|$)/gs, (match) => {
          return match.replace(/\n\s+,\s+/g, '\n       , ');
        });
      } else {
        // For single-line GROUP BY statements, put commas back without newlines
        sqlToFormat = sqlToFormat.replace(/\n(GROUP BY)(.*?)(?=\n[A-Z]|$)/gs, (match, groupBy, columns) => {
          // Replace newline + spaces + comma with just a comma and space
          let fixedColumns = columns.replace(/\n\s+,\s+/g, ', ');
          return `\n${groupBy}${fixedColumns}`;
        });
      }
    } else {
      // For end commas
      sqlToFormat = sqlToFormat.replace(/,\s*/g, ',\n');
      
      // Handle single-line GROUP BY
      if (groupByOneLine) {
        sqlToFormat = sqlToFormat.replace(/\n(GROUP BY)(.*?)(?=\n[A-Z]|$)/gs, (match, groupBy, columns) => {
          // Replace comma + newline with just a comma and space
          let fixedColumns = columns.replace(/,\n\s+/g, ', ');
          return `\n${groupBy}${fixedColumns}`;
        });
      }
    }

    // Handle JOIN ... ON statements - keep ON on same line
    sqlToFormat = sqlToFormat.replace(/\n(ON\b)/gi, ' $1');

    // Handle semicolon - place on its own line
    sqlToFormat = sqlToFormat.replace(/;/g, '\n;');

    // Special handling for AND/OR to indent them
    sqlToFormat = sqlToFormat.replace(/\n(AND|OR)\b/gi, '\n  $1');

    // Remove extra blank lines
    sqlToFormat = sqlToFormat.replace(/\n\s*\n+/g, '\n');

    // Restore function calls from placeholders
    for (let i = 0; i < functionCalls.length; i++) {
      sqlToFormat = sqlToFormat.replace(`__FUNCTION_${i}__`, functionCalls[i]);
    }
    
    // Restore multiline comments from placeholders
    for (let i = 0; i < multilineComments.length; i++) {
      sqlToFormat = sqlToFormat.replace(`__MULTICOMMENT_${i}__`, multilineComments[i]);
    }
    
    // Restore inline comments from placeholders - ensuring there's a space before each one
    for (let i = 0; i < inlineComments.length; i++) {
      const placeholder = `__COMMENT_${i}__`;
      const pos = sqlToFormat.indexOf(placeholder);
      
      if (pos !== -1) {
        const charBefore = pos > 0 ? sqlToFormat.charAt(pos - 1) : '';
        if (charBefore !== ' ') {
          sqlToFormat = sqlToFormat.substring(0, pos) + ' ' + inlineComments[i] + sqlToFormat.substring(pos + placeholder.length);
        } else {
          sqlToFormat = sqlToFormat.replace(placeholder, inlineComments[i]);
        }
      }
    }
    
    // Reinsert comment-only lines at their appropriate positions
    const finalLines = sqlToFormat.split('\n');
    for (const { index, content } of commentOnlyLines) {
      // Insert comment lines at their original positions
      if (index <= finalLines.length) {
        finalLines.splice(index, 0, content);
      } else {
        finalLines.push(content);
      }
    }
    
    // Remove trailing whitespace from each line
    const finalSql = finalLines.map(line => line.trimRight()).join('\n');

    return finalSql.trim();
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
    },
    sqlFunctionsCase: {
      type: 'choice',
      default: 'uppercase',
      description: 'Control the letter casing of SQL functions (e.g., COUNT, SUM)',
      choices: [
        { value: 'uppercase', description: 'Uppercase SQL function names' },
        { value: 'lowercase', description: 'Lowercase SQL function names' },
        { value: 'preserve', description: 'Preserve the original casing of function names' }
      ]
    }
  }
};