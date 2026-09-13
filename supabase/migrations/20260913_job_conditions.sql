-- Job transparency: venue/call + Anfahrt / Übernachtung / Spesen / 10h-Tag
alter table public.listings
  add column if not exists venue text,
  add column if not exists call_time text,
  add column if not exists requirements text[] default '{}',
  add column if not exists travel text,
  add column if not exists overnight text,
  add column if not exists expenses text,
  add column if not exists expenses_note text,
  add column if not exists day_hours numeric;

comment on column public.listings.travel is 'included | per_km | self | tbd';
comment on column public.listings.overnight is 'provided | hotel | none | tbd';
comment on column public.listings.expenses is 'receipts | flat | included | none | tbd';
comment on column public.listings.day_hours is 'Assumed working day length, typically 10 in DE event work';
