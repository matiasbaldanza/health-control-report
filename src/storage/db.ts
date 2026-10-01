import Dexie, { type Table } from "dexie";
import type { EventCandidate, ImportedGlucoseMeasurement, MeasurementClassification } from "../domain/types";

export class AppDatabase extends Dexie {
  glucose!: Table<ImportedGlucoseMeasurement, string>;
  classifications!: Table<MeasurementClassification, string>;
  events!: Table<EventCandidate, string>;

  constructor() {
    super("glucose-control-report");
    this.version(1).stores({
      glucose: "id, localDate, measuredAtInstant, valueMgDl",
      classifications: "measurementId, role, slot",
      events: "id, status, startAt, endAt",
    });
  }
}

export const db = new AppDatabase();
