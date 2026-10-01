export const requiredMySugrColumns = [
  "Date",
  "Time",
  "Blood Sugar Measurement (mg/dL)",
] as const;

export const optionalMySugrColumns = ["Tags", "Note", "Timezone"] as const;
