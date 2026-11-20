-- 002_fresh_start.sql
-- Komplett-Neustart: altes 8-Tabellen-Schema droppen,
-- 19-Tabellen-Modell nach InsOManager-Vorbild aufbauen.
-- Stand: 2026-04-13, nach fachlichem Review.
--
-- Reihenfolge:
--   1. DROP alter Objekte (aus 001_initial_schema.sql)
--   2. CREATE TYPE (alle ENUMs)
--   3. CREATE TABLE (1..19, FK-Reihenfolge)
--   4. CREATE INDEX
--   5. Helper-Functions + Trigger (updated_at, aktenzeichen, audit)
--   6. ENABLE ROW LEVEL SECURITY
--   7. CREATE POLICY (mandant / anwalt / admin)
--
-- HINWEIS: Diese Migration wurde manuell auf der Dev-DB ausgefuehrt.
--          Nicht automatisch pushen.

BEGIN;

-- =====================================================================
-- 1. DROP alter Objekte
-- =====================================================================

-- Alte Trigger / Functions
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.fn_handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.fn_generate_aktenzeichen() CASCADE;
DROP FUNCTION IF EXISTS public.fn_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_rolle() CASCADE;
DROP FUNCTION IF EXISTS public.current_user_schuldner_id() CASCADE;

-- Alte Tabellen (Reihenfolge wegen FKs)
DROP TABLE IF EXISTS
    dokument_log,
    brief,
    forderung,
    glaeubiger_vertreter,
    glaeubiger,
    schuldner,
    lead,
    user_profile
CASCADE;

-- =====================================================================
-- 2. Extensions
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- gen_random_uuid()

-- =====================================================================
-- 3. CREATE TYPE (ENUMs)
-- =====================================================================
-- Fuer alle ENUMs gilt: Wo die Spec nicht explizit alle Werte festlegt,
-- sind pragmatische Default-Werte gewaehlt. Fachliche Endpruefung durch die Rechtsseite steht aus.

-- Rollen: mandant darf eigene Daten pflegen, anwalt eigene Faelle, admin alles
CREATE TYPE rolle AS ENUM ('mandant', 'anwalt', 'admin');

-- Zahlungsstatus fuer fall (Produktkauf / Honorar)
CREATE TYPE zahlung_status AS ENUM ('offen', 'aktiv', 'abgeschlossen', 'gescheitert');

-- Fall-Lifecycle: von Self-Service bis Abschluss
-- TODO (Rechtsseite): Enum-Werte final (v.a. Detailstufen im Plan-/Insolvenzteil)
CREATE TYPE fall_status AS ENUM (
    'self_service',
    'ra_gewaehlt',
    'bezahlt',
    'erstschreiben_raus',
    'schutzfrist',
    'plan',
    'plan_versendet',
    'plan_gescheitert',
    'insolvenzantrag',
    'verfahren_eroeffnet',
    'wohlverhaltensphase',
    'abgeschlossen',
    'abgebrochen'
);

-- Verfahrensart nach InsO
CREATE TYPE verfahrensart AS ENUM ('verbraucher', 'regel', 'aussergerichtlich');

-- Dokumentart: konsolidiert Ausgang + Eingang + Anlagen.
-- Ausgang (eigene Erzeugung): erstschreiben, vollmacht, vergleichsangebot,
--   schnellschuss_angebot, nachfass_freundlich, nachfass_unfreundlich, plan,
--   insolvenzantrag, anlage.
-- Eingang (Glaeubiger / Gericht): eingehender_scan, glaeubigerantwort_eingang,
--   gegenangebot_eingang, forderungsaufstellung_eingang,
--   erledigterklaerung_eingang, gerichtliches_schreiben, bescheinigung_305.
CREATE TYPE dokumentart AS ENUM (
    'erstschreiben',
    'vollmacht',
    'vergleichsangebot',
    'schnellschuss_angebot',
    'nachfass_freundlich',
    'nachfass_unfreundlich',
    'plan',
    'insolvenzantrag',
    'anlage',
    'eingehender_scan',
    'glaeubigerantwort_eingang',
    'gegenangebot_eingang',
    'forderungsaufstellung_eingang',
    'erledigterklaerung_eingang',
    'gerichtliches_schreiben',
    'bescheinigung_305',
    'sonstiges'
);

-- Forderungsart
-- TODO (Rechtsseite): Enum-Werte final
CREATE TYPE forderungsart AS ENUM (
    'kredit',
    'kreditkarte',
    'dispo',
    'mietrueckstand',
    'telekommunikation',
    'energie',
    'steuerforderung',
    'sozialversicherung',
    'unterhalt',
    'gerichtskosten',
    'bussgeld',
    'inkasso',
    'sonstiges'
);

-- Einnahmenart
-- TODO (Rechtsseite): Enum-Werte final
CREATE TYPE einnahmenart AS ENUM (
    'nettoeinkommen',
    'selbststaendigkeit',
    'buergergeld',
    'arbeitslosengeld',
    'rente',
    'krankengeld',
    'elterngeld',
    'kindergeld',
    'unterhalt',
    'wohngeld',
    'sonstiges'
);

