-- This is an inline comment for id u.name ,
 -- User name comment u.email -- User email comment
-- This is a trailing comment
-- This is a comment at the beginning

SELECT u.id
     , FROM users u /* This is a
   multi-line
   comment */
WHERE u.active = true -- Active users only
  AND p.published_at > '2023-01-01' -- Recent posts filter
ORDER BY p.published_at DESC
LIMIT 10
;