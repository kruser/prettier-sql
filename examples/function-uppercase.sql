-- Example with function names in lowercase
SELECT customer_id
     , SUM(amount) AS total_amount
     , COUNT(*)    AS transaction_count
     , MIN(date)   AS first_date
     , MAX(date)   AS last_date
     , ROUND(amount, 2)          AS rounded_amount
FROM customer_transactions
WHERE LOWER(status) = 'complete'
GROUP BY customer_id
;
