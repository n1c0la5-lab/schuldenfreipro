-- SchuldenPRO — Vereinfachtes Schema
-- 8 Tabellen, 1 Schema (public), Multi-Tenancy via Supabase Auth
-- Stand: 2026-04-11

-- =====================================================================
-- Auth & Rollen
-- =====================================================================

-- User-Profil (verknuepft Supabase Auth mit Anwendungsrolle)
CREATE TABLE user_profile (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rolle TEXT NOT NULL CHECK (rolle IN ('mandant', 'berater')),
    anzeigename TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Leads (ersetzt Airtable — eingehende Kontakte vor Mandatierung)
CREATE TABLE lead (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vorname TEXT,
    nachname TEXT,
    email TEXT,
    telefon TEXT,
    kanal TEXT,                          -- website, lead-agency, direktanruf, whatsapp
    status TEXT DEFAULT 'neu',           -- neu, warm, erstgespraech, abschluss, aktiv, inaktiv
    schulden_geschaetzt NUMERIC(12,2),
    berufsstatus TEXT,
    beratungsgrund TEXT,
    notizen TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================================
-- Kerntabellen
-- =====================================================================

-- Schuldner (Mandant — verknuepft mit auth.users)
CREATE TABLE schuldner (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id),
    aktenzeichen TEXT UNIQUE NOT NULL,
    vorname TEXT NOT NULL,
    nachname TEXT NOT NULL,
    geburtsdatum DATE,
    email TEXT,
    telefon TEXT,
    strasse TEXT,
    plz TEXT,
    ort TEXT,
    nettoeinkommen NUMERIC(10,2),
    unterhaltspflichten INTEGER DEFAULT 0,
    p_konto BOOLEAN DEFAULT FALSE,
    fruehere_insolvenz_jahr INTEGER,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Glaeubiger (Stammdaten)
CREATE TABLE glaeubiger (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    typ TEXT,
    anrede TEXT,
    ansprechpartner TEXT,
    strasse TEXT,
    plz TEXT,
    ort TEXT,
    email TEXT,
    telefon TEXT,
    vergleichsbereitschaft TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Glaeubiger-Vertreter (Inkasso, Anwaelte)
CREATE TABLE glaeubiger_vertreter (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    glaeubiger_id BIGINT REFERENCES glaeubiger(id),
    typ TEXT,
    firma TEXT,
    ansprechpartner TEXT,
    strasse TEXT,
    plz TEXT,
    ort TEXT,
    email TEXT,
    telefon TEXT,
    aktenzeichen TEXT
);

-- Forderungen (1 Tabelle statt 4)
CREATE TABLE forderung (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schuldner_id UUID REFERENCES schuldner(id) NOT NULL,
    glaeubiger_id BIGINT REFERENCES glaeubiger(id),
    vertreter_id BIGINT REFERENCES glaeubiger_vertreter(id),
    quelle TEXT NOT NULL,
    dokument_pfad TEXT,
    az_glaeubiger TEXT,
    betrag NUMERIC(12,2),
    tituliert BOOLEAN DEFAULT FALSE,
    datum_schreiben DATE,
    datum_frist DATE,
    art TEXT,
    nicht_kontaktieren BOOLEAN DEFAULT FALSE,
    match_confidence TEXT,
    status TEXT DEFAULT 'neu',
    raw_extraction JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Briefe (Ausgang)
CREATE TABLE brief (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    forderung_id UUID REFERENCES forderung(id) NOT NULL,
    schuldner_id UUID REFERENCES schuldner(id) NOT NULL,
    glaeubiger_id BIGINT REFERENCES glaeubiger(id),
    typ TEXT NOT NULL,
    gesendet BOOLEAN DEFAULT FALSE,
    gesendet_am TIMESTAMPTZ,
    dokument_pfad TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Dokument-Log
CREATE TABLE dokument_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quelle TEXT NOT NULL,
    referenz TEXT NOT NULL,
    status TEXT DEFAULT 'verarbeitet',
    fehler TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger: Aktenzeichen auto-generieren
CREATE OR REPLACE FUNCTION fn_generate_aktenzeichen()
RETURNS TRIGGER AS $$
DECLARE
    seq INT;
    code TEXT;
BEGIN
    SELECT COUNT(*) + 1 INTO seq
    FROM schuldner
    WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM now())
      AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM now());

    code := 'SP'
        || TO_CHAR(now(), 'YY')
        || UPPER(LEFT(NEW.nachname, 1)) || UPPER(LEFT(NEW.vorname, 1))
        || TO_CHAR(now(), 'MM')
        || CHR(65 + (seq / 676)) || CHR(65 + ((seq / 26) % 26)) || CHR(65 + (seq % 26));

    NEW.aktenzeichen := code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_aktenzeichen
    BEFORE INSERT ON schuldner
    FOR EACH ROW
    WHEN (NEW.aktenzeichen IS NULL)
    EXECUTE FUNCTION fn_generate_aktenzeichen();

-- Trigger: updated_at automatisch setzen
CREATE OR REPLACE FUNCTION fn_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_schuldner_updated BEFORE UPDATE ON schuldner
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();
CREATE TRIGGER trg_forderung_updated BEFORE UPDATE ON forderung
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();

-- Glaeubiger-Matching: pg_trgm Extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_glaeubiger_name_trgm ON glaeubiger USING GIN (name gin_trgm_ops);

-- Trigger: updated_at fuer lead
CREATE TRIGGER trg_lead_updated BEFORE UPDATE ON lead
    FOR EACH ROW EXECUTE FUNCTION fn_updated_at();

-- Trigger: Bei neuem Auth-User automatisch user_profile anlegen (Default: mandant)
CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profile (id, rolle, anzeigename)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'rolle', 'mandant'),
        COALESCE(NEW.raw_user_meta_data->>'anzeigename', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION fn_handle_new_user();

-- =====================================================================
-- Helper: Rolle des aktuellen Users abfragen
-- =====================================================================

CREATE OR REPLACE FUNCTION current_user_rolle()
RETURNS TEXT AS $$
    SELECT rolle FROM public.user_profile WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_schuldner_id()
RETURNS UUID AS $$
    SELECT id FROM public.schuldner WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =====================================================================
-- RLS aktivieren
-- =====================================================================

ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead ENABLE ROW LEVEL SECURITY;
ALTER TABLE schuldner ENABLE ROW LEVEL SECURITY;
ALTER TABLE glaeubiger ENABLE ROW LEVEL SECURITY;
ALTER TABLE forderung ENABLE ROW LEVEL SECURITY;
ALTER TABLE brief ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokument_log ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RLS Policies
-- =====================================================================

-- user_profile: Jeder sieht sein eigenes Profil
CREATE POLICY "users_own_profile" ON user_profile
    FOR ALL USING (id = auth.uid());

-- lead: Nur Berater
CREATE POLICY "berater_manage_leads" ON lead
    FOR ALL USING (current_user_rolle() = 'berater');

-- schuldner: Mandant sieht nur sich selbst, Berater sieht alle
CREATE POLICY "mandant_own_data" ON schuldner
    FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY "mandant_update_own" ON schuldner
    FOR UPDATE USING (auth_user_id = auth.uid());
CREATE POLICY "berater_all_schuldner" ON schuldner
    FOR ALL USING (current_user_rolle() = 'berater');

-- glaeubiger: Lesen fuer alle authentifizierten, Schreiben nur Berater
CREATE POLICY "authenticated_read_glaeubiger" ON glaeubiger
    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "berater_manage_glaeubiger" ON glaeubiger
    FOR ALL USING (current_user_rolle() = 'berater');

-- forderung: Mandant sieht eigene, Berater sieht alle
CREATE POLICY "mandant_own_forderungen" ON forderung
    FOR SELECT USING (schuldner_id = current_user_schuldner_id());
CREATE POLICY "mandant_insert_forderung" ON forderung
    FOR INSERT WITH CHECK (schuldner_id = current_user_schuldner_id());
CREATE POLICY "berater_all_forderungen" ON forderung
    FOR ALL USING (current_user_rolle() = 'berater');

-- brief: Mandant sieht eigene, Berater sieht alle
CREATE POLICY "mandant_own_briefe" ON brief
    FOR SELECT USING (schuldner_id = current_user_schuldner_id());
CREATE POLICY "berater_all_briefe" ON brief
    FOR ALL USING (current_user_rolle() = 'berater');

-- dokument_log: Nur Berater
CREATE POLICY "berater_manage_logs" ON dokument_log
    FOR ALL USING (current_user_rolle() = 'berater');
