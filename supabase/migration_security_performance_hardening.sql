-- ============================================================
-- 1. Lock down get_admin_dashboard_stats(): add an explicit
--    admin check inside the function body (the function had
--    none - any signed-in OR anonymous caller could read full
--    platform stats via /rest/v1/rpc/get_admin_dashboard_stats)
--    and revoke execute from anon entirely.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: admin role required' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO v_user_count FROM profiles;
  SELECT count(*) INTO v_order_count FROM orders;
  SELECT count(*) INTO v_creator_count FROM creator_profiles;
  SELECT count(*) INTO v_recent_activity_count FROM profiles WHERE created_at > v_one_day_ago;

  SELECT count(*) INTO v_users_this_month FROM profiles WHERE created_at >= v_start_of_current_month;
  SELECT count(*) INTO v_users_last_month FROM profiles WHERE created_at >= v_start_of_last_month AND created_at <= v_end_of_last_month;
  SELECT count(*) INTO v_orders_this_month FROM orders WHERE created_at >= v_start_of_current_month;
  SELECT count(*) INTO v_orders_last_month FROM orders WHERE created_at >= v_start_of_last_month AND created_at <= v_end_of_last_month;

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
$function$;

REVOKE EXECUTE ON FUNCTION public.get_admin_dashboard_stats() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_admin_dashboard_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_stats() TO authenticated;

-- ============================================================
-- 2. Missing index on orders.measurement_profile_id
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_measurement_profile_id
  ON public.orders (measurement_profile_id);

-- ============================================================
-- 3. RLS policies: wrap auth.uid() as (select auth.uid()) so
--    Postgres evaluates it once per query instead of once per
--    row, and merge "own row" + "admin" policies that were
--    stacking as separate permissive policies on the same
--    table/action into a single policy each.
-- ============================================================

-- categories: keep public SELECT as-is; split the admin ALL
-- policy so it no longer duplicates the SELECT check.
DROP POLICY IF EXISTS admin_categories ON public.categories;
CREATE POLICY admin_insert_categories ON public.categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin')
  );
CREATE POLICY admin_update_categories ON public.categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin')
  );
CREATE POLICY admin_delete_categories ON public.categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin')
  );

-- collections: same split (owner ALL -> owner I/U/D), public SELECT untouched.
DROP POLICY IF EXISTS manage_own_collections ON public.collections;
CREATE POLICY insert_own_collections ON public.collections
  FOR INSERT WITH CHECK ((select auth.uid()) = creator_id);
CREATE POLICY update_own_collections ON public.collections
  FOR UPDATE USING ((select auth.uid()) = creator_id);
CREATE POLICY delete_own_collections ON public.collections
  FOR DELETE USING ((select auth.uid()) = creator_id);

-- products: same split.
DROP POLICY IF EXISTS manage_own_products ON public.products;
CREATE POLICY insert_own_products ON public.products
  FOR INSERT WITH CHECK ((select auth.uid()) = creator_id);
CREATE POLICY update_own_products ON public.products
  FOR UPDATE USING ((select auth.uid()) = creator_id);
CREATE POLICY delete_own_products ON public.products
  FOR DELETE USING ((select auth.uid()) = creator_id);

-- creator_profiles: wrap insert check; merge own+admin UPDATE.
DROP POLICY IF EXISTS insert_own_creator_profile ON public.creator_profiles;
CREATE POLICY insert_own_creator_profile ON public.creator_profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS update_own_creator_profile ON public.creator_profiles;
DROP POLICY IF EXISTS admin_update_all_creator_profiles ON public.creator_profiles;
CREATE POLICY update_creator_profiles ON public.creator_profiles
  FOR UPDATE USING (
    (select auth.uid()) = id
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin')
  );

-- favorites: wrap only, no overlaps.
DROP POLICY IF EXISTS delete_own_favorites ON public.favorites;
CREATE POLICY delete_own_favorites ON public.favorites
  FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS insert_own_favorites ON public.favorites;
CREATE POLICY insert_own_favorites ON public.favorites
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS select_own_favorites ON public.favorites;
CREATE POLICY select_own_favorites ON public.favorites
  FOR SELECT USING ((select auth.uid()) = user_id);

-- messages: wrap only, no overlaps.
DROP POLICY IF EXISTS delete_messages ON public.messages;
CREATE POLICY delete_messages ON public.messages
  FOR DELETE USING ((select auth.uid()) = sender_id);

