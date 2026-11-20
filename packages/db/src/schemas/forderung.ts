import { z } from "zod";
import { Constants } from "../database.types";

const forderungsartEnum = z.enum(Constants.public.Enums.forderungsart);

const money = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "string" ? Number(v.replace(",", ".")) : v))
  .pipe(z.number().nonnegative());

const nullableDate = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Datum muss ISO-Format YYYY-MM-DD haben")
    .nullable(),
);

const uuid = z.string().uuid();
const uuidOrNull = z.preprocess(
  (v) => (v === "" || v === undefined ? null : v),
  uuid.nullable(),
);

export const forderungSchema = z.object({
  fall_id: uuid,
  glaeubiger_id: uuidOrNull,
  vertreter_id: uuidOrNull,

  art: forderungsartEnum.nullable().optional(),
  az_glaeubiger: z.string().trim().max(100).nullable().optional(),
  charakter: z
    .string()
    .regex(/^[A-Z]?$/i, "Nur ein Buchstabe A-Z oder leer")
    .nullable()
    .optional(),
  quelle: z.string().trim().max(200).nullable().optional(),

  hauptforderung: money.default(0),
  zinsen: money.default(0),
  kosten: money.default(0),

  bestritten: z.boolean().default(false),
  titulierung: z.boolean().default(false),
  titulierungsdatum: nullableDate,
  absonderungsrecht: z.boolean().default(false),
  absonderung_detail: z.string().nullable().optional(),

  datum_schreiben: nullableDate,
  datum_frist: nullableDate,

  nullplan_abgelehnt: z.boolean().default(false),
  nicht_kontaktieren: z.boolean().default(false),
  status: z.string().default("neu"),
});

export type ForderungInput = z.infer<typeof forderungSchema>;
