-- Supabase Postgres Best Practices: Use RPCs to aggregate dashboard statistics instead of making N parallel network requests.
-- This reduces network roundtrips and optimizes exact counts across multiple tables by executing entirely within Postgres.

CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_count int;
  v_order_count int;
  v_creator_count int;
  v_recent_activity_count int;
  v_users_this_month int;
  v_users_last_month int;
  v_orders_this_month int;
  v_orders_last_month int;
  
  v_recent_users json;
  v_recent_orders json;
  v_weekly_orders json;
  v_completed_orders json;
  
  v_now timestamp := now();
  v_one_day_ago timestamp := v_now - interval '1 day';
  v_seven_days_ago timestamp := v_now - interval '7 days';
  v_start_of_current_month timestamp := date_trunc('month', v_now);
  v_start_of_last_month timestamp := date_trunc('month', v_now - interval '1 month');
  v_end_of_last_month timestamp := date_trunc('month', v_now) - interval '1 second';
BEGIN
  -- Basic counts
  SELECT count(*) INTO v_user_count FROM profiles;
  SELECT count(*) INTO v_order_count FROM orders;
  SELECT count(*) INTO v_creator_count FROM creator_profiles;
  SELECT count(*) INTO v_recent_activity_count FROM profiles WHERE created_at > v_one_day_ago;
  
  -- Monthly counts (Trends)
  SELECT count(*) INTO v_users_this_month FROM profiles WHERE created_at >= v_start_of_current_month;
  SELECT count(*) INTO v_users_last_month FROM profiles WHERE created_at >= v_start_of_last_month AND created_at <= v_end_of_last_month;
  SELECT count(*) INTO v_orders_this_month FROM orders WHERE created_at >= v_start_of_current_month;
  SELECT count(*) INTO v_orders_last_month FROM orders WHERE created_at >= v_start_of_last_month AND created_at <= v_end_of_last_month;
  
  -- JSON arrays for recent data
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_recent_users FROM (
    SELECT id, first_name, last_name, role, created_at FROM profiles ORDER BY created_at DESC LIMIT 8
  ) t;
  
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_recent_orders FROM (
    SELECT id, status, price, created_at FROM orders ORDER BY created_at DESC LIMIT 8
  ) t;
  
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_weekly_orders FROM (
    SELECT created_at, status, price FROM orders WHERE created_at >= v_seven_days_ago
  ) t;
  
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_completed_orders FROM (
    SELECT price, created_at FROM orders WHERE status = 'completed'
  ) t;

  RETURN json_build_object(
    'userCount', COALESCE(v_user_count, 0),
    'orderCount', COALESCE(v_order_count, 0),
    'creatorCount', COALESCE(v_creator_count, 0),
    'recentActivityCount', COALESCE(v_recent_activity_count, 0),
    'usersThisMonth', COALESCE(v_users_this_month, 0),
    'usersLastMonth', COALESCE(v_users_last_month, 0),
    'ordersThisMonth', COALESCE(v_orders_this_month, 0),
    'ordersLastMonth', COALESCE(v_orders_last_month, 0),
    'recentUsers', v_recent_users,
    'recentOrders', v_recent_orders,
    'weeklyOrders', v_weekly_orders,
    'completedOrders', v_completed_orders
  );
END;
$$;
