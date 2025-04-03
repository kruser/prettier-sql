-- This is a comment at the beginning

SELECT u.id
     , -- This is an inline comment for id u.name
     , -- User name comment u.email -- User email comment
FROM users u /* This is a
-- This is a trailing comment
   multi-line
   comment */
WHERE u.active = true -- Active users only
  AND p.published_at > '2023-01-01' -- Recent posts filter
ORDER BY p.published_at DESC
LIMIT 10
;