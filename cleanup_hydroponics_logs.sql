-- ============================================================
-- CLEAN UP OLD/DEMO HYDROPONICS LOGS
-- Fix for Analytics showing incorrect log counts
-- ============================================================

-- Step 1: View all hydroponics logs to identify which ones to keep
SELECT 
  id,
  target_id,
  system_id,
  system_type,
  ph,
  ec,
  water_temp,
  created_at,
  notes
FROM daily_logs
WHERE system_type = 'Hydroponics'
ORDER BY created_at DESC;

-- Step 2: Delete old demo/test logs (UNCOMMENT AFTER REVIEWING ABOVE)
-- IMPORTANT: Only run this after confirming which logs to delete!

-- Option A: Delete logs from demo systems (if you see DEMO-NFT-01 or similar)
-- DELETE FROM daily_logs 
-- WHERE system_type = 'Hydroponics' 
--   AND (target_id LIKE 'DEMO%' OR system_id LIKE 'DEMO%');

-- Option B: Delete all hydroponics logs EXCEPT the most recent one
-- DELETE FROM daily_logs 
-- WHERE system_type = 'Hydroponics' 
--   AND id NOT IN (
--     SELECT id FROM daily_logs 
--     WHERE system_type = 'Hydroponics' 
--     ORDER BY created_at DESC 
--     LIMIT 1
--   );

-- Option C: Delete logs older than a specific date
-- DELETE FROM daily_logs 
-- WHERE system_type = 'Hydroponics' 
--   AND created_at < '2026-01-15'::timestamp;

-- Step 3: Verify cleanup
SELECT 
  target_id,
  COUNT(*) as log_count,
  MIN(created_at) as first_log,
  MAX(created_at) as last_log
FROM daily_logs
WHERE system_type = 'Hydroponics'
GROUP BY target_id
ORDER BY last_log DESC;

-- ============================================================
-- EXPECTED RESULT
-- ============================================================
-- After cleanup, you should see:
-- - Only 1 row per active hydroponics system
-- - log_count should match your actual daily logs
-- - No DEMO or old test data
