export function glucoseMeasurementId(normalizedTimestamp: string): string {
  return `glucose|${normalizedTimestamp}`;
}
