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