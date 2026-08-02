-- Applied directly to the live project via Supabase MCP.
-- Application code across every dashboard (client/creator/couturiere/admin order
-- pages, plus /api/orders and /order/create) selects and inserts description,
-- delivery_date and images on orders, but those columns were never added to the
-- live schema -- every orders query/insert was failing with PostgREST 400.
alter table public.orders
  add column if not exists description text,
  add column if not exists delivery_date timestamptz,
  add column if not exists images text[] not null default '{}'::text[];

-- total_amount is NOT NULL with no default and is not populated by any current
-- code path (the app writes to `price` instead), so every insert also failed on
-- this constraint. Given a default instead of dropping it, since it's unclear
-- whether anything else still depends on the column existing.
alter table public.orders
  alter column total_amount set default 0;