-- Ausgabenart
-- TODO (Rechtsseite): Enum-Werte final
CREATE TYPE ausgabenart AS ENUM (
    'miete',
    'nebenkosten',
    'strom',
    'heizung',
    'telekommunikation',
    'versicherung',
    'lebensmittel',
    'mobilitaet',
    'unterhalt',
    'sonstiges'
);

-- Ursache-Code: Hauptausloeser der Ueberschuldung, Destatis-Tabelle
-- "Hauptausloeser der Ueberschuldung in %", Berichtsjahr 2024
-- (veroeffentlicht 17.06.2025). Rechtsgrundlage: UeSchuldStatG 2012.
-- 1:1-Uebernahme der Aggregationsebene, damit Statistik-Export
-- (v_ueberschuldungsstatistik, Phase C) ohne Mapping moeglich ist.
CREATE TYPE ursache_code AS ENUM (
    'arbeitslosigkeit',
    'trennung_scheidung_tod_partner',
    'erkrankung_sucht_unfall',
    'unwirtschaftliche_haushaltsfuehrung',
    'gescheiterte_selbststaendigkeit',
    'zahlungsverpflichtung_buergschaft',
    'gescheiterte_immobilienfinanzierung',
    'unzureichende_kreditberatung',
    'niedriges_einkommen',
    'sonstiges'
);

-- Familienstand
CREATE TYPE familienstand AS ENUM (
    'ledig',
    'verheiratet',
    'eingetragene_lebenspartnerschaft',
    'getrennt_lebend',
    'geschieden',
    'verwitwet'
);

-- Wohnsituation
-- TODO (Rechtsseite): Enum-Werte final
CREATE TYPE wohnsituation AS ENUM (
    'mietwohnung',
    'wohneigentum',
    'bei_eltern',
    'wohngemeinschaft',
    'obdachlos',
    'betreute_wohnform',
    'sonstiges'
);

-- Beschaeftigungsstatus
-- TODO (Rechtsseite): Enum-Werte final
CREATE TYPE beschaeftigungsstatus AS ENUM (
    'angestellt',
    'selbststaendig',
    'arbeitslos',
    'rentner',
    'in_ausbildung',
    'student',
    'elternzeit',
    'arbeitsunfaehig',
    'hausfrau_hausmann',
    'sonstiges'
);

-- Glaeubiger-Typ
-- TODO (Rechtsseite): Enum-Werte final
CREATE TYPE glaeubiger_typ AS ENUM (
    'bank',
    'inkasso',
    'telekom',
    'energieversorger',
    'vermieter',
    'finanzamt',
    'sozialversicherung',
    'gerichtskasse',
    'unterhaltsberechtigte',
    'privatperson',
    'online_haendler',
    'versicherung',
    'sonstiges'
);

-- Zustellart fuer Ausgangspost
CREATE TYPE zustellart AS ENUM (
    'einfache_post',
    'einschreiben_einwurf',
    'einschreiben_rueckschein',
    'fax',
    'email',
    'beA',
    'persoenlich'
);

-- =====================================================================
-- 4. CREATE TABLE (19 Tabellen, FK-Reihenfolge)
-- =====================================================================

-- --------------------------------------------------------------- (1)
-- user_profile: verknuepft auth.users mit Anwendungsrolle
CREATE TABLE user_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rolle rolle NOT NULL DEFAULT 'mandant',
    anzeigename TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (2)
