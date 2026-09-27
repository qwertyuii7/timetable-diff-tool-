import { Session, SessionDiff } from '../types';

export const computeDiff = (v1: Session[], v2: Session[]): SessionDiff[] => {
  const diffs: SessionDiff[] = [];
  const v1Pool = [...v1];
  const v2Pool = [...v2];

  // Pass 1: Exact match by courseCode + section + day
  for (let i = v2Pool.length - 1; i >= 0; i--) {
    const s2 = v2Pool[i];
    const matchIndex = v1Pool.findIndex(s1 => 
      s1.courseCode === s2.courseCode && 
      s1.section === s2.section && 
      s1.day === s2.day
    );

    if (matchIndex !== -1) {
      const s1 = v1Pool[matchIndex];
      const changedFields: NonNullable<SessionDiff['changedFields']> = [];
      if (s1.startTime !== s2.startTime) changedFields.push('startTime');
      if (s1.endTime !== s2.endTime) changedFields.push('endTime');
      if (s1.roomNormalized !== s2.roomNormalized) changedFields.push('room');

      diffs.push({
        status: changedFields.length > 0 ? 'changed' : 'unchanged',
        oldSession: s1,
        newSession: s2,
        changedFields: changedFields.length > 0 ? changedFields : undefined,
        confidence: 1.0,
      });

      v1Pool.splice(matchIndex, 1);
      v2Pool.splice(i, 1);
    }
  }

  // Pass 2: Fuzzy match
  for (let i = v2Pool.length - 1; i >= 0; i--) {
    const s2 = v2Pool[i];
    
    // Score all candidates
    const candidates = v1Pool.map(s1 => {
      let score = 0;
      if (s1.courseCode === s2.courseCode && s1.section === s2.section && s1.day !== s2.day) {
        score = 0.8;
      } else if (s1.courseCode === s2.courseCode && s1.section !== s2.section && s1.day === s2.day && s1.startTime === s2.startTime) {
        score = 0.5;
      } else if (s1.courseCode === s2.courseCode) {
        score = 0.2;
      }
      return { session: s1, score };
    }).filter(c => c.score > 0).sort((a, b) => b.score - a.score);

    if (candidates.length > 0) {
      const top = candidates[0];
      const second = candidates.length > 1 ? candidates[1] : null;

      if (top.score >= 0.5) {
        if (second && (top.score - second.score) <= 0.15) {
          // Ambiguous
          diffs.push({
            status: 'ambiguous',
            newSession: s2,
            confidence: top.score,
            candidates: candidates.slice(0, 2).map(c => c.session),
          });
          v2Pool.splice(i, 1);
          // We don't remove from v1Pool yet because it's ambiguous
        } else {
          // Matched
          const s1 = top.session;
          const matchIndex = v1Pool.findIndex(s => s.id === s1.id);
          if (matchIndex !== -1) {
            const changedFields: NonNullable<SessionDiff['changedFields']> = [];
            if (s1.day !== s2.day) changedFields.push('day');
            if (s1.startTime !== s2.startTime) changedFields.push('startTime');
            if (s1.endTime !== s2.endTime) changedFields.push('endTime');
            if (s1.roomNormalized !== s2.roomNormalized) changedFields.push('room');

            diffs.push({
              status: 'changed',
              oldSession: s1,
              newSession: s2,
              changedFields,
              confidence: top.score,
            });

            v1Pool.splice(matchIndex, 1);
          }
          v2Pool.splice(i, 1);
        }
      }
    }
  }

  // Leftovers
  v1Pool.forEach(s1 => {
    diffs.push({
      status: 'removed',
      oldSession: s1,
      confidence: 1.0,
    });
  });

  v2Pool.forEach(s2 => {
    const isAmbiguous = diffs.some(d => d.status === 'ambiguous' && d.newSession?.id === s2.id);
    if (!isAmbiguous) {
      diffs.push({
        status: 'added',
        newSession: s2,
        confidence: 1.0,
      });
    }
  });

  return diffs;
};

export const detectClashes = (diffs: SessionDiff[], fullNewTimetable: Session[]) => {
  const finalDiffs = [...diffs];
  
  for (const diff of finalDiffs) {
    if ((diff.status === 'changed' || diff.status === 'added') && diff.newSession) {
      const clashes: NonNullable<SessionDiff['causesClash']> = [];
      const s = diff.newSession;
      
      const sStart = timeToMinutes(s.startTime);
      const sEnd = timeToMinutes(s.endTime);

      for (const other of fullNewTimetable) {
        if (other.id === s.id) continue;
        if (other.day !== s.day) continue;
        
        const oStart = timeToMinutes(other.startTime);
        const oEnd = timeToMinutes(other.endTime);

        const overlaps = sStart < oEnd && oStart < sEnd;
        if (!overlaps) continue;

        if (other.roomNormalized === s.roomNormalized) {
          clashes.push({
            type: 'room',
            message: `Room clash with ${other.courseCode} (${other.startTime}-${other.endTime})`,
            withSessionId: other.id
          });
        }

        if (other.section === s.section && other.courseCode !== s.courseCode) {
          clashes.push({
            type: 'section',
            message: `Section ${s.section} conflict with ${other.courseCode} (${other.startTime}-${other.endTime})`,
            withSessionId: other.id
          });
        }
      }

      if (clashes.length > 0) {
        diff.causesClash = clashes;
      }
    }
  }

  return finalDiffs;
};

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
