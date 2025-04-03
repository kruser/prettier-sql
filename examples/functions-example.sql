-- Example showing how function case formatting works

SELECT SUM(amount) AS total
     , COUNT(*) AS count
     , AVG(price) AS average_price
     , MAX(created_at) AS latest_date
     , MIN(created_at) AS earliest_date
     , UPPER(category) AS category_upper
FROM sales
WHERE date between '2023-01-01'
  AND '2023-12-31'
  AND LOWER(status) = 'completed'
;