# Example of SQL strings in Python

# SQL-named variable
user_sql = "SELECT id, name, email FROM users WHERE status = 'active' AND created_at > '2023-01-01'"

# Another SQL query
posts_sql_query = """
SELECT 
p.id, 
p.title, 
p.content, 
u.name as author 
FROM posts p 
JOIN users u ON p.user_id = u.id 
WHERE p.published = true 
ORDER BY p.created_at DESC
"""

# Regular string (should not be formatted)
regular_string = "This is a regular string that shouldn't be formatted even though it contains SQL keywords like SELECT and FROM"