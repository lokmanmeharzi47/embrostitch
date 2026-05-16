# Supabase Migration Note

The Supabase CLI is not installed in this workspace, so the required schema change is recorded here for application in Supabase SQL editor or a proper migration pipeline.

```sql
alter table public.couturiere_profiles
  add column if not exists shop_name text,
  add column if not exists shop_description text,
  add column if not exists is_visible boolean default true,
  add column if not exists email_updates boolean default true,
  add column if not exists sms_alerts boolean default false;
```
