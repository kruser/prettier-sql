-- Example showing how function case formatting works
select 
  sum(amount) as total,
  count(*) as count,
  avg(price) as average_price,
  max(created_at) as latest_date,
  min(created_at) as earliest_date,
  upper(category) as category_upper
from sales
where date between '2023-01-01' and '2023-12-31'
  and lower(status) = 'completed';