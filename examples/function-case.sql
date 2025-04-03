-- Example showing function names in various cases

SELECT SUM(amount) AS total
     , COUNT(*) AS count
     , AVG(price) AS average
     , MAX(date) AS latest_date
     , MIN(date) AS earliest_date
     , UPPER(category) AS category_upper
FROM sales
WHERE LOWER(status) = 'completed'
;