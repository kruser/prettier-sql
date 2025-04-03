-- Example showing function names in various cases

SELECT sum(amount) AS total
     , count(*) AS count
     , avg(price) AS average
     , max(date) AS latest_date
     , min(date) AS earliest_date
     , upper(category) AS category_upper
FROM sales
WHERE lower(status) = 'completed'
;