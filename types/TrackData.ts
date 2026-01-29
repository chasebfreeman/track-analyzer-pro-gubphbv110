export interface LaneReading {
  trackTemp: string;
  uvIndex: string;
  kegSL: string;
  kegOut: string;
  grippoSL: string;
  grippoOut: string;
  shine: string;
  notes: string;
  imageUri?: string;
}

export interface TrackReading {
  id: string;
  trackId: string;

  // Legacy / display-friendly fields (kept for backward compat)
  date: string;      // YYYY-MM-DD (we now set this to trackDate when saving)
  time: string;      // "h:mm AM/PM" (legacy; for old rows)

  // Canonical absolute time (always correct)
  timestamp: number;

  // Filtering convenience (we now derive this from trackDate)
  year: number;

  session?: string;
  pair?: string;
  classCurrentlyRunning?: string;

  leftLane: LaneReading;
  rightLane: LaneReading;

  // ✅ NEW (optional so old rows don’t break)
  timeZone?: string;   // IANA tz like "America/New_York"
  trackDate?: string;  // YYYY-MM-DD in track-local calendar date
}

export interface Track {
  id: string;
  name: string;
  location: string;
  createdAt: number;
}

export interface DayReadings {
  date: string; // this is your grouping key (use trackDate style YYYY-MM-DD)
  readings: TrackReading[];
}
