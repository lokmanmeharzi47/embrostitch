alter table public.portfolio_images
  add column if not exists title text,
  add column if not exists category text,
  add column if not exists price numeric,
  add column if not exists is_published boolean not null default true,
  add column if not exists updated_at timestamptz default now();

do $$
begin
  alter table public.portfolio_images
    add constraint portfolio_images_user_id_fkey
    foreign key (user_id)
    references public.profiles(id)
    on delete cascade;
exception
  when duplicate_object then null;
end $$;

alter table public.portfolio_images enable row level security;

drop policy if exists "Public can view any portfolio images" on public.portfolio_images;
drop policy if exists "Public can view published portfolio images" on public.portfolio_images;

create policy "Public can view published portfolio images"
on public.portfolio_images
for select
to anon, authenticated
using (is_published = true);
