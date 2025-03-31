SELECT  u.id,
u.name,
u.email,
p.title,
p.content 
FROM  users u 
JOIN  posts p 
ON  u.id = p.user_id 
WHERE  u.active = true 
AND  p.published_at > '2023-01-01' 
ORDER BY  p.published_at DESC 
LIMIT  10;