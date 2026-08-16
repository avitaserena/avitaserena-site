-- ═══════════════════════════════════════════════════════════
-- MIGRATION v2 : invitation-cadeau dans U Caminu
-- Ajoute la colonne suggestion_cadeau à caminu_syntheses.
-- Cochée par Sabrina depuis le CRM (caminu-crm-widget.html) uniquement quand un vrai
-- palier de progression est détecté — jamais automatique, jamais une remise.
-- Projet Supabase : bqhkdndwldwqacrrbbig
-- ═══════════════════════════════════════════════════════════

alter table public.caminu_syntheses
  add column if not exists suggestion_cadeau boolean not null default false;

comment on column public.caminu_syntheses.suggestion_cadeau is
  'true si Sabrina a choisi d''inclure une invitation à offrir un premier Bilan de vitalité à une amie/proche — coché manuellement dans le CRM, jamais automatique. Déclenche la carte "Un geste qui compte" dans espace-clientes.html.';

-- ═══════════════════════════════════════════════════════════
-- VÉRIFICATION
-- ═══════════════════════════════════════════════════════════
-- select column_name, data_type, column_default from information_schema.columns
--   where table_name = 'caminu_syntheses' and column_name = 'suggestion_cadeau';
