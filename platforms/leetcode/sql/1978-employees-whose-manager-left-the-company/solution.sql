SELECT
    e.employee_id
FROM Employees AS e
WHERE e.salary < 30000
  AND e.manager_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM Employees AS m
      WHERE m.employee_id = e.manager_id
  )
ORDER BY e.employee_id;
