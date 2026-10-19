-- Einkaufsliste + Einkaufswagen: einmal im SQL-Editor des Supabase-Projekts ausführen.
-- Eine Zeile = eine Kachel. im_wagen = true → liegt im Einkaufswagen.
-- Kein Fremdschlüssel auf "gruppen" (gleiche Konvention wie gedanken/push_subscriptions).
create table if not exists einkaufsliste (
  id          bigint generated always as identity primary key,
  gruppe_id   bigint not null,
  name        text not null,
  tage        int,
  im_wagen    boolean not null default false,
  charge      text not null default '',
  erstellt_am timestamptz not null default now()
);

create index if not exists einkaufsliste_gruppe_id_idx on einkaufsliste (gruppe_id);

alter table einkaufsliste enable row level security;

drop policy if exists "einkaufsliste_all" on einkaufsliste;
create policy "einkaufsliste_all" on einkaufsliste for all using (true) with check (true);
