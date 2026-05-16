create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  attachment_url text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text,
  message text,
  related_order_id uuid references public.orders(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages
  add column if not exists attachment_url text;

alter table public.notifications
  add column if not exists message text,
  add column if not exists related_order_id uuid references public.orders(id) on delete cascade;

update public.notifications
set message = body
where message is null and body is not null;

alter table public.messages enable row level security;
alter table public.notifications enable row level security;

revoke update on public.messages from authenticated;
grant update (is_read) on public.messages to authenticated;

do $$
begin
  begin
    alter publication supabase_realtime drop table public.messages;
  exception
    when undefined_object then null;
  end;
end $$;

alter table public.messages drop constraint if exists messages_order_id_fkey;
alter table public.messages
  add constraint messages_order_id_fkey
  foreign key (order_id) references public.orders(id) on delete cascade;

drop policy if exists "Authenticated users can send messages" on public.messages;
drop policy if exists "Users can insert their own messages" on public.messages;
drop policy if exists "Users can view own messages" on public.messages;
drop policy if exists "Users can view their own messages" on public.messages;
drop policy if exists "Receiver can update messages (mark read)" on public.messages;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'Order participants can read messages'
  ) then
    create policy "Order participants can read messages"
      on public.messages
      for select
      to authenticated
      using (
        sender_id = auth.uid()
        or receiver_id = auth.uid()
        or exists (
          select 1
          from public.orders o
          where o.id = messages.order_id
            and (o.client_id = auth.uid() or o.couturiere_id = auth.uid())
        )
        or exists (
          select 1
          from public.profiles p
          where p.id = auth.uid() and p.role = 'admin'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'Order participants can insert own messages'
  ) then
    create policy "Order participants can insert own messages"
      on public.messages
      for insert
      to authenticated
      with check (
        sender_id = auth.uid()
        and order_id is not null
        and exists (
          select 1
          from public.orders o
          where o.id = messages.order_id
            and (
              (o.client_id = auth.uid() and o.couturiere_id = messages.receiver_id)
              or (o.couturiere_id = auth.uid() and o.client_id = messages.receiver_id)
            )
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'messages'
      and policyname = 'Receivers can mark order messages read'
  ) then
    create policy "Receivers can mark order messages read"
      on public.messages
      for update
      to authenticated
      using (receiver_id = auth.uid())
      with check (receiver_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'notifications'
      and policyname = 'Order participants can insert message notifications'
  ) then
    create policy "Order participants can insert message notifications"
      on public.notifications
      for insert
      to authenticated
      with check (
        type = 'message'
        and related_order_id is not null
        and user_id <> auth.uid()
        and exists (
          select 1
          from public.orders o
          where o.id = notifications.related_order_id
            and (
              (o.client_id = auth.uid() and o.couturiere_id = notifications.user_id)
              or (o.couturiere_id = auth.uid() and o.client_id = notifications.user_id)
            )
        )
      );
  end if;
end $$;
