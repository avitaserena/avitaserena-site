-- ═══════════════════════════════════════════════════════════
-- MIGRATION : table caminu_syntheses
-- U Caminu [u ka-MI-nu] "le chemin" — synthèses hebdomadaires
-- Projet Supabase : bqhkdndwldwqacrrbbig
-- ═══════════════════════════════════════════════════════════

-- 1. Création de la table
create table if not exists public.caminu_syntheses (
  id            uuid        default gen_random_uuid() primary key,
  client_key    text        not null,
  titre         text        not null default 'Votre semaine',
  contenu       text        not null,
  semaine_iso   text,          -- format YYYY-Www  ex: 2026-W33 (optionnel, pour éviter les doublons)
  lu            boolean     not null default false,
  envoye_par    text        default 'sabrina@avitaserena.com',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- 2. Index pour les requêtes de l'espace cliente (toujours filtrées par client_key)
create index if not exists idx_caminu_client_key
  on public.caminu_syntheses (client_key, created_at desc);

-- 3. Index unicité optionnel — une seule synthèse par client par semaine
--    Commenté par défaut : décommentez si vous voulez empêcher les doublons de semaine
-- create unique index if not exists idx_caminu_unique_semaine
--   on public.caminu_syntheses (client_key, semaine_iso)
--   where semaine_iso is not null;

-- 4. Trigger de mise à jour automatique de updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_caminu_updated_at on public.caminu_syntheses;
create trigger trg_caminu_updated_at
  before update on public.caminu_syntheses
  for each row execute function public.set_updated_at();

-- 5. RLS — Row Level Security
alter table public.caminu_syntheses enable row level security;

-- La cliente ne peut lire que SES synthèses (via current_client_key() déjà définie dans le projet)
create policy "cliente_lire_ses_syntheses"
  on public.caminu_syntheses
  for select
  using (client_key = current_client_key());

-- Sabrina (praticienne) peut tout lire, écrire, modifier, supprimer
create policy "praticienne_full_access"
  on public.caminu_syntheses
  for all
  using (is_praticien())
  with check (is_praticien());

-- 6. Marquer comme lu quand la cliente ouvre l'onglet
--    (géré côté client via PATCH — pas de policy supplémentaire nécessaire)

-- 7. Commentaires de documentation
comment on table  public.caminu_syntheses is 'Synthèses hebdomadaires U Caminu — rédigées par Sabrina, lues par la cliente dans son espace';
comment on column public.caminu_syntheses.client_key   is 'Clé cliente au format prenom-nom-AAAAMMJJ';
comment on column public.caminu_syntheses.semaine_iso  is 'Semaine ISO 8601 ex: 2026-W33 — permet d''éviter les doublons';
comment on column public.caminu_syntheses.lu           is 'true quand la cliente a ouvert l''onglet U Caminu et chargé la synthèse';

-- ═══════════════════════════════════════════════════════════
-- VÉRIFICATION — à exécuter après migration pour confirmer
-- ═══════════════════════════════════════════════════════════
-- select count(*) from public.caminu_syntheses;
-- select * from pg_policies where tablename = 'caminu_syntheses';
