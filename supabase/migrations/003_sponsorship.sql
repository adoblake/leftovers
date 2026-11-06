begin;

alter table public.interests drop constraint interests_kind_check;
alter table public.interests add constraint interests_kind_check
  check(kind in ('donor','survey','pickup','contact','sponsor'));
alter table public.interests drop constraint interests_zip_check;
alter table public.interests add constraint interests_zip_check
  check ((kind in ('contact','sponsor') and (zip is null or zip ~ '^[0-9]{5}$'))
      or (kind not in ('contact','sponsor') and zip is not null and zip ~ '^85[0-9]{3}$'));
alter table public.interests
  add column support_type text not null default 'Not sure yet'
    check (support_type in ('Funding','Transport','Storage and food safety','Professional services','Community connections','Not sure yet')),
  add column sponsor_website text not null default '' check (sponsor_website = '' or sponsor_website ~ '^https://'),
  add column recognition_consent boolean not null default false;

-- Reviewers can change status, not rewrite a person's original publication consent.
revoke update on public.interests from authenticated;
grant update(status) on public.interests to authenticated;

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  source_interest_id uuid not null unique references public.interests(id) on delete cascade,
  public_name text not null check(length(public_name) between 2 and 160),
  website text not null default '' check (website = '' or website ~ '^https://'),
  public_description text not null check(length(public_description) between 10 and 280),
  support_area text not null,
  agreement_confirmed boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  check(not published or agreement_confirmed)
);
alter table public.sponsors enable row level security;

create function public.guard_sponsor_publication() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from public.interests where id = new.source_interest_id and kind = 'sponsor') then
    raise exception 'A sponsorship inquiry is required';
  end if;
  if new.published and not exists(
    select 1 from public.interests where id = new.source_interest_id
      and recognition_consent and status = 'Approved for planning'
  ) then
    raise exception 'Reviewed sponsorship and public-recognition consent are required';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_sponsor_publication() from public;
create trigger sponsor_publication_guard before insert or update on public.sponsors
for each row execute function public.guard_sponsor_publication();

create policy sponsor_public_read on public.sponsors for select to anon,authenticated using(published);
create policy sponsor_admin_manage on public.sponsors for all to authenticated
  using(public.has_role(array['admin']::public.staff_role[]))
  with check(public.has_role(array['admin']::public.staff_role[]));
revoke all on public.sponsors from anon;
grant select(id,public_name,website,public_description,support_area,published) on public.sponsors to anon;
grant select,insert,update,delete on public.sponsors to authenticated;

-- Only a safe projection of approved organizational acknowledgments is public.
create view public.sponsor_directory with (security_invoker = true) as
  select id,public_name,website,public_description,support_area from public.sponsors where published;
grant select on public.sponsor_directory to anon,authenticated;
create function public.unpublish_unapproved_sponsor() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not new.recognition_consent or new.status <> 'Approved for planning' then
    update public.sponsors set published = false where source_interest_id = new.id and published;
  end if;
  return new;
end;
$$;
revoke all on function public.unpublish_unapproved_sponsor() from public;
create trigger sponsor_consent_withdrawal after update of recognition_consent,status on public.interests
for each row execute function public.unpublish_unapproved_sponsor();

create function public.guard_pickup_interest() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.interest_id is not null and not exists(select 1 from public.interests where id = new.interest_id and kind in ('donor','survey','pickup')) then
    raise exception 'Pickup planning requires a food-related inquiry';
  end if;
  return new;
end;
$$;
revoke all on function public.guard_pickup_interest() from public;
create trigger pickup_interest_guard before insert or update on public.pickups
for each row execute function public.guard_pickup_interest();
commit;
