interface DownloadsFast {
  downloads: number;
  start: DateNpm;
  end: DateNpm;
  /** Package name */
  package: string;
}

/**
 * @example
 * '2021-09-18'
 * '2005-01-01'
 */
type DateNpm = `${number}-${number}-${number}`;
