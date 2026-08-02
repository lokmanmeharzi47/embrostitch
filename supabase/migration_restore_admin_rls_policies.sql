-- Applied directly to the live project via Supabase MCP.
-- The 2026-04-01 "add_admin_rls_policies" migration originally gave the admin
-- role bypass access on orders/profiles/creator_profiles/reviews, but those
-- specific policies no longer existed on any of these tables (superseded at
-- some point by later, unrecorded policy changes) -- admins had no more access
-- than a regular user, so most of the admin dashboard's write/list actions on
-- other people's data were silently blocked by RLS. Restoring equivalent policies.

-- orders: admin dashboard needs to list every order and change its status
create policy "admin_select_all_orders" on public.orders
  for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "admin_update_all_orders" on public.orders
  for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- profiles: admin/users page changes any user's role and can delete users
create policy "admin_update_all_profiles" on public.profiles
  for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

create policy "admin_delete_profiles" on public.profiles
  for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- creator_profiles: admin/users page toggles is_verified on any creator
create policy "admin_update_all_creator_profiles" on public.creator_profiles
  for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');

-- reviews: admin/reviews moderation deletes any review, not just one's own
create policy "admin_delete_all_reviews" on public.reviews
  for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'admin');