-- lead: vor Mandatierung (ersetzt Airtable)
CREATE TABLE lead (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vorname TEXT,
    nachname TEXT,
    email TEXT,
    telefon TEXT,
    kanal TEXT,
    status TEXT DEFAULT 'neu',
    schulden_geschaetzt NUMERIC(12,2),
    berufsstatus TEXT,
    beratungsgrund TEXT,
    notizen TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (3)
-- glaeubiger: UUID PK (Umstellung von BIGINT), Felder ergaenzt
CREATE TABLE glaeubiger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    glaeubiger_typ glaeubiger_typ,
    anrede TEXT,
    ansprechpartner TEXT,
    strasse TEXT,
    plz TEXT,
    ort TEXT,
    email TEXT,
    telefon TEXT,
    fax TEXT,
    iban TEXT,
    bic TEXT,
    vergleichsbereitschaft TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (4)
-- glaeubiger_vertreter: optional, z.B. Inkasso oder Anwaltskanzlei
CREATE TABLE glaeubiger_vertreter (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    glaeubiger_id UUID NOT NULL REFERENCES glaeubiger(id) ON DELETE CASCADE,
    typ TEXT,
    firma TEXT,
    ansprechpartner TEXT,
    strasse TEXT,
    plz TEXT,
    ort TEXT,
    email TEXT,
    telefon TEXT,
    aktenzeichen TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (5)
-- schuldner: Pflichtfelder fuer §305-Formulare ergaenzt
-- pfaendbarer_betrag: wird in packages/engine/ via §850c-JSON berechnet,
--   App schreibt Ergebnis beim Speichern. Kein DB-Trigger, keine Naeherung.
--   Quelle: Pfaendungstabelle des Schuldenrechners
--   (164+ Brackets x 0-5 Unterhaltspflichten, jaehrliches Update in der Engine).
CREATE TABLE schuldner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
    -- Person
    briefanrede TEXT,
    vorname TEXT NOT NULL,
    nachname TEXT NOT NULL,
    geburtsdatum DATE,
    geburtsort TEXT,
    familienstand familienstand,
    anzahl_kinder INTEGER DEFAULT 0 CHECK (anzahl_kinder >= 0),
    wohnsituation wohnsituation,
    beschaeftigungsstatus beschaeftigungsstatus,
    -- Kontakt
    email TEXT,
    telefon TEXT,
    mobil TEXT,
    strasse TEXT,
    plz TEXT,
    ort TEXT,
    -- Finanzen
    nettoeinkommen NUMERIC(10,2),
    unterhaltspflichten INTEGER DEFAULT 0 CHECK (unterhaltspflichten >= 0),
    pfaendbarer_betrag NUMERIC(10,2),  -- wird in packages/engine/ via §850c-JSON berechnet, App schreibt Ergebnis beim Speichern
    iban TEXT,
    p_konto BOOLEAN DEFAULT FALSE,
    -- Historie
    fruehere_insolvenz_jahr INTEGER,
    lead_quelle TEXT,
    erstberatung_datum DATE,
    -- System
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (6)
-- ehepartner: eigene Tabelle (wegen gleichgeschlechtlicher Ehe, eigenem Einkommen)
-- FK -> schuldner, 0..1
CREATE TABLE ehepartner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schuldner_id UUID NOT NULL UNIQUE REFERENCES schuldner(id) ON DELETE CASCADE,
    vorname TEXT,
    nachname TEXT,
    geburtsdatum DATE,
    getrennt_lebend BOOLEAN DEFAULT FALSE,
    nettoeinkommen NUMERIC(10,2),
    unterhaltspflichten_gemeinsame_kinder INTEGER DEFAULT 0,
    unterhaltspflichten_andere INTEGER DEFAULT 0,
    beschaeftigungsstatus beschaeftigungsstatus,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (7)
-- einnahmen: Liste, FK -> schuldner (§850c ZPO Haushaltsrechnung)
CREATE TABLE einnahmen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schuldner_id UUID NOT NULL REFERENCES schuldner(id) ON DELETE CASCADE,
    art einnahmenart NOT NULL,
    bezeichnung TEXT,
    betrag_monatlich NUMERIC(10,2) NOT NULL,
    pfaendbar BOOLEAN DEFAULT TRUE,
    nachweis_dokument_id UUID,  -- FK auf dokument(id) wird spaeter gesetzt (zirkulaere Abhaengigkeit)
    gueltig_ab DATE,
    gueltig_bis DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (8)
-- ausgaben: Liste, FK -> schuldner
CREATE TABLE ausgaben (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schuldner_id UUID NOT NULL REFERENCES schuldner(id) ON DELETE CASCADE,
    art ausgabenart NOT NULL,
    bezeichnung TEXT,
    betrag_monatlich NUMERIC(10,2) NOT NULL,
    nachweis_dokument_id UUID,
    gueltig_ab DATE,
    gueltig_bis DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (9)
-- fall: Herzstueck. Akte / Beratungsfall.
-- aktenzeichen: Format SP26XYMMABC (Initialen-basiert) -> per Trigger
CREATE TABLE fall (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schuldner_id UUID NOT NULL REFERENCES schuldner(id) ON DELETE RESTRICT,
    aktenzeichen TEXT UNIQUE,  -- auto via trg_fall_aktenzeichen
    anwalt_id UUID REFERENCES user_profile(id) ON DELETE SET NULL,
    zustaendiger TEXT,  -- Berater-Kuerzel, haendisch gepflegt
    -- Lifecycle
    status fall_status NOT NULL DEFAULT 'self_service',
    verfahrensart verfahrensart,
    produkt_variante SMALLINT CHECK (produkt_variante IN (0,1,2,3)),
    -- Zahlung
    honorar_betrag NUMERIC(10,2),
    honorar_bezahlt NUMERIC(10,2) DEFAULT 0,
    zahlung_status zahlung_status NOT NULL DEFAULT 'offen',
    -- Fristen
    erstberatung_datum DATE,
    erstschreiben_datum DATE,
    schutzfrist_bis DATE,  -- Erstschreiben + 3 Monate (§305a InsO)
    abschluss_datum DATE,
    -- System
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (10)
-- forderung: FK -> fall. Betraege gesplittet, gesamtbetrag GENERATED.
CREATE TABLE forderung (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fall_id UUID NOT NULL REFERENCES fall(id) ON DELETE CASCADE,
    glaeubiger_id UUID REFERENCES glaeubiger(id) ON DELETE SET NULL,
    vertreter_id UUID REFERENCES glaeubiger_vertreter(id) ON DELETE SET NULL,
    -- Identifikation
    quelle TEXT,
    dokument_pfad TEXT,  -- deprecated; siehe dokument-Tabelle
    az_glaeubiger TEXT,
    charakter TEXT,  -- A, B, C ... bei mehreren Konten desselben Glaeubigers
    art forderungsart,
    -- Betraege gesplittet
    hauptforderung NUMERIC(12,2) NOT NULL DEFAULT 0,
    zinsen NUMERIC(12,2) NOT NULL DEFAULT 0,
    kosten NUMERIC(12,2) NOT NULL DEFAULT 0,
    gesamtbetrag NUMERIC(12,2)
        GENERATED ALWAYS AS (hauptforderung + zinsen + kosten) STORED,
    -- Flags
    bestritten BOOLEAN NOT NULL DEFAULT FALSE,
    absonderungsrecht BOOLEAN NOT NULL DEFAULT FALSE,
    absonderung_detail TEXT,
    titulierung BOOLEAN NOT NULL DEFAULT FALSE,
    titulierungsdatum DATE,
    -- nullplan_abgelehnt: App-Logik (Beraterkreuz-Endpoint in apps/web/app/api),
    -- kein DB-Trigger. Siehe docs/05-data-model.md.
    nullplan_abgelehnt BOOLEAN NOT NULL DEFAULT FALSE,
    nicht_kontaktieren BOOLEAN NOT NULL DEFAULT FALSE,
    datum_schreiben DATE,
    datum_frist DATE,
    match_confidence TEXT,
    status TEXT DEFAULT 'neu',
    raw_extraction JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (11)
-- verschuldungsursache: §Ueberschuldungsstatistikgesetz (PFLICHT seit 2012)
CREATE TABLE verschuldungsursache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fall_id UUID NOT NULL REFERENCES fall(id) ON DELETE CASCADE,
    code ursache_code NOT NULL,
    ist_hauptursache BOOLEAN NOT NULL DEFAULT FALSE,
    anmerkung TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (12)
-- aktennotiz: Beratungsprotokolle (Nachweispflicht)
CREATE TABLE aktennotiz (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fall_id UUID NOT NULL REFERENCES fall(id) ON DELETE CASCADE,
    verfasser_id UUID REFERENCES user_profile(id) ON DELETE SET NULL,
    datum TIMESTAMPTZ NOT NULL DEFAULT now(),
    titel TEXT,
    inhalt TEXT NOT NULL,
    intern BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (13)
-- dokument: konsolidiert (ersetzt brief). Ausgang + Eingang + Anlagen.
CREATE TABLE dokument (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fall_id UUID REFERENCES fall(id) ON DELETE CASCADE,
    forderung_id UUID REFERENCES forderung(id) ON DELETE SET NULL,
    glaeubiger_id UUID REFERENCES glaeubiger(id) ON DELETE SET NULL,
    dokumentart dokumentart NOT NULL,
    titel TEXT,
    dokument_pfad TEXT,  -- Supabase Storage Key
    -- Ausgangspost (nullable; nur bei ausgehenden Dokumenten befuellt)
    versandstatus TEXT,  -- 'entwurf' | 'freigabe_pending' | 'gesendet' | 'zugestellt' | 'fehlgeschlagen'
    empfaenger_adresse TEXT,
    zustellart zustellart,
    tracking_nummer TEXT,
    versanddatum TIMESTAMPTZ,
    -- Eingangspost
    eingangsdatum TIMESTAMPTZ,
    absender TEXT,
    -- System
    erstellt_von UUID REFERENCES user_profile(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jetzt wo dokument existiert, FKs von einnahmen/ausgaben nachziehen
ALTER TABLE einnahmen
    ADD CONSTRAINT fk_einnahmen_nachweis
    FOREIGN KEY (nachweis_dokument_id) REFERENCES dokument(id) ON DELETE SET NULL;
ALTER TABLE ausgaben
    ADD CONSTRAINT fk_ausgaben_nachweis
    FOREIGN KEY (nachweis_dokument_id) REFERENCES dokument(id) ON DELETE SET NULL;

-- --------------------------------------------------------------- (14)
-- dokument_log: Ingestion-Pipeline-Logs (technisch, nicht Akte)
CREATE TABLE dokument_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quelle TEXT NOT NULL,
    referenz TEXT NOT NULL,
    status TEXT DEFAULT 'verarbeitet',
    dokument_id UUID REFERENCES dokument(id) ON DELETE SET NULL,
    fehler TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (15)
-- schuldenbereinigungsplan: §305 Abs. 1 Nr. 1 InsO
CREATE TABLE schuldenbereinigungsplan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fall_id UUID NOT NULL REFERENCES fall(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    erstellt_am DATE NOT NULL DEFAULT CURRENT_DATE,
    versendet_am DATE,
    laufzeit_monate INTEGER,
    monatsrate NUMERIC(10,2),
    quote_prozent NUMERIC(5,2),
    nullplan BOOLEAN NOT NULL DEFAULT FALSE,
    flexibler_nullplan BOOLEAN NOT NULL DEFAULT FALSE,
    gescheitert BOOLEAN NOT NULL DEFAULT FALSE,
    gescheitert_am DATE,
    -- gescheitert/gescheitert_am: App-Logik (Beraterkreuz-Endpoint in apps/web/app/api),
    -- kein DB-Trigger. Regel: >50% nach Koepfen ODER >50% nach Summe abgelehnt.
    -- Siehe docs/05-data-model.md.
    notizen TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (16)
-- glaeubiger_antwort: Reaktion auf Plan; Fristen §305 InsO (6/10 Wochen)
CREATE TABLE glaeubiger_antwort (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES schuldenbereinigungsplan(id) ON DELETE CASCADE,
    forderung_id UUID NOT NULL REFERENCES forderung(id) ON DELETE CASCADE,
    empfangen_am DATE,
    frist_6_wochen DATE,
    frist_10_wochen DATE,
    erinnerung_1 DATE,
    erinnerung_2 DATE,
    -- nach_aktenlage: App-Logik (Cronjob setzt Flag nach Fristablauf ohne Reaktion),
    -- kein DB-Trigger. Siehe docs/05-data-model.md.
    nach_aktenlage BOOLEAN NOT NULL DEFAULT FALSE,
    zustimmung TEXT,  -- 'zustimmung' | 'ablehnung' | 'gegenvorschlag' | 'ohne_reaktion'
    gegenvorschlag_betrag NUMERIC(10,2),
    gegenvorschlag_detail TEXT,
    eingang_dokument_id UUID REFERENCES dokument(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (17)
-- insolvenzantrag: nur wenn Plan gescheitert
CREATE TABLE insolvenzantrag (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fall_id UUID NOT NULL UNIQUE REFERENCES fall(id) ON DELETE CASCADE,
    verfahrensart verfahrensart NOT NULL,
    eingereicht_am DATE,
    gericht TEXT,
    gerichtliches_aktenzeichen TEXT,
    eroeffnet_am DATE,
    treuhaender TEXT,
    wohlverhaltensphase_bis DATE,
    erteilung_restschuldbefreiung DATE,
    antrag_dokument_id UUID REFERENCES dokument(id) ON DELETE SET NULL,
    bescheinigung_305_dokument_id UUID REFERENCES dokument(id) ON DELETE SET NULL,
    notizen TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- --------------------------------------------------------------- (18)
-- audit_log: generisch fuer Kerntabellen
CREATE TABLE audit_log (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
    changed_by UUID,
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    old_data JSONB,
    new_data JSONB
);

-- --------------------------------------------------------------- (19)
-- nummernkreis: lueckenlose Sequenzen je Jahr (fuer Compliance)
CREATE TABLE nummernkreis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kreis TEXT NOT NULL,   -- z.B. 'fall', 'brief_ausgang'
    jahr INTEGER NOT NULL,
    letzte_nummer INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (kreis, jahr)
);

-- =====================================================================
-- 5. Indizes (FKs + haeufige Filter)
-- =====================================================================

-- Glaeubiger-Matching via Trigram
CREATE INDEX idx_glaeubiger_name_trgm ON glaeubiger USING GIN (name gin_trgm_ops);

-- Haeufige Joins
CREATE INDEX idx_schuldner_auth_user ON schuldner(auth_user_id);
CREATE INDEX idx_fall_schuldner ON fall(schuldner_id);
CREATE INDEX idx_fall_anwalt ON fall(anwalt_id);
CREATE INDEX idx_fall_status ON fall(status);
CREATE INDEX idx_fall_aktenzeichen ON fall(aktenzeichen);
CREATE INDEX idx_forderung_fall ON forderung(fall_id);
CREATE INDEX idx_forderung_glaeubiger ON forderung(glaeubiger_id);
CREATE INDEX idx_einnahmen_schuldner ON einnahmen(schuldner_id);
CREATE INDEX idx_ausgaben_schuldner ON ausgaben(schuldner_id);
CREATE INDEX idx_aktennotiz_fall ON aktennotiz(fall_id);
CREATE INDEX idx_dokument_fall ON dokument(fall_id);
CREATE INDEX idx_dokument_art ON dokument(dokumentart);
CREATE INDEX idx_plan_fall ON schuldenbereinigungsplan(fall_id);
CREATE INDEX idx_glaubigerantwort_plan ON glaeubiger_antwort(plan_id);
CREATE INDEX idx_glaubigerantwort_forderung ON glaeubiger_antwort(forderung_id);
CREATE INDEX idx_audit_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_changed_at ON audit_log(changed_at);

-- =====================================================================
-- 6. Helper-Functions
-- =====================================================================

-- Rolle des aktuellen Auth-Users
CREATE OR REPLACE FUNCTION current_user_rolle()
RETURNS rolle AS $$
    SELECT rolle FROM public.user_profile WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Schuldner-ID des aktuellen Mandanten
CREATE OR REPLACE FUNCTION current_user_schuldner_id()
RETURNS UUID AS $$
    SELECT id FROM public.schuldner WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- updated_at automatisch setzen
CREATE OR REPLACE FUNCTION fn_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bei neuem Auth-User: user_profile anlegen (Default rolle=mandant)
-- WICHTIG: SECURITY DEFINER + SET search_path = public, sonst findet der
-- Trigger (laeuft im auth-Kontext) weder den Type 'rolle' noch die Tabelle
-- user_profile -> auth.users INSERT schlaegt fehl mit "Database error".
CREATE OR REPLACE FUNCTION public.fn_handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_profile (id, rolle, anzeigename)
    VALUES (
        NEW.id,
        COALESCE((NEW.raw_user_meta_data->>'rolle')::public.rolle, 'mandant'::public.rolle),
        COALESCE(NEW.raw_user_meta_data->>'anzeigename', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aktenzeichen generieren: SP26XYMMABC
CREATE OR REPLACE FUNCTION fn_generate_aktenzeichen()
RETURNS TRIGGER AS $$
DECLARE
    seq INT;
    s schuldner%ROWTYPE;
    vorname_initial TEXT;
    nachname_initial TEXT;
    code TEXT;
BEGIN
    SELECT * INTO s FROM schuldner WHERE id = NEW.schuldner_id;
    IF s IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT COUNT(*) + 1 INTO seq
    FROM fall
    WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM now())
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());

    vorname_initial := UPPER(COALESCE(LEFT(s.vorname, 1), 'X'));
    nachname_initial := UPPER(COALESCE(LEFT(s.nachname, 1), 'X'));

    code := 'SP'
        || TO_CHAR(now(), 'YY')
        || nachname_initial || vorname_initial
        || TO_CHAR(now(), 'MM')
        || CHR(65 + ((seq / 676) % 26))
        || CHR(65 + ((seq / 26) % 26))
        || CHR(65 + (seq % 26));

    NEW.aktenzeichen := code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- pfaendbarer_betrag wird in packages/engine/ via §850c-JSON berechnet.
-- App schreibt Ergebnis beim Speichern in schuldner.pfaendbarer_betrag.
-- Kein DB-Trigger, keine Naeherung. Siehe docs/05-data-model.md.

-- Generische Audit-Funktion
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    rec_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        rec_id := OLD.id;
    ELSE
        rec_id := NEW.id;
    END IF;

    INSERT INTO audit_log (table_name, record_id, action, changed_by, old_data, new_data)
    VALUES (
        TG_TABLE_NAME,
        rec_id,
        TG_OP,
        auth.uid(),
        CASE WHEN TG_OP IN ('UPDATE','DELETE') THEN to_jsonb(OLD) END,
        CASE WHEN TG_OP IN ('INSERT','UPDATE') THEN to_jsonb(NEW) END
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================================
-- 7. Trigger
-- =====================================================================

-- updated_at
CREATE TRIGGER trg_user_profile_updated BEFORE UPDATE ON user_profile
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_lead_updated BEFORE UPDATE ON lead
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_glaeubiger_updated BEFORE UPDATE ON glaeubiger
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_schuldner_updated BEFORE UPDATE ON schuldner
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_ehepartner_updated BEFORE UPDATE ON ehepartner
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_einnahmen_updated BEFORE UPDATE ON einnahmen
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_ausgaben_updated BEFORE UPDATE ON ausgaben
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_fall_updated BEFORE UPDATE ON fall
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_forderung_updated BEFORE UPDATE ON forderung
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_aktennotiz_updated BEFORE UPDATE ON aktennotiz
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_dokument_updated BEFORE UPDATE ON dokument
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_plan_updated BEFORE UPDATE ON schuldenbereinigungsplan
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_glaubigerantwort_updated BEFORE UPDATE ON glaeubiger_antwort
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_insolvenzantrag_updated BEFORE UPDATE ON insolvenzantrag
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();

-- Aktenzeichen auto-generieren
CREATE TRIGGER trg_fall_aktenzeichen
    BEFORE INSERT ON fall
    FOR EACH ROW
    WHEN (NEW.aktenzeichen IS NULL)
    EXECUTE FUNCTION fn_generate_aktenzeichen();

-- Bei neuem Auth-User: user_profile anlegen
CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();

-- pfaendbarer_betrag: kein DB-Trigger. Berechnung in packages/engine/ (§850c-JSON),
-- App schreibt Ergebnis beim Speichern in schuldner.pfaendbarer_betrag.

-- Audit-Log auf Kerntabellen
CREATE TRIGGER trg_audit_schuldner
    AFTER INSERT OR UPDATE OR DELETE ON schuldner
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_fall
    AFTER INSERT OR UPDATE OR DELETE ON fall
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_forderung
    AFTER INSERT OR UPDATE OR DELETE ON forderung
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_plan
    AFTER INSERT OR UPDATE OR DELETE ON schuldenbereinigungsplan
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_glaubigerantwort
    AFTER INSERT OR UPDATE OR DELETE ON glaeubiger_antwort
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_insolvenzantrag
    AFTER INSERT OR UPDATE OR DELETE ON insolvenzantrag
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_dokument
    AFTER INSERT OR UPDATE OR DELETE ON dokument
    FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- =====================================================================
-- 8. Row Level Security
-- =====================================================================

ALTER TABLE user_profile              ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE glaeubiger                ENABLE ROW LEVEL SECURITY;
ALTER TABLE glaeubiger_vertreter      ENABLE ROW LEVEL SECURITY;
ALTER TABLE schuldner                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE ehepartner                ENABLE ROW LEVEL SECURITY;
ALTER TABLE einnahmen                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE ausgaben                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fall                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE forderung                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE verschuldungsursache      ENABLE ROW LEVEL SECURITY;
ALTER TABLE aktennotiz                ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokument                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokument_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE schuldenbereinigungsplan  ENABLE ROW LEVEL SECURITY;
ALTER TABLE glaeubiger_antwort        ENABLE ROW LEVEL SECURITY;
ALTER TABLE insolvenzantrag           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE nummernkreis              ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 9. RLS Policies
-- =====================================================================

-- ---- admin sieht/bearbeitet alles ---------------------------------
CREATE POLICY admin_all_user_profile             ON user_profile             FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_lead                     ON lead                     FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_glaeubiger               ON glaeubiger               FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_glaeubiger_vertreter     ON glaeubiger_vertreter     FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_schuldner                ON schuldner                FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_ehepartner               ON ehepartner               FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_einnahmen                ON einnahmen                FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_ausgaben                 ON ausgaben                 FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_fall                     ON fall                     FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_forderung                ON forderung                FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_verschuldungsursache     ON verschuldungsursache     FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_aktennotiz               ON aktennotiz               FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_dokument                 ON dokument                 FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_dokument_log             ON dokument_log             FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_plan                     ON schuldenbereinigungsplan FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_glaubigerantwort         ON glaeubiger_antwort       FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_insolvenzantrag          ON insolvenzantrag          FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_audit_log                ON audit_log                FOR ALL USING (current_user_rolle() = 'admin');
CREATE POLICY admin_all_nummernkreis             ON nummernkreis             FOR ALL USING (current_user_rolle() = 'admin');

-- ---- user_profile: jeder sieht sein eigenes Profil ----------------
CREATE POLICY self_read_profile ON user_profile
    FOR SELECT USING (id = auth.uid());
CREATE POLICY self_update_profile ON user_profile
    FOR UPDATE USING (id = auth.uid());

-- ---- lead: nur anwalt + admin -------------------------------------
CREATE POLICY anwalt_manage_lead ON lead
    FOR ALL USING (current_user_rolle() = 'anwalt');

-- ---- glaeubiger: lesen fuer alle Authentifizierten ----------------
CREATE POLICY auth_read_glaeubiger ON glaeubiger
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY anwalt_manage_glaeubiger ON glaeubiger
    FOR ALL USING (current_user_rolle() = 'anwalt');
CREATE POLICY auth_read_glaeubiger_vertreter ON glaeubiger_vertreter
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY anwalt_manage_glaeubiger_vertreter ON glaeubiger_vertreter
    FOR ALL USING (current_user_rolle() = 'anwalt');

-- ---- schuldner: Mandant sieht/updatet nur sich selbst -------------
CREATE POLICY mandant_read_own_schuldner ON schuldner
    FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY mandant_update_own_schuldner ON schuldner
    FOR UPDATE USING (auth_user_id = auth.uid());
-- Anwalt sieht Schuldner, zu denen ein Fall mit anwalt_id = auth.uid() existiert
CREATE POLICY anwalt_read_assigned_schuldner ON schuldner
    FOR SELECT USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.schuldner_id = schuldner.id
               AND f.anwalt_id = auth.uid()
        )
    );
CREATE POLICY anwalt_update_assigned_schuldner ON schuldner
    FOR UPDATE USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.schuldner_id = schuldner.id
               AND f.anwalt_id = auth.uid()
        )
    );

-- ---- ehepartner / einnahmen / ausgaben: via schuldner-Besitz ------
CREATE POLICY mandant_own_ehepartner ON ehepartner
    FOR ALL USING (schuldner_id = current_user_schuldner_id());
CREATE POLICY anwalt_assigned_ehepartner ON ehepartner
    FOR ALL USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.schuldner_id = ehepartner.schuldner_id
               AND f.anwalt_id = auth.uid()
        )
    );

CREATE POLICY mandant_own_einnahmen ON einnahmen
    FOR ALL USING (schuldner_id = current_user_schuldner_id());
CREATE POLICY anwalt_assigned_einnahmen ON einnahmen
    FOR ALL USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.schuldner_id = einnahmen.schuldner_id
               AND f.anwalt_id = auth.uid()
        )
    );

CREATE POLICY mandant_own_ausgaben ON ausgaben
    FOR ALL USING (schuldner_id = current_user_schuldner_id());
CREATE POLICY anwalt_assigned_ausgaben ON ausgaben
    FOR ALL USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.schuldner_id = ausgaben.schuldner_id
               AND f.anwalt_id = auth.uid()
        )
    );

-- ---- fall: Mandant eigener Fall, Anwalt seine zugewiesenen --------
CREATE POLICY mandant_read_own_fall ON fall
    FOR SELECT USING (schuldner_id = current_user_schuldner_id());
CREATE POLICY mandant_update_own_fall ON fall
    FOR UPDATE USING (
        schuldner_id = current_user_schuldner_id()
        -- Mandant darf nur in self_service-Phase editieren
        AND status = 'self_service'
    );
CREATE POLICY anwalt_read_assigned_fall ON fall
    FOR SELECT USING (
        current_user_rolle() = 'anwalt' AND anwalt_id = auth.uid()
    );
CREATE POLICY anwalt_update_assigned_fall ON fall
    FOR ALL USING (
        current_user_rolle() = 'anwalt' AND anwalt_id = auth.uid()
    );

-- ---- forderung / verschuldungsursache / aktennotiz / plan / antwort / insolvenz:
--       via fall-Besitz
CREATE POLICY mandant_read_own_forderung ON forderung
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = forderung.fall_id
               AND f.schuldner_id = current_user_schuldner_id()
        )
    );
