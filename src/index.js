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

    // Function names are formatted when we restore function calls later

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

    // Handle WITH CTEs - need more special handling for consistent formatting
    // Improve CTEs - Handle the WITH clause and CTE definitions
    sqlToFormat = sqlToFormat.replace(/\n(WITH\b)/gi, '\nWITH');  // Standardize WITH keyword
    
    // Format CTE AS clauses
    sqlToFormat = sqlToFormat.replace(/(\w+)\s+AS\s*\(/gi, '$1 AS (');
    
    // Add newline after opening parenthesis for CTEs
    sqlToFormat = sqlToFormat.replace(/AS\s*\(\s*/gi, 'AS (\n    ');
    
    // Format closing parenthesis for CTEs
    sqlToFormat = sqlToFormat.replace(/\s*\)\s*,\s*(\w+\s+AS)/gi, '\n)\n, $1');
    sqlToFormat = sqlToFormat.replace(/\s*\)\s*(\nSELECT)/gi, '\n)\n$1');
    
    // Fix CTE comma alignment
    // First, find all lines that start with a comma followed by a CTE name
    const ctePattern = /\n,\s*(\w+\s+AS\s*\()/gi;
    
    // Replace them with a standard format first
    sqlToFormat = sqlToFormat.replace(ctePattern, '\n, $1');
    
    // Now we need to align the commas specifically
    let withPosition = -1;
    let cteLines = sqlToFormat.split('\n');
    
    // Find the WITH keyword position to use for alignment
    for (let i = 0; i < cteLines.length; i++) {
      if (cteLines[i].trim().startsWith('WITH')) {
        withPosition = cteLines[i].indexOf('WITH');
        break;
      }
    }
    
    // If we found the WITH position, align all CTE commas with proper indentation
    if (withPosition >= 0) {
      for (let i = 0; i < cteLines.length; i++) {
        // Look for lines starting with comma that are part of CTE definition
        if (cteLines[i].trim().startsWith(',') && 
            (i+1 < cteLines.length && cteLines[i].indexOf(' AS (') > 0)) {
          // Use same indentation as the commas in SELECT statements (add 6 spaces from the indentation)
          const indent = ' '.repeat(withPosition);
          cteLines[i] = indent + cteLines[i].trim();
        }
      }
    }
    
    sqlToFormat = cteLines.join('\n');
    
    // Process the SQL by lines to handle indentation
    const formattedLines = sqlToFormat.split('\n');
    let inCTE = false;
    let cteDepth = 0;

    for (let i = 0; i < formattedLines.length; i++) {
      let line = formattedLines[i].trim();
      
      // Detect if we're inside a CTE definition
      if (line.match(/\bAS\s*\($/i)) {
        inCTE = true;
        cteDepth = 1;  // Start counting nested parentheses
        continue;
      }
      
      // Count opening and closing parentheses to track nested levels
      if (inCTE) {
        const openParens = (line.match(/\(/g) || []).length;
        const closeParens = (line.match(/\)/g) || []).length;
        cteDepth += openParens - closeParens;
        
        // If cteDepth reaches 0, we're out of the CTE
        if (cteDepth <= 0) {
          inCTE = false;
          cteDepth = 0;
          continue;
        }
        
        // Add indentation to CTE content
        formattedLines[i] = '    ' + line;
      }
    }
    
    sqlToFormat = formattedLines.join('\n');

    // Handle comma position (end or start of line)
    if (commaPosition === 'start') {
      // First move commas to beginning of lines with proper spacing
      sqlToFormat = sqlToFormat.replace(/,\s*/g, '\n     , ');
      
      // Process SQL line by line to properly align commas with SELECT statements
      const lines = sqlToFormat.split('\n');
      
      // Find all SELECT statements for reference indentation
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('SELECT')) {
          // Get the position of 'S' in SELECT
          const selectPos = lines[i].indexOf('SELECT');
          
          // The comma should align with the 'T' in SELECT, which is selectPos + 6
          const commaIndent = ' '.repeat(selectPos + 6);
          
          // Find the field list lines after this SELECT and adjust commas
          let j = i + 1;
          while (j < lines.length && 
                 !lines[j].trim().match(/^\s*(FROM|WHERE|GROUP|ORDER|HAVING|LIMIT|JOIN|UNION|EXCEPT|INTERSECT)\b/i)) {
            // If this line starts with a comma, adjust its alignment
            if (lines[j].trimStart().startsWith(',')) {
              // Extract any content after the comma
              const afterComma = lines[j].trimStart().substring(1).trimStart();
              // Replace with properly aligned comma
              lines[j] = commaIndent + ', ' + afterComma;
            }
            j++;
          }
        }
      }
      
      sqlToFormat = lines.join('\n');
      
      // Handle GROUP BY clauses
      if (!groupByOneLine) {
        // For multi-line GROUP BY, ensure proper comma alignment
        sqlToFormat = sqlToFormat.replace(/\n(GROUP BY)(.*?)(?=\n[A-Z]|$)/gs, (match, groupBy, columns) => {
          const groupByLine = `\n${groupBy}`;
          // Get indent for GROUP BY line
          const indent = ' '.repeat(6);  // align with T of GROUP
          
          // Replace commas with properly aligned ones
          let formattedColumns = columns.replace(/\n\s*,\s*/g, `\n${indent}, `);
          return groupByLine + formattedColumns;
        });
      } else {
        // For single-line GROUP BY, put commas inline
        sqlToFormat = sqlToFormat.replace(/\n(GROUP BY)(.*?)(?=\n[A-Z]|$)/gs, (match, groupBy, columns) => {
          let fixedColumns = columns.replace(/\n\s*,\s*/g, ', ');
          return `\n${groupBy}${fixedColumns}`;
        });
      }
    } else {
      // For end commas
      sqlToFormat = sqlToFormat.replace(/,\s*/g, ',\n');
      
      // Handle single-line GROUP BY with end commas
      if (groupByOneLine) {
        sqlToFormat = sqlToFormat.replace(/\n(GROUP BY)(.*?)(?=\n[A-Z]|$)/gs, (match, groupBy, columns) => {
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
    
    // Fix formatting for closing parenthesis in CTEs
    sqlToFormat = sqlToFormat.replace(/\n\s*\)\s*,\s*/g, '\n)\n, ');
    sqlToFormat = sqlToFormat.replace(/\n\s*\)\s*$/gm, '\n)');

    // Remove extra blank lines
    sqlToFormat = sqlToFormat.replace(/\n\s*\n+/g, '\n');

    // Format function names and restore function calls from placeholders
    for (let i = 0; i < functionCalls.length; i++) {
      let formattedFunction = functionCalls[i];
      
      // Apply function case formatting
      if (functionsCase !== 'preserve') {
        // Format function names
        sqlFunctions.forEach(func => {
          const funcRegex = new RegExp(`\\b${func}\\b(?=\\s*\\()`, 'gi');
          formattedFunction = formattedFunction.replace(funcRegex, match => 
            functionsCase === 'uppercase' ? match.toUpperCase() : match.toLowerCase()
          );
        });
      }
      
      sqlToFormat = sqlToFormat.replace(`__FUNCTION_${i}__`, formattedFunction);
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
      default: true,
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