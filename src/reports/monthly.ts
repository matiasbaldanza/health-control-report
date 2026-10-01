import type { ImportedGlucoseMeasurement, RoutineSlot } from "../domain/types";

export interface MonthlyReportCell {
  valueMgDl: number;
  localTime: string;
  eventMarker?: string;
}

export interface MonthlyReportRow {
  localDate: string;
  slots: Partial<Record<RoutineSlot, MonthlyReportCell>>;
}

export interface MonthlyReportModel {
  month: string;
  rows: MonthlyReportRow[];
  stats: {
    count: number;
    average?: number;
    min?: number;
    max?: number;
    below70: number;
    target70to180: number;
    high181to250: number;
    above250: number;
  };
}

export function computeMonthlyStats(measurements: ImportedGlucoseMeasurement[]): MonthlyReportModel["stats"] {
  if (measurements.length === 0) {
    return { count: 0, below70: 0, target70to180: 0, high181to250: 0, above250: 0 };
  }
  const values = measurements.map((m) => m.valueMgDl);
  const sum = values.reduce((a, b) => a + b, 0);
  return {
    count: values.length,
    average: sum / values.length,
    min: Math.min(...values),
    max: Math.max(...values),
    below70: values.filter((v) => v < 70).length,
    target70to180: values.filter((v) => v >= 70 && v <= 180).length,
    high181to250: values.filter((v) => v >= 181 && v <= 250).length,
    above250: values.filter((v) => v > 250).length,
  };
}