CREATE POLICY anwalt_all_forderung ON forderung
    FOR ALL USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = forderung.fall_id
               AND f.anwalt_id = auth.uid()
        )
    );

CREATE POLICY mandant_read_verschuldungsursache ON verschuldungsursache
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = verschuldungsursache.fall_id
               AND f.schuldner_id = current_user_schuldner_id()
        )
    );
CREATE POLICY anwalt_all_verschuldungsursache ON verschuldungsursache
    FOR ALL USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = verschuldungsursache.fall_id
               AND f.anwalt_id = auth.uid()
        )
    );

-- Aktennotizen sind in der Regel intern; Mandant sieht nur nicht-interne
CREATE POLICY mandant_read_aktennotiz ON aktennotiz
    FOR SELECT USING (
        intern = FALSE
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = aktennotiz.fall_id
               AND f.schuldner_id = current_user_schuldner_id()
        )
    );
CREATE POLICY anwalt_all_aktennotiz ON aktennotiz
    FOR ALL USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = aktennotiz.fall_id
               AND f.anwalt_id = auth.uid()
        )
    );

-- dokument: Mandant darf eigene lesen, aber NIE 'gesendet'-Status erzeugen
CREATE POLICY mandant_read_dokument ON dokument
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = dokument.fall_id
               AND f.schuldner_id = current_user_schuldner_id()
        )
    );
