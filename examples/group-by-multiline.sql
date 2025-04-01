SELECT customer_id
     , product_name
     , purchase_amount AS total_spent
     , purchase_count
FROM customer_purchases
WHERE purchase_date > '2023-01-01'
  AND status = 'complete'
GROUP BY customer_id
       , product_name
       , purchase_date
       , category_id
ORDER BY total_spent DESC
LIMIT 5
;