import Papa from "papaparse";
import type { ImportedGlucoseMeasurement } from "../../domain/types";

export interface ParsedMySugrImport {
  measurements: ImportedGlucoseMeasurement[];
  warnings: string[];
}

// TODO M1: implement exact mySugr date/time parsing, timezone normalization,
// provenance, validation, and canonical identity creation.
export function parseMySugrCsv(
  csvText: string,
  _fileName: string,
  _importId: string,
): ParsedMySugrImport {
  const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
  return {
    measurements: [],
    warnings: parsed.errors.map((e) => e.message),
  };
}