DROP POLICY IF EXISTS insert_messages ON public.messages;
CREATE POLICY insert_messages ON public.messages
  FOR INSERT WITH CHECK ((select auth.uid()) = sender_id);

DROP POLICY IF EXISTS select_messages ON public.messages;
CREATE POLICY select_messages ON public.messages
  FOR SELECT USING ((select auth.uid()) = sender_id OR (select auth.uid()) = receiver_id);

-- notifications: wrap only, no overlaps.
DROP POLICY IF EXISTS select_notifications ON public.notifications;
CREATE POLICY select_notifications ON public.notifications
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS update_notifications ON public.notifications;
CREATE POLICY update_notifications ON public.notifications
  FOR UPDATE USING ((select auth.uid()) = user_id);

-- orders: wrap insert; merge own+admin SELECT and own+admin UPDATE.
DROP POLICY IF EXISTS insert_orders ON public.orders;
CREATE POLICY insert_orders ON public.orders
  FOR INSERT WITH CHECK ((select auth.uid()) = client_id);

DROP POLICY IF EXISTS select_orders ON public.orders;
DROP POLICY IF EXISTS admin_select_all_orders ON public.orders;
CREATE POLICY select_orders ON public.orders
  FOR SELECT USING (
    (select auth.uid()) = client_id
    OR (select auth.uid()) = creator_id
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin')
  );

DROP POLICY IF EXISTS update_orders ON public.orders;
DROP POLICY IF EXISTS admin_update_all_orders ON public.orders;
CREATE POLICY update_orders ON public.orders
  FOR UPDATE USING (
    (select auth.uid()) = client_id
    OR (select auth.uid()) = creator_id
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin')
  );

-- profiles: wrap insert; merge own+admin UPDATE; wrap admin DELETE.
DROP POLICY IF EXISTS insert_own_profile ON public.profiles;
CREATE POLICY insert_own_profile ON public.profiles
  FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS update_own_profile ON public.profiles;
DROP POLICY IF EXISTS admin_update_all_profiles ON public.profiles;
CREATE POLICY update_profiles ON public.profiles
  FOR UPDATE USING (
    (select auth.uid()) = id
    OR EXISTS (SELECT 1 FROM profiles p2 WHERE p2.id = (select auth.uid()) AND p2.role = 'admin')
  );

DROP POLICY IF EXISTS admin_delete_profiles ON public.profiles;
CREATE POLICY admin_delete_profiles ON public.profiles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles p2 WHERE p2.id = (select auth.uid()) AND p2.role = 'admin')
  );

-- reviews: wrap insert/update; merge own+admin DELETE.
DROP POLICY IF EXISTS insert_reviews ON public.reviews;
CREATE POLICY insert_reviews ON public.reviews
  FOR INSERT WITH CHECK ((select auth.uid()) = reviewer_id);

DROP POLICY IF EXISTS update_reviews ON public.reviews;
CREATE POLICY update_reviews ON public.reviews
  FOR UPDATE USING ((select auth.uid()) = reviewer_id);

DROP POLICY IF EXISTS delete_reviews ON public.reviews;
DROP POLICY IF EXISTS admin_delete_all_reviews ON public.reviews;
CREATE POLICY delete_reviews ON public.reviews
  FOR DELETE USING (
    (select auth.uid()) = reviewer_id
    OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = (select auth.uid()) AND profiles.role = 'admin')
  );

-- saved_measurements: wrap only, no overlaps (policy names contain spaces).
DROP POLICY IF EXISTS "delete own measurement profiles" ON public.saved_measurements;
CREATE POLICY "delete own measurement profiles" ON public.saved_measurements
  FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "insert own measurement profiles" ON public.saved_measurements;
CREATE POLICY "insert own measurement profiles" ON public.saved_measurements
  FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "select own measurement profiles" ON public.saved_measurements;
CREATE POLICY "select own measurement profiles" ON public.saved_measurements
  FOR SELECT USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "update own measurement profiles" ON public.saved_measurements;
CREATE POLICY "update own measurement profiles" ON public.saved_measurements
  FOR UPDATE USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================
-- NOT covered here: "Leaked password protection" is an Auth
-- service setting, not a SQL object - toggle it in the
-- Dashboard (see chat instructions).
-- ============================================================
