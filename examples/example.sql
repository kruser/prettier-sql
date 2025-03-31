SELECT u.id
     , u.name    AS user_name
     , u.email   AS user_email
     , p.title   AS post_title
     , p.content AS post_content 
FROM users u 
JOIN posts p 
ON u.id = p.user_id 
WHERE u.active = true 
  AND p.published_at > '2023-01-01' 
ORDER BY p.published_at DESC 
LIMIT 10
;