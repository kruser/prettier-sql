# prettier-sql

A Prettier plugin for formatting SQL files.

> **Note:** This plugin is currently in development. It currently supports formatting standalone SQL files, with plans for JavaScript and Python SQL templates in future versions.

## Features

- Format standalone SQL (.sql) files
- Configure SQL keyword case (uppercase, lowercase, or preserve)
- Configure comma position (end of line or start of line)

## Installation

```bash
npm install --save-dev prettier prettier-sql
# or
yarn add --dev prettier prettier-sql
```

## Usage

### Configuration

Add this to your `.prettierrc` file:

```json
{
  "plugins": ["prettier-sql"],
  "sqlKeywordsCase": "uppercase",
  "sqlCommaPosition": "end"
}
```

#### Configuration Options

This plugin provides the following SQL-specific configuration options:

- `sqlKeywordsCase`: Controls the case of SQL keywords
  - `"uppercase"` (default): Convert keywords to uppercase
  - `"lowercase"`: Convert keywords to lowercase
  - `"preserve"`: Leave keyword case unchanged
  
- `sqlCommaPosition`: Controls the position of commas in lists
  - `"end"` (default): Place commas at the end of lines
  - `"start"`: Place commas at the start of new lines

### SQL Files

This plugin will automatically format any `.sql` files according to the configuration options.

Before:
```sql
SELECT id, name FROM users WHERE age > 18 ORDER BY name ASC
```

After:
```sql
SELECT id, name 
FROM users 
WHERE age > 18 
ORDER BY name ASC
```

## Roadmap

- [x] Format standalone SQL files
- [ ] Format SQL template literals in JavaScript
- [ ] Format SQL strings in Python files

## License

MIT