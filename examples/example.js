// Example of SQL templates in JavaScript

// Tagged template literal
const userQuery = sql`SELECT id, name, email 
FROM users 
WHERE status = 'active' AND created_at > '2023-01-01'`;

// SQL-named variable with string literal
const postsSQL =
  'SELECT p.id, p.title, p.content, u.name as author FROM posts p JOIN users u ON p.user_id = u.id WHERE p.published = true ORDER BY p.created_at DESC';

// Regular string (should not be formatted)
const regularString =
  "This is a regular string that shouldn't be formatted even though it contains SQL keywords like SELECT and FROM";
