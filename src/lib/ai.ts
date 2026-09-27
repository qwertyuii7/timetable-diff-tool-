import { SessionDiff } from "../types";

export const normalizeRooms = async (rooms: string[]): Promise<Record<string, string>> => {
  // Mock AI normalization. In reality, this would call an LLM API.
  // Fallback: simple exact match mapping or basic clustering.
  const mapping: Record<string, string> = {};
  rooms.forEach(r => {
    // Simple mock logic: just remove spaces and lowercase
    mapping[r] = r.replace(/[\s\-\.]/g, '').toLowerCase();
  });
  return mapping;
};

export const generateChangelog = async (diffs: SessionDiff[]): Promise<string[]> => {
  // Mock AI generated sentences.
  const sentences: string[] = [];
  for (const diff of diffs) {
    if (diff.status === 'added' && diff.newSession) {
      sentences.push(`${diff.newSession.courseCode} Section ${diff.newSession.section} was added on ${diff.newSession.day} at ${diff.newSession.startTime}.`);
    } else if (diff.status === 'removed' && diff.oldSession) {
      sentences.push(`${diff.oldSession.courseCode} Section ${diff.oldSession.section} was removed from ${diff.oldSession.day}.`);
    } else if (diff.status === 'changed' && diff.oldSession && diff.newSession) {
      const s1 = diff.oldSession;
      const s2 = diff.newSession;
      const changes = [];
      if (s1.roomNormalized !== s2.roomNormalized) changes.push(`moved from ${s1.room} to ${s2.room}`);
      if (s1.day !== s2.day) changes.push(`rescheduled from ${s1.day} to ${s2.day}`);
      if (s1.startTime !== s2.startTime) changes.push(`time changed from ${s1.startTime} to ${s2.startTime}`);
      
      sentences.push(`${s2.courseCode} Section ${s2.section} ${changes.join(' and ')}.`);
    }
  }
  return sentences;
};
