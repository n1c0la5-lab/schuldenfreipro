-- =====================================================================
-- 003_rolle_anwalt_zu_berater.sql
-- Benennt Enum-Wert rolle.anwalt in rolle.berater um.
-- Grund: Alltagssprachlich "Berater" statt "Anwalt", konsistent mit UI-Spec.
-- Policies und Spaltenname fall.anwalt_id bleiben unberuehrt (spaeter separat).
-- PG12+: RENAME VALUE aendert nur das Label, OID bleibt -> Policies intakt.
-- =====================================================================

ALTER TYPE rolle RENAME VALUE 'anwalt' TO 'berater';
