export type Session = {
  id: string;              // generated: courseCode + section + day (pre-normalization)
  courseCode: string;       // e.g. "CS301"
  courseName?: string;
  section: string;          // e.g. "A", "B2"
  day: string;               // "Mon".."Sun", normalized
  startTime: string;        // "HH:mm", 24h normalized
  endTime: string;
  room: string;              // raw label as parsed
  roomNormalized: string;    // after AI/fuzzy normalization
  raw: Record<string, string>; // original row, for debugging/display
};

export type ClashInfo = {
  type: "room" | "section";
  message: string;
  withSessionId: string;
};

export type SessionDiff = {
  status: "added" | "removed" | "unchanged" | "changed" | "ambiguous";
  oldSession?: Session;
  newSession?: Session;
  changedFields?: ("day" | "startTime" | "endTime" | "room")[];
  confidence: number; // 0–1, how sure the matcher is this is the same session
  causesClash?: ClashInfo[]; // populated in phase 5
  candidates?: Session[]; // for ambiguous matching
};