CREATE POLICY mandant_insert_dokument ON dokument
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = dokument.fall_id
               AND f.schuldner_id = current_user_schuldner_id()
        )
        AND (versandstatus IS NULL OR versandstatus <> 'gesendet')
    );
CREATE POLICY mandant_update_dokument ON dokument
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = dokument.fall_id
               AND f.schuldner_id = current_user_schuldner_id()
        )
    ) WITH CHECK (
        versandstatus IS NULL OR versandstatus <> 'gesendet'
    );
CREATE POLICY anwalt_all_dokument ON dokument
    FOR ALL USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = dokument.fall_id
               AND f.anwalt_id = auth.uid()
        )
    );

-- dokument_log: nur anwalt/admin
CREATE POLICY anwalt_all_dokument_log ON dokument_log
    FOR ALL USING (current_user_rolle() = 'anwalt');

-- plan
CREATE POLICY mandant_read_plan ON schuldenbereinigungsplan
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = schuldenbereinigungsplan.fall_id
               AND f.schuldner_id = current_user_schuldner_id()
        )
    );
CREATE POLICY anwalt_all_plan ON schuldenbereinigungsplan
    FOR ALL USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = schuldenbereinigungsplan.fall_id
               AND f.anwalt_id = auth.uid()
        )
    );

