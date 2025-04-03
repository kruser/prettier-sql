-- Example showing how function case formatting works

SELECT sum(amount) AS total
     , count(*) AS count
     , avg(price) AS average_price
     , max(created_at) AS latest_date
     , min(created_at) AS earliest_date
     , upper(category) AS category_upper
FROM sales
WHERE date between '2023-01-01'
  AND '2023-12-31'
  AND lower(status) = 'completed'
;