import { create } from 'zustand';
import { Session, SessionDiff } from '../types';

interface TimetableState {
  v1Sessions: Session[];
  v2Sessions: Session[];
  diffs: SessionDiff[];
  setV1Sessions: (sessions: Session[]) => void;
  setV2Sessions: (sessions: Session[]) => void;
  setDiffs: (diffs: SessionDiff[]) => void;
  clear: () => void;
}

export const useTimetableStore = create<TimetableState>((set) => ({
  v1Sessions: [],
  v2Sessions: [],
  diffs: [],
  setV1Sessions: (sessions) => set({ v1Sessions: sessions }),
  setV2Sessions: (sessions) => set({ v2Sessions: sessions }),
  setDiffs: (diffs) => set({ diffs }),
  clear: () => set({ v1Sessions: [], v2Sessions: [], diffs: [] }),
}));