-- glaeubiger_antwort
CREATE POLICY mandant_read_glaubigerantwort ON glaeubiger_antwort
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM schuldenbereinigungsplan p
            JOIN fall f ON f.id = p.fall_id
             WHERE p.id = glaeubiger_antwort.plan_id
               AND f.schuldner_id = current_user_schuldner_id()
        )
    );
CREATE POLICY anwalt_all_glaubigerantwort ON glaeubiger_antwort
    FOR ALL USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM schuldenbereinigungsplan p
            JOIN fall f ON f.id = p.fall_id
             WHERE p.id = glaeubiger_antwort.plan_id
               AND f.anwalt_id = auth.uid()
        )
    );

-- insolvenzantrag
CREATE POLICY mandant_read_insolvenzantrag ON insolvenzantrag
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = insolvenzantrag.fall_id
               AND f.schuldner_id = current_user_schuldner_id()
        )
    );
CREATE POLICY anwalt_all_insolvenzantrag ON insolvenzantrag
    FOR ALL USING (
        current_user_rolle() = 'anwalt'
        AND EXISTS (
            SELECT 1 FROM fall f
             WHERE f.id = insolvenzantrag.fall_id
               AND f.anwalt_id = auth.uid()
        )
    );

-- audit_log: nur admin (bereits via admin-Policy geregelt; anwalt nicht)
-- nummernkreis: nur admin (s.o.)

COMMIT;

-- Ende 002_fresh_start.sql
