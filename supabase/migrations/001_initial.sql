begin;
create type public.staff_role as enum ('admin','coordinator','analyst');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade, role public.staff_role not null);
create function public.has_role(roles public.staff_role[]) returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role=any(roles)) $$;
revoke all on function public.has_role(public.staff_role[]) from public;
grant execute on function public.has_role(public.staff_role[]) to authenticated;
create table public.interests(
 id uuid primary key default gen_random_uuid(),kind text not null check(kind in ('donor','survey','pickup','contact')),
 organization text not null check(length(organization) between 2 and 160),name text not null,email text not null,phone text not null default '',zip text not null check(zip ~ '^85[0-9]{3}$'),
 category text not null check(category in ('Produce','Prepared meals','Bakery','Packaged goods','Mixed','Not applicable')),
 pounds numeric not null default 0 check(pounds between 0 and 100000),frequency text not null,notes text not null default '',
 status text not null default 'Interest received' check(status in ('Interest received','Under review','Approved for planning','Declined')),
 consented_at timestamptz not null,created_at timestamptz not null default now()
);
create table public.recipient_partners(id uuid primary key default gen_random_uuid(),organization text not null,zip text not null,status text not null default 'Prospective');
create table public.partner_contacts(id uuid primary key default gen_random_uuid(),partner_id uuid not null references public.recipient_partners(id) on delete cascade,name text not null,email text not null,phone text);
create table public.pickups(id uuid primary key default gen_random_uuid(),interest_id uuid references public.interests(id),recipient_id uuid references public.recipient_partners(id),category text not null check(category in ('Produce','Prepared meals','Bakery','Packaged goods','Mixed')),estimated_pounds numeric check(estimated_pounds>=0),actual_pounds numeric check(actual_pounds>=0),status text not null default 'Interest received' check(status in ('Interest received','Under review','Approved for planning','Scheduled','Completed','Cancelled')),scheduled_at timestamptz,completed_at timestamptz,check(status<>'Completed' or (actual_pounds is not null and completed_at is not null)));
create table public.operating_costs(id uuid primary key default gen_random_uuid(),category text not null,amount numeric(12,2) not null check(amount>=0),incurred_on date not null,notes text);
-- All tables fail closed. Service-role credentials are used only by the validated server form endpoint.
alter table public.profiles enable row level security;
alter table public.interests enable row level security;
alter table public.recipient_partners enable row level security;
alter table public.partner_contacts enable row level security;
alter table public.pickups enable row level security;
alter table public.operating_costs enable row level security;
create policy own_profile on public.profiles for select to authenticated using(id=auth.uid());
create policy contact_read on public.interests for select to authenticated using(public.has_role(array['admin','coordinator']::public.staff_role[]));
create policy contact_update on public.interests for update to authenticated using(public.has_role(array['admin','coordinator']::public.staff_role[])) with check(public.has_role(array['admin','coordinator']::public.staff_role[]));
create policy partner_contact_staff on public.partner_contacts for all to authenticated using(public.has_role(array['admin','coordinator']::public.staff_role[])) with check(public.has_role(array['admin','coordinator']::public.staff_role[]));
create policy partners_read on public.recipient_partners for select to authenticated using(public.has_role(array['admin','coordinator','analyst']::public.staff_role[]));
create policy partners_write on public.recipient_partners for all to authenticated using(public.has_role(array['admin','coordinator']::public.staff_role[])) with check(public.has_role(array['admin','coordinator']::public.staff_role[]));
create policy pickups_read on public.pickups for select to authenticated using(public.has_role(array['admin','coordinator','analyst']::public.staff_role[]));
create policy pickups_write on public.pickups for all to authenticated using(public.has_role(array['admin','coordinator']::public.staff_role[])) with check(public.has_role(array['admin','coordinator']::public.staff_role[]));
create policy costs_read on public.operating_costs for select to authenticated using(public.has_role(array['admin','coordinator','analyst']::public.staff_role[]));
create policy costs_write on public.operating_costs for all to authenticated using(public.has_role(array['admin']::public.staff_role[])) with check(public.has_role(array['admin']::public.staff_role[]));
revoke all on public.profiles,public.interests,public.recipient_partners,public.partner_contacts,public.pickups,public.operating_costs from anon;
grant select on public.profiles to authenticated;
grant select,insert,update,delete on public.interests,public.recipient_partners,public.partner_contacts,public.pickups,public.operating_costs to authenticated;
commit;
