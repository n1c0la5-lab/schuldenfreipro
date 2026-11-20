export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      aktennotiz: {
        Row: {
          created_at: string
          datum: string
          fall_id: string
          id: string
          inhalt: string
          intern: boolean
          titel: string | null
          updated_at: string
          verfasser_id: string | null
        }
        Insert: {
          created_at?: string
          datum?: string
          fall_id: string
          id?: string
          inhalt: string
          intern?: boolean
          titel?: string | null
          updated_at?: string
          verfasser_id?: string | null
        }
        Update: {
          created_at?: string
          datum?: string
          fall_id?: string
          id?: string
          inhalt?: string
          intern?: boolean
          titel?: string | null
          updated_at?: string
          verfasser_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aktennotiz_fall_id_fkey"
            columns: ["fall_id"]
            isOneToOne: false
            referencedRelation: "fall"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aktennotiz_verfasser_id_fkey"
            columns: ["verfasser_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          changed_at: string
          changed_by: string | null
          id: number
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          changed_at?: string
          changed_by?: string | null
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          changed_at?: string
          changed_by?: string | null
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
        }
        Relationships: []
      }
      ausgaben: {
        Row: {
          art: Database["public"]["Enums"]["ausgabenart"]
          betrag_monatlich: number
          bezeichnung: string | null
          created_at: string
          gueltig_ab: string | null
          gueltig_bis: string | null
          id: string
          nachweis_dokument_id: string | null
          schuldner_id: string
          updated_at: string
        }
        Insert: {
          art: Database["public"]["Enums"]["ausgabenart"]
          betrag_monatlich: number
          bezeichnung?: string | null
          created_at?: string
          gueltig_ab?: string | null
          gueltig_bis?: string | null
          id?: string
          nachweis_dokument_id?: string | null
          schuldner_id: string
          updated_at?: string
        }
        Update: {
          art?: Database["public"]["Enums"]["ausgabenart"]
          betrag_monatlich?: number
          bezeichnung?: string | null
          created_at?: string
          gueltig_ab?: string | null
          gueltig_bis?: string | null
          id?: string
          nachweis_dokument_id?: string | null
          schuldner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ausgaben_schuldner_id_fkey"
            columns: ["schuldner_id"]
            isOneToOne: false
            referencedRelation: "schuldner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_ausgaben_nachweis"
            columns: ["nachweis_dokument_id"]
            isOneToOne: false
            referencedRelation: "dokument"
            referencedColumns: ["id"]
          },
        ]
      }
      dokument: {
        Row: {
          absender: string | null
          created_at: string
          dokument_pfad: string | null
          dokumentart: Database["public"]["Enums"]["dokumentart"]
          eingangsdatum: string | null
          empfaenger_adresse: string | null
          erstellt_von: string | null
          fall_id: string | null
          forderung_id: string | null
          glaeubiger_id: string | null
          id: string
          titel: string | null
          tracking_nummer: string | null
          updated_at: string
          versanddatum: string | null
          versandstatus: string | null
          zustellart: Database["public"]["Enums"]["zustellart"] | null
        }
        Insert: {
          absender?: string | null
          created_at?: string
          dokument_pfad?: string | null
          dokumentart: Database["public"]["Enums"]["dokumentart"]
          eingangsdatum?: string | null
          empfaenger_adresse?: string | null
          erstellt_von?: string | null
          fall_id?: string | null
          forderung_id?: string | null
          glaeubiger_id?: string | null
          id?: string
          titel?: string | null
          tracking_nummer?: string | null
          updated_at?: string
          versanddatum?: string | null
          versandstatus?: string | null
          zustellart?: Database["public"]["Enums"]["zustellart"] | null
        }
        Update: {
          absender?: string | null
          created_at?: string
          dokument_pfad?: string | null
          dokumentart?: Database["public"]["Enums"]["dokumentart"]
          eingangsdatum?: string | null
          empfaenger_adresse?: string | null
          erstellt_von?: string | null
          fall_id?: string | null
          forderung_id?: string | null
          glaeubiger_id?: string | null
          id?: string
          titel?: string | null
          tracking_nummer?: string | null
          updated_at?: string
          versanddatum?: string | null
          versandstatus?: string | null
          zustellart?: Database["public"]["Enums"]["zustellart"] | null
        }
        Relationships: [
          {
            foreignKeyName: "dokument_erstellt_von_fkey"
            columns: ["erstellt_von"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dokument_fall_id_fkey"
            columns: ["fall_id"]
            isOneToOne: false
            referencedRelation: "fall"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dokument_forderung_id_fkey"
            columns: ["forderung_id"]
            isOneToOne: false
            referencedRelation: "forderung"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dokument_glaeubiger_id_fkey"
            columns: ["glaeubiger_id"]
            isOneToOne: false
            referencedRelation: "glaeubiger"
            referencedColumns: ["id"]
          },
        ]
      }
      dokument_log: {
        Row: {
          created_at: string
          dokument_id: string | null
          fehler: string | null
          id: string
          quelle: string
          referenz: string
          status: string | null
        }
        Insert: {
          created_at?: string
          dokument_id?: string | null
          fehler?: string | null
          id?: string
          quelle: string
          referenz: string
          status?: string | null
        }
        Update: {
          created_at?: string
          dokument_id?: string | null
          fehler?: string | null
          id?: string
          quelle?: string
          referenz?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dokument_log_dokument_id_fkey"
            columns: ["dokument_id"]
            isOneToOne: false
            referencedRelation: "dokument"
            referencedColumns: ["id"]
          },
        ]
      }
      ehepartner: {
        Row: {
          beschaeftigungsstatus:
            | Database["public"]["Enums"]["beschaeftigungsstatus"]
            | null
          created_at: string
          geburtsdatum: string | null
          getrennt_lebend: boolean | null
          id: string
          nachname: string | null
          nettoeinkommen: number | null
          schuldner_id: string
          unterhaltspflichten_andere: number | null
          unterhaltspflichten_gemeinsame_kinder: number | null
          updated_at: string
          vorname: string | null
        }
        Insert: {
          beschaeftigungsstatus?:
            | Database["public"]["Enums"]["beschaeftigungsstatus"]
            | null
          created_at?: string
          geburtsdatum?: string | null
          getrennt_lebend?: boolean | null
          id?: string
          nachname?: string | null
          nettoeinkommen?: number | null
          schuldner_id: string
          unterhaltspflichten_andere?: number | null
          unterhaltspflichten_gemeinsame_kinder?: number | null
          updated_at?: string
          vorname?: string | null
        }
        Update: {
          beschaeftigungsstatus?:
            | Database["public"]["Enums"]["beschaeftigungsstatus"]
            | null
          created_at?: string
          geburtsdatum?: string | null
          getrennt_lebend?: boolean | null
          id?: string
          nachname?: string | null
          nettoeinkommen?: number | null
          schuldner_id?: string
          unterhaltspflichten_andere?: number | null
          unterhaltspflichten_gemeinsame_kinder?: number | null
          updated_at?: string
          vorname?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ehepartner_schuldner_id_fkey"
            columns: ["schuldner_id"]
            isOneToOne: true
            referencedRelation: "schuldner"
            referencedColumns: ["id"]
          },
        ]
      }
      einnahmen: {
        Row: {
          art: Database["public"]["Enums"]["einnahmenart"]
          betrag_monatlich: number
          bezeichnung: string | null
          created_at: string
          gueltig_ab: string | null
          gueltig_bis: string | null
          id: string
          nachweis_dokument_id: string | null
          pfaendbar: boolean | null
          schuldner_id: string
          updated_at: string
        }
        Insert: {
          art: Database["public"]["Enums"]["einnahmenart"]
          betrag_monatlich: number
          bezeichnung?: string | null
          created_at?: string
          gueltig_ab?: string | null
          gueltig_bis?: string | null
          id?: string
          nachweis_dokument_id?: string | null
          pfaendbar?: boolean | null
          schuldner_id: string
          updated_at?: string
        }
        Update: {
          art?: Database["public"]["Enums"]["einnahmenart"]
          betrag_monatlich?: number
          bezeichnung?: string | null
          created_at?: string
          gueltig_ab?: string | null
          gueltig_bis?: string | null
          id?: string
          nachweis_dokument_id?: string | null
          pfaendbar?: boolean | null
          schuldner_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "einnahmen_schuldner_id_fkey"
            columns: ["schuldner_id"]
            isOneToOne: false
            referencedRelation: "schuldner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_einnahmen_nachweis"
            columns: ["nachweis_dokument_id"]
            isOneToOne: false
            referencedRelation: "dokument"
            referencedColumns: ["id"]
          },
        ]
      }
      fall: {
        Row: {
          abschluss_datum: string | null
          aktenzeichen: string | null
          anwalt_id: string | null
          created_at: string
          erstberatung_datum: string | null
          erstschreiben_datum: string | null
          honorar_betrag: number | null
          honorar_bezahlt: number | null
          id: string
          produkt_variante: number | null
          schuldner_id: string
          schutzfrist_bis: string | null
          status: Database["public"]["Enums"]["fall_status"]
          updated_at: string
          verfahrensart: Database["public"]["Enums"]["verfahrensart"] | null
          zahlung_status: Database["public"]["Enums"]["zahlung_status"]
          zustaendiger: string | null
        }
        Insert: {
          abschluss_datum?: string | null
          aktenzeichen?: string | null
          anwalt_id?: string | null
          created_at?: string
          erstberatung_datum?: string | null
          erstschreiben_datum?: string | null
          honorar_betrag?: number | null
          honorar_bezahlt?: number | null
          id?: string
          produkt_variante?: number | null
          schuldner_id: string
          schutzfrist_bis?: string | null
          status?: Database["public"]["Enums"]["fall_status"]
          updated_at?: string
          verfahrensart?: Database["public"]["Enums"]["verfahrensart"] | null
          zahlung_status?: Database["public"]["Enums"]["zahlung_status"]
          zustaendiger?: string | null
        }
        Update: {
          abschluss_datum?: string | null
          aktenzeichen?: string | null
          anwalt_id?: string | null
          created_at?: string
          erstberatung_datum?: string | null
          erstschreiben_datum?: string | null
          honorar_betrag?: number | null
          honorar_bezahlt?: number | null
          id?: string
          produkt_variante?: number | null
          schuldner_id?: string
          schutzfrist_bis?: string | null
          status?: Database["public"]["Enums"]["fall_status"]
          updated_at?: string
          verfahrensart?: Database["public"]["Enums"]["verfahrensart"] | null
          zahlung_status?: Database["public"]["Enums"]["zahlung_status"]
          zustaendiger?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fall_anwalt_id_fkey"
            columns: ["anwalt_id"]
            isOneToOne: false
            referencedRelation: "user_profile"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fall_schuldner_id_fkey"
            columns: ["schuldner_id"]
            isOneToOne: false
            referencedRelation: "schuldner"
            referencedColumns: ["id"]
          },
        ]
      }
      forderung: {
        Row: {
          absonderung_detail: string | null
          absonderungsrecht: boolean
          art: Database["public"]["Enums"]["forderungsart"] | null
          az_glaeubiger: string | null
          bestritten: boolean
          charakter: string | null
          created_at: string
          datum_frist: string | null
          datum_schreiben: string | null
          dokument_pfad: string | null
          fall_id: string
          gesamtbetrag: number | null
          glaeubiger_id: string | null
          hauptforderung: number
          id: string
          kosten: number
          match_confidence: string | null
          nicht_kontaktieren: boolean
          nullplan_abgelehnt: boolean
          quelle: string | null
          raw_extraction: Json | null
          status: string | null
          titulierung: boolean
          titulierungsdatum: string | null
          updated_at: string
          vertreter_id: string | null
          zinsen: number
        }
        Insert: {
          absonderung_detail?: string | null
          absonderungsrecht?: boolean
          art?: Database["public"]["Enums"]["forderungsart"] | null
          az_glaeubiger?: string | null
          bestritten?: boolean
          charakter?: string | null
          created_at?: string
          datum_frist?: string | null
          datum_schreiben?: string | null
          dokument_pfad?: string | null
          fall_id: string
          gesamtbetrag?: number | null
          glaeubiger_id?: string | null
          hauptforderung?: number
          id?: string
          kosten?: number
          match_confidence?: string | null
          nicht_kontaktieren?: boolean
          nullplan_abgelehnt?: boolean
          quelle?: string | null
          raw_extraction?: Json | null
          status?: string | null
          titulierung?: boolean
          titulierungsdatum?: string | null
          updated_at?: string
          vertreter_id?: string | null
          zinsen?: number
        }
        Update: {
          absonderung_detail?: string | null
          absonderungsrecht?: boolean
          art?: Database["public"]["Enums"]["forderungsart"] | null
          az_glaeubiger?: string | null
          bestritten?: boolean
          charakter?: string | null
          created_at?: string
          datum_frist?: string | null
          datum_schreiben?: string | null
          dokument_pfad?: string | null
          fall_id?: string
          gesamtbetrag?: number | null
          glaeubiger_id?: string | null
          hauptforderung?: number
          id?: string
          kosten?: number
          match_confidence?: string | null
          nicht_kontaktieren?: boolean
          nullplan_abgelehnt?: boolean
          quelle?: string | null
          raw_extraction?: Json | null
          status?: string | null
          titulierung?: boolean
          titulierungsdatum?: string | null
          updated_at?: string
          vertreter_id?: string | null
          zinsen?: number
        }
        Relationships: [
          {
            foreignKeyName: "forderung_fall_id_fkey"
            columns: ["fall_id"]
            isOneToOne: false
            referencedRelation: "fall"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forderung_glaeubiger_id_fkey"
            columns: ["glaeubiger_id"]
            isOneToOne: false
            referencedRelation: "glaeubiger"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forderung_vertreter_id_fkey"
            columns: ["vertreter_id"]
            isOneToOne: false
            referencedRelation: "glaeubiger_vertreter"
            referencedColumns: ["id"]
          },
        ]
      }
      glaeubiger: {
        Row: {
          anrede: string | null
          ansprechpartner: string | null
          bic: string | null
          created_at: string
          email: string | null
          fax: string | null
          glaeubiger_typ: Database["public"]["Enums"]["glaeubiger_typ"] | null
          iban: string | null
          id: string
          name: string
          ort: string | null
          plz: string | null
          strasse: string | null
          telefon: string | null
          updated_at: string
          vergleichsbereitschaft: string | null
        }
        Insert: {
          anrede?: string | null
          ansprechpartner?: string | null
          bic?: string | null
          created_at?: string
          email?: string | null
          fax?: string | null
          glaeubiger_typ?: Database["public"]["Enums"]["glaeubiger_typ"] | null
          iban?: string | null
          id?: string
          name: string
          ort?: string | null
          plz?: string | null
          strasse?: string | null
          telefon?: string | null
          updated_at?: string
          vergleichsbereitschaft?: string | null
        }
        Update: {
          anrede?: string | null
          ansprechpartner?: string | null
          bic?: string | null
          created_at?: string
          email?: string | null
          fax?: string | null
          glaeubiger_typ?: Database["public"]["Enums"]["glaeubiger_typ"] | null
          iban?: string | null
          id?: string
          name?: string
          ort?: string | null
          plz?: string | null
          strasse?: string | null
          telefon?: string | null
          updated_at?: string
          vergleichsbereitschaft?: string | null
        }
        Relationships: []
      }
      glaeubiger_antwort: {
        Row: {
          created_at: string
          eingang_dokument_id: string | null
          empfangen_am: string | null
          erinnerung_1: string | null
          erinnerung_2: string | null
          forderung_id: string
          frist_10_wochen: string | null
          frist_6_wochen: string | null
          gegenvorschlag_betrag: number | null
          gegenvorschlag_detail: string | null
          id: string
          nach_aktenlage: boolean
          plan_id: string
          updated_at: string
          zustimmung: string | null
        }
        Insert: {
          created_at?: string
          eingang_dokument_id?: string | null
          empfangen_am?: string | null
          erinnerung_1?: string | null
          erinnerung_2?: string | null
          forderung_id: string
          frist_10_wochen?: string | null
          frist_6_wochen?: string | null
          gegenvorschlag_betrag?: number | null
          gegenvorschlag_detail?: string | null
          id?: string
          nach_aktenlage?: boolean
          plan_id: string
          updated_at?: string
          zustimmung?: string | null
        }
        Update: {
          created_at?: string
          eingang_dokument_id?: string | null
          empfangen_am?: string | null
          erinnerung_1?: string | null
          erinnerung_2?: string | null
          forderung_id?: string
          frist_10_wochen?: string | null
          frist_6_wochen?: string | null
          gegenvorschlag_betrag?: number | null
          gegenvorschlag_detail?: string | null
          id?: string
          nach_aktenlage?: boolean
          plan_id?: string
          updated_at?: string
          zustimmung?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "glaeubiger_antwort_eingang_dokument_id_fkey"
            columns: ["eingang_dokument_id"]
            isOneToOne: false
            referencedRelation: "dokument"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "glaeubiger_antwort_forderung_id_fkey"
            columns: ["forderung_id"]
            isOneToOne: false
            referencedRelation: "forderung"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "glaeubiger_antwort_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "schuldenbereinigungsplan"
            referencedColumns: ["id"]
          },
        ]
      }
      glaeubiger_vertreter: {
        Row: {
          aktenzeichen: string | null
          ansprechpartner: string | null
          created_at: string
          email: string | null
          firma: string | null
          glaeubiger_id: string
          id: string
          ort: string | null
          plz: string | null
          strasse: string | null
          telefon: string | null
          typ: string | null
        }
        Insert: {
          aktenzeichen?: string | null
          ansprechpartner?: string | null
          created_at?: string
          email?: string | null
          firma?: string | null
          glaeubiger_id: string
          id?: string
          ort?: string | null
          plz?: string | null
          strasse?: string | null
          telefon?: string | null
          typ?: string | null
        }
        Update: {
          aktenzeichen?: string | null
          ansprechpartner?: string | null
          created_at?: string
          email?: string | null
          firma?: string | null
          glaeubiger_id?: string
          id?: string
          ort?: string | null
          plz?: string | null
          strasse?: string | null
          telefon?: string | null
          typ?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "glaeubiger_vertreter_glaeubiger_id_fkey"
            columns: ["glaeubiger_id"]
            isOneToOne: false
            referencedRelation: "glaeubiger"
            referencedColumns: ["id"]
          },
        ]
      }
      insolvenzantrag: {
        Row: {
          antrag_dokument_id: string | null
          bescheinigung_305_dokument_id: string | null
          created_at: string
          eingereicht_am: string | null
          eroeffnet_am: string | null
          erteilung_restschuldbefreiung: string | null
          fall_id: string
          gericht: string | null
          gerichtliches_aktenzeichen: string | null
          id: string
          notizen: string | null
          treuhaender: string | null
          updated_at: string
          verfahrensart: Database["public"]["Enums"]["verfahrensart"]
          wohlverhaltensphase_bis: string | null
        }
        Insert: {
          antrag_dokument_id?: string | null
          bescheinigung_305_dokument_id?: string | null
          created_at?: string
          eingereicht_am?: string | null
          eroeffnet_am?: string | null
          erteilung_restschuldbefreiung?: string | null
          fall_id: string
          gericht?: string | null
          gerichtliches_aktenzeichen?: string | null
          id?: string
          notizen?: string | null
          treuhaender?: string | null
          updated_at?: string
          verfahrensart: Database["public"]["Enums"]["verfahrensart"]
          wohlverhaltensphase_bis?: string | null
        }
        Update: {
          antrag_dokument_id?: string | null
          bescheinigung_305_dokument_id?: string | null
          created_at?: string
          eingereicht_am?: string | null
          eroeffnet_am?: string | null
          erteilung_restschuldbefreiung?: string | null
          fall_id?: string
          gericht?: string | null
          gerichtliches_aktenzeichen?: string | null
          id?: string
          notizen?: string | null
          treuhaender?: string | null
          updated_at?: string
          verfahrensart?: Database["public"]["Enums"]["verfahrensart"]
          wohlverhaltensphase_bis?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insolvenzantrag_antrag_dokument_id_fkey"
            columns: ["antrag_dokument_id"]
            isOneToOne: false
            referencedRelation: "dokument"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insolvenzantrag_bescheinigung_305_dokument_id_fkey"
            columns: ["bescheinigung_305_dokument_id"]
            isOneToOne: false
            referencedRelation: "dokument"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insolvenzantrag_fall_id_fkey"
            columns: ["fall_id"]
            isOneToOne: true
            referencedRelation: "fall"
            referencedColumns: ["id"]
          },
        ]
      }
      lead: {
        Row: {
          beratungsgrund: string | null
          berufsstatus: string | null
          created_at: string
          email: string | null
          id: string
          kanal: string | null
          nachname: string | null
          notizen: string | null
          schulden_geschaetzt: number | null
          status: string | null
          telefon: string | null
          updated_at: string
          vorname: string | null
        }
        Insert: {
          beratungsgrund?: string | null
          berufsstatus?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kanal?: string | null
          nachname?: string | null
          notizen?: string | null
          schulden_geschaetzt?: number | null
          status?: string | null
          telefon?: string | null
          updated_at?: string
          vorname?: string | null
        }
        Update: {
          beratungsgrund?: string | null
          berufsstatus?: string | null
          created_at?: string
          email?: string | null
          id?: string
          kanal?: string | null
          nachname?: string | null
          notizen?: string | null
          schulden_geschaetzt?: number | null
          status?: string | null
          telefon?: string | null
          updated_at?: string
          vorname?: string | null
        }
        Relationships: []
      }
      nummernkreis: {
        Row: {
          id: string
          jahr: number
          kreis: string
          letzte_nummer: number
          updated_at: string
        }
        Insert: {
          id?: string
          jahr: number
          kreis: string
          letzte_nummer?: number
          updated_at?: string
        }
        Update: {
          id?: string
          jahr?: number
          kreis?: string
          letzte_nummer?: number
          updated_at?: string
        }
        Relationships: []
      }
      schuldenbereinigungsplan: {
        Row: {
          created_at: string
          erstellt_am: string
          fall_id: string
          flexibler_nullplan: boolean
          gescheitert: boolean
          gescheitert_am: string | null
          id: string
          laufzeit_monate: number | null
          monatsrate: number | null
          notizen: string | null
          nullplan: boolean
          quote_prozent: number | null
          updated_at: string
          versendet_am: string | null
          version: number
        }
        Insert: {
          created_at?: string
          erstellt_am?: string
          fall_id: string
          flexibler_nullplan?: boolean
          gescheitert?: boolean
          gescheitert_am?: string | null
          id?: string
          laufzeit_monate?: number | null
          monatsrate?: number | null
          notizen?: string | null
          nullplan?: boolean
          quote_prozent?: number | null
          updated_at?: string
          versendet_am?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          erstellt_am?: string
          fall_id?: string
          flexibler_nullplan?: boolean
          gescheitert?: boolean
          gescheitert_am?: string | null
          id?: string
          laufzeit_monate?: number | null
          monatsrate?: number | null
          notizen?: string | null
          nullplan?: boolean
          quote_prozent?: number | null
          updated_at?: string
          versendet_am?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "schuldenbereinigungsplan_fall_id_fkey"
            columns: ["fall_id"]
            isOneToOne: false
            referencedRelation: "fall"
            referencedColumns: ["id"]
          },
        ]
      }
      schuldner: {
        Row: {
          anzahl_kinder: number | null
          auth_user_id: string | null
          beschaeftigungsstatus:
            | Database["public"]["Enums"]["beschaeftigungsstatus"]
            | null
          briefanrede: string | null
          created_at: string
          email: string | null
          erstberatung_datum: string | null
          familienstand: Database["public"]["Enums"]["familienstand"] | null
          fruehere_insolvenz_jahr: number | null
          geburtsdatum: string | null
          geburtsort: string | null
          iban: string | null
          id: string
          lead_quelle: string | null
          mobil: string | null
          nachname: string
          nettoeinkommen: number | null
          ort: string | null
          p_konto: boolean | null
          pfaendbarer_betrag: number | null
          plz: string | null
          strasse: string | null
          telefon: string | null
          unterhaltspflichten: number | null
          updated_at: string
          vorname: string
          wohnsituation: Database["public"]["Enums"]["wohnsituation"] | null
        }
        Insert: {
          anzahl_kinder?: number | null
          auth_user_id?: string | null
          beschaeftigungsstatus?:
            | Database["public"]["Enums"]["beschaeftigungsstatus"]
            | null
          briefanrede?: string | null
          created_at?: string
          email?: string | null
          erstberatung_datum?: string | null
          familienstand?: Database["public"]["Enums"]["familienstand"] | null
          fruehere_insolvenz_jahr?: number | null
          geburtsdatum?: string | null
          geburtsort?: string | null
          iban?: string | null
          id?: string
          lead_quelle?: string | null
          mobil?: string | null
          nachname: string
          nettoeinkommen?: number | null
          ort?: string | null
          p_konto?: boolean | null
          pfaendbarer_betrag?: number | null
          plz?: string | null
          strasse?: string | null
          telefon?: string | null
          unterhaltspflichten?: number | null
          updated_at?: string
          vorname: string
          wohnsituation?: Database["public"]["Enums"]["wohnsituation"] | null
        }
        Update: {
          anzahl_kinder?: number | null
          auth_user_id?: string | null
          beschaeftigungsstatus?:
            | Database["public"]["Enums"]["beschaeftigungsstatus"]
            | null
          briefanrede?: string | null
          created_at?: string
          email?: string | null
          erstberatung_datum?: string | null
          familienstand?: Database["public"]["Enums"]["familienstand"] | null
          fruehere_insolvenz_jahr?: number | null
          geburtsdatum?: string | null
          geburtsort?: string | null
          iban?: string | null
          id?: string
          lead_quelle?: string | null
          mobil?: string | null
          nachname?: string
          nettoeinkommen?: number | null
          ort?: string | null
          p_konto?: boolean | null
          pfaendbarer_betrag?: number | null
          plz?: string | null
          strasse?: string | null
          telefon?: string | null
          unterhaltspflichten?: number | null
          updated_at?: string
          vorname?: string
          wohnsituation?: Database["public"]["Enums"]["wohnsituation"] | null
        }
        Relationships: []
      }
      user_profile: {
        Row: {
          anzeigename: string | null
          created_at: string
          id: string
          rolle: Database["public"]["Enums"]["rolle"]
          updated_at: string
        }
        Insert: {
          anzeigename?: string | null
          created_at?: string
          id: string
          rolle?: Database["public"]["Enums"]["rolle"]
          updated_at?: string
        }
        Update: {
          anzeigename?: string | null
          created_at?: string
          id?: string
          rolle?: Database["public"]["Enums"]["rolle"]
          updated_at?: string
        }
        Relationships: []
      }
      verschuldungsursache: {
        Row: {
          anmerkung: string | null
          code: Database["public"]["Enums"]["ursache_code"]
          created_at: string
          fall_id: string
          id: string
          ist_hauptursache: boolean
        }
        Insert: {
          anmerkung?: string | null
          code: Database["public"]["Enums"]["ursache_code"]
          created_at?: string
          fall_id: string
          id?: string
          ist_hauptursache?: boolean
        }
        Update: {
          anmerkung?: string | null
          code?: Database["public"]["Enums"]["ursache_code"]
          created_at?: string
          fall_id?: string
          id?: string
          ist_hauptursache?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "verschuldungsursache_fall_id_fkey"
            columns: ["fall_id"]
            isOneToOne: false
            referencedRelation: "fall"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_rolle: {
        Args: never
        Returns: Database["public"]["Enums"]["rolle"]
      }
      current_user_schuldner_id: { Args: never; Returns: string }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      ausgabenart:
        | "miete"
        | "nebenkosten"
        | "strom"
        | "heizung"
        | "telekommunikation"
        | "versicherung"
        | "lebensmittel"
        | "mobilitaet"
        | "unterhalt"
        | "sonstiges"
      beschaeftigungsstatus:
        | "angestellt"
        | "selbststaendig"
        | "arbeitslos"
        | "rentner"
        | "in_ausbildung"
        | "student"
        | "elternzeit"
        | "arbeitsunfaehig"
        | "hausfrau_hausmann"
        | "sonstiges"
      dokumentart:
        | "erstschreiben"
        | "vollmacht"
        | "vergleichsangebot"
        | "schnellschuss_angebot"
        | "nachfass_freundlich"
        | "nachfass_unfreundlich"
        | "plan"
        | "insolvenzantrag"
        | "anlage"
        | "eingehender_scan"
        | "glaeubigerantwort_eingang"
        | "gegenangebot_eingang"
        | "forderungsaufstellung_eingang"
        | "erledigterklaerung_eingang"
        | "gerichtliches_schreiben"
        | "bescheinigung_305"
        | "sonstiges"
      einnahmenart:
        | "nettoeinkommen"
        | "selbststaendigkeit"
        | "buergergeld"
        | "arbeitslosengeld"
        | "rente"
        | "krankengeld"
        | "elterngeld"
        | "kindergeld"
        | "unterhalt"
        | "wohngeld"
        | "sonstiges"
      fall_status:
        | "self_service"
        | "ra_gewaehlt"
        | "bezahlt"
        | "erstschreiben_raus"
        | "schutzfrist"
        | "plan"
        | "plan_versendet"
        | "plan_gescheitert"
        | "insolvenzantrag"
        | "verfahren_eroeffnet"
        | "wohlverhaltensphase"
        | "abgeschlossen"
        | "abgebrochen"
      familienstand:
        | "ledig"
        | "verheiratet"
        | "eingetragene_lebenspartnerschaft"
        | "getrennt_lebend"
        | "geschieden"
        | "verwitwet"
      forderungsart:
        | "kredit"
        | "kreditkarte"
        | "dispo"
        | "mietrueckstand"
        | "telekommunikation"
        | "energie"
        | "steuerforderung"
        | "sozialversicherung"
        | "unterhalt"
        | "gerichtskosten"
        | "bussgeld"
        | "inkasso"
        | "sonstiges"
      glaeubiger_typ:
        | "bank"
        | "inkasso"
        | "telekom"
        | "energieversorger"
        | "vermieter"
        | "finanzamt"
        | "sozialversicherung"
        | "gerichtskasse"
        | "unterhaltsberechtigte"
        | "privatperson"
        | "online_haendler"
        | "versicherung"
        | "sonstiges"
      rolle: "mandant" | "berater" | "admin"
      ursache_code:
        | "arbeitslosigkeit"
        | "trennung_scheidung_tod_partner"
        | "erkrankung_sucht_unfall"
        | "unwirtschaftliche_haushaltsfuehrung"
        | "gescheiterte_selbststaendigkeit"
        | "zahlungsverpflichtung_buergschaft"
        | "gescheiterte_immobilienfinanzierung"
        | "unzureichende_kreditberatung"
        | "niedriges_einkommen"
        | "sonstiges"
      verfahrensart: "verbraucher" | "regel" | "aussergerichtlich"
      wohnsituation:
        | "mietwohnung"
        | "wohneigentum"
        | "bei_eltern"
        | "wohngemeinschaft"
        | "obdachlos"
        | "betreute_wohnform"
        | "sonstiges"
      zahlung_status: "offen" | "aktiv" | "abgeschlossen" | "gescheitert"
      zustellart:
        | "einfache_post"
        | "einschreiben_einwurf"
        | "einschreiben_rueckschein"
        | "fax"
        | "email"
        | "beA"
        | "persoenlich"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ausgabenart: [
        "miete",
        "nebenkosten",
        "strom",
        "heizung",
        "telekommunikation",
        "versicherung",
        "lebensmittel",
        "mobilitaet",
        "unterhalt",
        "sonstiges",
      ],
      beschaeftigungsstatus: [
        "angestellt",
        "selbststaendig",
        "arbeitslos",
        "rentner",
        "in_ausbildung",
        "student",
        "elternzeit",
        "arbeitsunfaehig",
        "hausfrau_hausmann",
        "sonstiges",
      ],
      dokumentart: [
        "erstschreiben",
        "vollmacht",
        "vergleichsangebot",
        "schnellschuss_angebot",
        "nachfass_freundlich",
        "nachfass_unfreundlich",
        "plan",
        "insolvenzantrag",
        "anlage",
        "eingehender_scan",
        "glaeubigerantwort_eingang",
        "gegenangebot_eingang",
        "forderungsaufstellung_eingang",
        "erledigterklaerung_eingang",
        "gerichtliches_schreiben",
        "bescheinigung_305",
        "sonstiges",
      ],
      einnahmenart: [
        "nettoeinkommen",
        "selbststaendigkeit",
        "buergergeld",
        "arbeitslosengeld",
        "rente",
        "krankengeld",
        "elterngeld",
        "kindergeld",
        "unterhalt",
        "wohngeld",
        "sonstiges",
      ],
      fall_status: [
        "self_service",
        "ra_gewaehlt",
        "bezahlt",
        "erstschreiben_raus",
        "schutzfrist",
        "plan",
        "plan_versendet",
        "plan_gescheitert",
        "insolvenzantrag",
        "verfahren_eroeffnet",
        "wohlverhaltensphase",
        "abgeschlossen",
        "abgebrochen",
      ],
      familienstand: [
        "ledig",
        "verheiratet",
        "eingetragene_lebenspartnerschaft",
        "getrennt_lebend",
        "geschieden",
        "verwitwet",
      ],
      forderungsart: [
        "kredit",
        "kreditkarte",
        "dispo",
        "mietrueckstand",
        "telekommunikation",
        "energie",
        "steuerforderung",
        "sozialversicherung",
        "unterhalt",
        "gerichtskosten",
        "bussgeld",
        "inkasso",
        "sonstiges",
      ],
      glaeubiger_typ: [
        "bank",
        "inkasso",
        "telekom",
        "energieversorger",
        "vermieter",
        "finanzamt",
        "sozialversicherung",
        "gerichtskasse",
        "unterhaltsberechtigte",
        "privatperson",
        "online_haendler",
        "versicherung",
        "sonstiges",
      ],
      rolle: ["mandant", "berater", "admin"],
      ursache_code: [
        "arbeitslosigkeit",
        "trennung_scheidung_tod_partner",
        "erkrankung_sucht_unfall",
        "unwirtschaftliche_haushaltsfuehrung",
        "gescheiterte_selbststaendigkeit",
        "zahlungsverpflichtung_buergschaft",
        "gescheiterte_immobilienfinanzierung",
        "unzureichende_kreditberatung",
        "niedriges_einkommen",
        "sonstiges",
      ],
      verfahrensart: ["verbraucher", "regel", "aussergerichtlich"],
      wohnsituation: [
        "mietwohnung",
        "wohneigentum",
        "bei_eltern",
        "wohngemeinschaft",
        "obdachlos",
        "betreute_wohnform",
        "sonstiges",
      ],
      zahlung_status: ["offen", "aktiv", "abgeschlossen", "gescheitert"],
      zustellart: [
        "einfache_post",
        "einschreiben_einwurf",
        "einschreiben_rueckschein",
        "fax",
        "email",
        "beA",
        "persoenlich",
      ],
    },
  },
} as const
