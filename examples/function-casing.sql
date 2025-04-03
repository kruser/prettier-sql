SELECT customer_id
     , SUM(amount) AS total_amount
     , AVG(amount) AS avg_amount
     , COUNT(*) AS transaction_count
     , MIN(date) AS first_date
     , MAX(date) AS last_date
     , COALESCE(name , 'Unknown') AS customer
     , UPPER(category) AS category
     , EXTRACT(year FROM date) AS year
     , ROUND(amount , 2) AS rounded_amount
FROM customer_transactions
WHERE date between '2023-01-01'
  AND '2023-12-31'
  AND LOWER(status)= 'complete'
GROUP BY customer_id , name , category , EXTRACT(year FROM date)
;