-- General inquiries and privacy requests do not need to disclose a location.
-- Required Phoenix-area ZIP validation remains enforced for donor/survey/pickup forms.
begin;
alter table public.interests alter column zip drop not null;
-- The original ZIP check allows NULL. Contact forms accept any five-digit US ZIP.
alter table public.interests drop constraint interests_zip_check;
alter table public.interests add constraint interests_zip_check
  check ((kind = 'contact' and (zip is null or zip ~ '^[0-9]{5}$'))
      or (kind <> 'contact' and zip is not null and zip ~ '^85[0-9]{3}$'));
commit;
