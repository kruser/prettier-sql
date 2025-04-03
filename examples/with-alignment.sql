WITH cte1 AS (
    SELECT id, name 
    FROM table1
    WHERE x = 1
),
     cte2 AS (
    SELECT id, value
    FROM table2
    WHERE y = 2
),
     cte3 AS (
    SELECT *
    FROM table3
    WHERE z = 3
)
SELECT cte1.id
     , cte1.name
     , cte2.value
FROM cte1
JOIN cte2 ON cte1.id = cte2.id
JOIN cte3 ON cte1.id = cte3.id;