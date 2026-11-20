-- SchuldenPRO — Seed-Daten fuer Phase 3 (SchuldnerList-Test)
-- Dummy-Daten, alle Namen frei erfunden.
-- Ausfuehren im Supabase SQL Editor (laeuft als postgres-User, umgeht RLS).

-- =====================================================================
-- Glaeubiger (3 typische Beispiele)
-- =====================================================================
INSERT INTO glaeubiger (name, typ, ort)
VALUES
  ('Beispiel Telefon GmbH', 'unternehmen', 'Musterstadt'),
  ('Stadtwerke Musterstadt AG', 'versorger', 'Musterstadt'),
  ('Muster Inkasso GmbH', 'inkasso', 'Musterstadt')
ON CONFLICT DO NOTHING;

-- =====================================================================
-- Schuldner (4 Test-Mandanten, ohne auth_user_id — das sind "Akten" ohne Login)
-- aktenzeichen wird vom Trigger generiert.
-- =====================================================================
INSERT INTO schuldner (vorname, nachname, geburtsdatum, email, telefon, strasse, plz, ort, nettoeinkommen, unterhaltspflichten)
VALUES
  ('Erika',   'Mustermann', '1978-03-14', 'erika@example.com', '000 0000001', 'Musterweg 1', '00001', 'Musterstadt', 1800.00, 1),
  ('Max',     'Mustermann', '1985-07-22', 'max@example.com',   '000 0000002', 'Musterweg 2', '00001', 'Musterstadt', 2100.00, 0),
  ('Lisa',    'Beispiel',   '1990-11-02', 'lisa@example.com',  '000 0000003', 'Musterweg 3', '00001', 'Musterstadt', 1450.00, 2),
  ('Otto',    'Normal',     '1962-05-30', 'otto@example.com',  '000 0000004', 'Musterweg 4', '00001', 'Musterstadt',  950.00, 0);

-- =====================================================================
-- Forderungen (mit unterschiedlichen Fristen — ueberfaellig, kritisch, normal, keine)
-- =====================================================================
WITH
  s_erika    AS (SELECT id FROM schuldner WHERE vorname = 'Erika'   LIMIT 1),
  s_max  AS (SELECT id FROM schuldner WHERE vorname = 'Max' LIMIT 1),
  s_lisa  AS (SELECT id FROM schuldner WHERE vorname = 'Lisa'  LIMIT 1),
  g_tel AS (SELECT id FROM glaeubiger WHERE name LIKE 'Beispiel Telefon%'      LIMIT 1),
  g_sw      AS (SELECT id FROM glaeubiger WHERE name LIKE 'Stadtwerke%'   LIMIT 1),
  g_cr      AS (SELECT id FROM glaeubiger WHERE name LIKE 'Muster Inkasso%' LIMIT 1)
INSERT INTO forderung (schuldner_id, glaeubiger_id, quelle, betrag, datum_schreiben, datum_frist, status)
VALUES
  ((SELECT id FROM s_erika),   (SELECT id FROM g_tel), 'post',  487.50,  CURRENT_DATE - 21, CURRENT_DATE - 3, 'neu'),  -- ueberfaellig
  ((SELECT id FROM s_max), (SELECT id FROM g_cr),      'email', 1240.00, CURRENT_DATE - 10, CURRENT_DATE + 4, 'neu'),  -- kritisch (<7 Tage)
  ((SELECT id FROM s_lisa), (SELECT id FROM g_sw),      'post',  312.80,  CURRENT_DATE - 5,  CURRENT_DATE + 21, 'neu'), -- normal
  ((SELECT id FROM s_lisa), (SELECT id FROM g_tel), 'post',  89.90,   CURRENT_DATE - 2,  NULL, 'neu');              -- keine Frist

-- Otto Normal hat bewusst keine Forderungen (Edge-Case: leere Frist-Spalte)

-- =====================================================================
-- Kontrolle
-- =====================================================================
SELECT 'Schuldner:' AS info, count(*) FROM schuldner
UNION ALL SELECT 'Glaeubiger:', count(*) FROM glaeubiger
UNION ALL SELECT 'Forderungen:', count(*) FROM forderung;
