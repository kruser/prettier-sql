# prettier-sql

A Prettier plugin for formatting SQL files.

> **Note:** This plugin is currently in development. It currently supports formatting standalone SQL files, with plans for JavaScript and Python SQL templates in future versions.

## Features

- Format standalone SQL (.sql) files
- Configure SQL keyword case (uppercase, lowercase, or preserve)
- Configure comma position (end of line or start of line)
- Align leading commas under the 'T' of SELECT
- Align column aliases for better readability
- Place semicolons on their own line
- Indent AND/OR clauses under their parent condition
- Indent CTE contents with 4 spaces
- Keep JOIN ... ON clauses on the same line
- Configurable GROUP BY formatting (multi-line or single-line)

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
  "sqlCommaPosition": "end",
  "sqlGroupBySingleLine": false
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

- `sqlGroupBySingleLine`: Controls formatting of GROUP BY clauses
  - `false` (default): Break GROUP BY columns into separate lines with aligned commas
  - `true`: Keep all GROUP BY columns on a single line separated by commas

### SQL Files

This plugin will automatically format any `.sql` files according to the configuration options.

Before:
```sql
SELECT id, name FROM users WHERE age > 18 ORDER BY name ASC
```

After:
```sql
SELECT id
     , name AS username
     , email AS user_email
FROM users
WHERE age > 18
  AND active = true
ORDER BY name ASC
;
```

### GROUP BY Examples

#### Multi-line GROUP BY (default)

```sql
SELECT customer_id
     , product_name
     , purchase_amount AS total_spent
     , purchase_count
FROM customer_purchases
WHERE purchase_date > '2023-01-01'
  AND status = 'complete'
GROUP BY customer_id
       , product_name
       , purchase_date
       , category_id
ORDER BY total_spent DESC
LIMIT 5
;
```

#### Single-line GROUP BY (with `sqlGroupBySingleLine: true`)

```sql
SELECT customer_id
     , product_name
     , purchase_amount AS total_spent
     , purchase_count
FROM customer_purchases
WHERE purchase_date > '2023-01-01'
  AND status = 'complete'
GROUP BY customer_id, product_name, purchase_date
ORDER BY total_spent DESC
LIMIT 5
;
```

### Complex Example

Before:
```sql
WITH active_users as (select id, name from users where status = 'active'), recent_posts as (select * from posts where created_at > '2023-01-01') SELECT au.id, au.name as username, rp.title as post_title, rp.content as post_content, count(*) as total_posts FROM active_users au JOIN recent_posts rp ON au.id = rp.user_id where rp.views > 100 AND rp.comments_count > 5 OR rp.likes > 50 GROUP BY au.id, au.name, rp.title, rp.content ORDER BY total_posts DESC LIMIT 10;
```

After:
```sql
WITH active_users AS (
    SELECT id
         , name
    FROM users
    WHERE status = 'active'
)
, recent_posts AS (
    SELECT *
    FROM posts
    WHERE created_at > '2023-01-01'
)
SELECT au.id
     , au.name      AS username
     , rp.title     AS post_title
     , rp.content   AS post_content
     , count(*)     AS total_posts
FROM active_users au
JOIN recent_posts rp ON au.id = rp.user_id
WHERE rp.views > 100
  AND rp.comments_count > 5
  OR rp.likes > 50
GROUP BY au.id
       , au.name
       , rp.title
       , rp.content
ORDER BY total_posts DESC
LIMIT 10
;
```

## Roadmap

- [x] Format standalone SQL files
- [ ] Format SQL template literals in JavaScript
- [ ] Format SQL strings in Python files

## License

MIT