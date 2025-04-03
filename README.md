# prettier-sql

A Prettier plugin for formatting SQL files.

## Features

- Format SQL code with Prettier
- Configurable options for SQL formatting preferences
- Support for SQL files (*.sql)

## Installation

```bash
npm install --save-dev prettier prettier-sql
```

## Usage

Add the plugin to your Prettier configuration:

```json
{
  "plugins": ["prettier-sql"],
  "overrides": [
    {
      "files": "*.sql",
      "options": {
        "parser": "sql"
      }
    }
  ]
}
```

## Configuration Options

The following options are available:

- `sqlKeywordsCase`: Control the letter casing of SQL keywords
  - `"uppercase"` (default): Uppercase SQL keywords
  - `"lowercase"`: Lowercase SQL keywords  
  - `"preserve"`: Preserve the original casing

- `sqlCommaPosition`: Control the position of commas in SQL lists
  - `"start"` (default): Place commas at the start of new lines
  - `"end"`: Place commas at the end of lines

- `sqlGroupBySingleLine`: Boolean to control GROUP BY formatting
  - `false` (default): Format GROUP BY with one column per line
  - `true`: Keep GROUP BY statements on a single line

- `sqlFunctionsCase`: Control the letter casing of SQL functions
  - `"uppercase"` (default): Uppercase SQL function names
  - `"lowercase"`: Lowercase SQL function names
  - `"preserve"`: Preserve the original casing of function names

## Example Configuration

```json
{
  "plugins": ["prettier-sql"],
  "overrides": [
    {
      "files": "*.sql",
      "options": {
        "parser": "sql",
        "sqlKeywordsCase": "uppercase",
        "sqlCommaPosition": "start",
        "sqlGroupBySingleLine": false,
        "sqlFunctionsCase": "lowercase"
      }
    }
  ]
}
```

## Current Limitations

- SQL comment handling has some limitations. Comments are preserved but may not always appear exactly where expected, especially inline comments.
- Multi-line comments might be repositioned in the formatted output.
- Complex SQL structures with deeply nested queries might not format optimally.

## Roadmap

- Improve comment handling and positioning
- Add support for SQL templates in JavaScript and Python files
- Add more SQL dialects and syntax support

## License

MIT