-- Push-Benachrichtigungen: Tabelle für Web-Push-Subscriptions + Auslöse-Trigger.
-- Schritt 1 (jetzt sofort ausführbar): Tabelle + RLS-Policy.
-- Schritt 2 (erst NACH dem Deploy der Edge Function "send-gedanken-push"):
--            den Trigger am Ende mit der echten Function-URL ausführen.

-- Hinweis: Kein Fremdschlüssel auf "gruppen" (Tabelle existiert im Projekt
-- nicht, siehe gleicher Fehler bei "gedanken"). gruppe_id ist ein normaler
-- bigint, analog zu essensplan.gruppe_id / gedanken.gruppe_id.
create table if not exists push_subscriptions (
  id           bigint generated always as identity primary key,
  gruppe_id    bigint not null,
  endpoint     text not null unique,
  p256dh       text not null,
  auth         text not null,
  erstellt_am  timestamptz not null default now()
);

create index if not exists push_subscriptions_gruppe_id_idx on push_subscriptions (gruppe_id);

alter table push_subscriptions enable row level security;

drop policy if exists "push_subscriptions_all" on push_subscriptions;
create policy "push_subscriptions_all" on push_subscriptions for all using (true) with check (true);


-- ─────────────────────────────────────────────────────────────────────────
-- SCHRITT 2 — erst ausführen, wenn die Edge Function deployt ist:
-- Ersetze <project-ref> durch deine Projekt-Referenz (aus SUPABASE_URL,
-- z. B. "qvqqjlebpyhgbygekmbz") und führe dann diesen Block separat aus.
-- ─────────────────────────────────────────────────────────────────────────

drop trigger if exists gedanken_push_insert on gedanken;
create trigger gedanken_push_insert
  after insert on gedanken
  for each row
  execute function supabase_functions.http_request(
    'https://qvqqjlebpyhgbygekmbz.functions.supabase.co/send-gedanken-push',
    'POST',
    '{"Content-Type":"application/json"}',
    '{}',
    '5000'
  );
