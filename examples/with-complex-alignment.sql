WITH customers AS (
    SELECT id, name, email, country
    FROM customer_data
    WHERE status = 'active'
    AND created_at > '2023-01-01'
),
     orders AS (
    SELECT 
        customer_id,
        SUM(amount) AS total_order_amount,
        COUNT(*) AS order_count,
        MAX(order_date) AS latest_order
    FROM order_data
    WHERE order_status != 'cancelled'
    GROUP BY customer_id
),
     customer_metrics AS (
    SELECT
        c.id,
        c.name,
        c.email,
        o.total_order_amount,
        o.order_count,
        o.latest_order,
        o.total_order_amount / o.order_count AS avg_order_value
    FROM customers c
    LEFT JOIN orders o ON c.id = o.customer_id
)
SELECT
    cm.id,
    cm.name,
    cm.email,
    cm.total_order_amount,
    cm.order_count,
    cm.latest_order,
    cm.avg_order_value,
    CASE 
        WHEN cm.total_order_amount > 1000 THEN 'High Value'
        WHEN cm.total_order_amount > 500 THEN 'Medium Value'
        ELSE 'Low Value'
    END AS customer_segment
FROM customer_metrics cm
WHERE cm.order_count > 0
ORDER BY cm.total_order_amount DESC
LIMIT 100;