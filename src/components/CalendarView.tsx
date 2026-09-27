'use client';

import { SessionDiff } from '../types';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']; // Assuming Mon-Fri for simplicity, can extend to Sun
const START_HOUR = 8;
const END_HOUR = 18;
const HOUR_HEIGHT = 60;

function timeToPixels(timeStr: string): number {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  const totalMins = (h - START_HOUR) * 60 + (m || 0);
  return (totalMins / 60) * HOUR_HEIGHT;
}

export function CalendarView({ diffs }: { diffs: SessionDiff[] }) {
  const renderGrid = (version: 'v1' | 'v2') => {
    return (
      <div className="flex bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl overflow-hidden relative shadow-sm ring-1 ring-black/5 min-w-[600px]">
        {/* Time labels axis */}
        <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-gray-50/50 flex flex-col pt-10">
          {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
            <div key={i} className="text-[11px] font-medium text-right pr-3 text-gray-400 border-b border-gray-100/50" style={{ height: HOUR_HEIGHT }}>
              {`${(START_HOUR + i).toString().padStart(2, '0')}:00`}
            </div>
          ))}
        </div>
        
        {/* Day columns */}
        {DAYS.map(day => {
          // Filter valid diffs for this day
          const dayDiffs = diffs.filter(d => {
            const s = version === 'v1' ? d.oldSession : d.newSession;
            if (!s || s.day !== day) return false;
            if (d.status === 'ambiguous' && version === 'v1') return false;
            if (d.status === 'added' && version === 'v1') return false;
            if (d.status === 'removed' && version === 'v2') return false;
            return true;
          });

          // Sort by start time to compute overlaps
          dayDiffs.sort((a, b) => {
            const sa = (version === 'v1' ? a.oldSession : a.newSession)!;
            const sb = (version === 'v1' ? b.oldSession : b.newSession)!;
            return timeToPixels(sa.startTime) - timeToPixels(sb.startTime);
          });

          // Compute columns to avoid overlap
          const columns: { end: number }[] = [];
          const positioned = dayDiffs.map(diff => {
            const s = (version === 'v1' ? diff.oldSession : diff.newSession)!;
            const start = timeToPixels(s.startTime);
            const end = timeToPixels(s.endTime);
            
            let col = 0;
            let placed = false;
            for (let i = 0; i < columns.length; i++) {
              if (columns[i].end <= start) {
                columns[i].end = end;
                col = i;
                placed = true;
                break;
              }
            }
            if (!placed) {
              col = columns.length;
              columns.push({ end });
            }
            return { diff, s, start, end, col };
          });

          const maxCols = Math.max(1, columns.length);

          return (
            <div key={day} className="flex-1 border-r border-gray-100/80 last:border-r-0 relative group min-w-[120px]">
              <div className="text-center font-semibold text-xs py-3 border-b border-gray-100 text-gray-500 bg-gray-50/30 h-10 tracking-wider uppercase">{day}</div>
              <div className="relative" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}>
                {/* Grid Lines */}
                <div className="absolute inset-0 pointer-events-none flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                   {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                      <div key={i} className="w-full border-b border-gray-100/50" style={{ height: HOUR_HEIGHT }} />
                   ))}
                </div>

                {positioned.map(({ diff, s, start, end, col }) => {
                  const height = end - start;
                  const width = `calc(${100 / maxCols}% - 4px)`;
                  const left = `calc(${col * (100 / maxCols)}% + 2px)`;

                  let bg = 'bg-white border-gray-200 text-gray-700 shadow-sm hover:shadow-md';
                  let animationProps = {};
                  let isDashed = false;

                  if (diff.status === 'changed') {
                    bg = 'bg-gradient-to-br from-amber-50 to-amber-100/80 border-amber-300 text-amber-900 shadow-amber-500/10 shadow-md ring-1 ring-amber-400/20';
                    if (version === 'v2') {
                      animationProps = {
                        initial: { opacity: 0.5, scale: 0.95 },
                        animate: { opacity: 1, scale: 1 },
                        transition: { duration: 0.3 }
                      };
                    } else {
                       isDashed = true;
                       bg = 'bg-transparent border-amber-300/50 text-amber-900/40 opacity-60';
                    }
                  } else if (diff.status === 'added' && version === 'v2') {
                    bg = 'bg-gradient-to-br from-emerald-50 to-emerald-100/80 border-emerald-300 text-emerald-900 shadow-emerald-500/10 shadow-md ring-1 ring-emerald-400/20';
                    animationProps = {
                      initial: { opacity: 0, y: 10 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.4, delay: 0.1 }
                    };
                  } else if (diff.status === 'removed' && version === 'v1') {
                    bg = 'bg-rose-50/50 border-rose-200 text-rose-700/60 opacity-60';
                    isDashed = true;
                  } else if (diff.status === 'ambiguous' && version === 'v2') {
                    bg = 'bg-gradient-to-br from-purple-50 to-purple-100/80 border-purple-300 text-purple-900 shadow-purple-500/10 shadow-md ring-1 ring-purple-400/20';
                    animationProps = {
                      animate: { opacity: [0.7, 1, 0.7] },
                      transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                    };
                  }

                  const clashes = version === 'v2' && diff.causesClash ? diff.causesClash : [];

                  return (
                    <Tooltip key={s.id + version}>
                      <TooltipTrigger>
                        <div
                          className={`absolute cursor-pointer transition-transform hover:scale-[1.02] z-10 hover:z-20`}
                          style={{ top: start, height, width, left }}
                        >
                          <motion.div
                            {...animationProps}
                            className={`w-full h-full rounded-xl px-2 py-1.5 text-[11px] leading-tight border overflow-hidden backdrop-blur-sm flex flex-col ${bg} ${isDashed ? 'border-dashed border-2' : 'border-solid'}`}
                          >
                            <div className="font-bold truncate w-full">{s.courseCode}</div>
                            <div className="truncate opacity-80 w-full text-[10px]">Sec {s.section}</div>
                            {height > 40 && (
                              <div className="truncate mt-auto opacity-90 font-medium flex items-center gap-1">
                                {s.room}
                              </div>
                            )}
                            {isDashed && version === 'v1' && <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 text-3xl font-light">✕</div>}
                            {clashes.length > 0 && (
                              <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50 animate-pulse ring-2 ring-white"></div>
                            )}
                          </motion.div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="text-xs border-0 shadow-xl bg-white/95 backdrop-blur-md text-gray-800 p-3 rounded-xl max-w-[220px]">
                        <div className="font-bold text-sm text-gray-900 mb-1">{s.courseCode} <span className="font-medium text-gray-500">Sec {s.section}</span></div>
                        <div className="flex items-center gap-2 mb-1 text-gray-600">
                          <span className="w-4 h-4 inline-flex items-center justify-center bg-gray-100 rounded">📍</span> {s.room}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <span className="w-4 h-4 inline-flex items-center justify-center bg-gray-100 rounded">🕒</span> {s.startTime} - {s.endTime}
                        </div>
                        {clashes.length > 0 && (
                           <div className="mt-3 pt-2 border-t border-gray-100 text-rose-600 space-y-1.5">
                             {clashes.map((c, idx) => (
                               <div key={idx} className="flex items-start gap-1">
                                 <span className="shrink-0 mt-0.5">⚠️</span> 
                                 <span className="leading-snug">{c.message}</span>
                               </div>
                             ))}
                           </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 overflow-x-auto pb-4">
      <div className="space-y-4 flex-1">
        <h3 className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-400">
          <span className="w-2 h-2 rounded-full bg-gray-300"></span>
          Previous Version
        </h3>
        {renderGrid('v1')}
      </div>
      <div className="space-y-4 flex-1">
        <h3 className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest text-blue-600">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          New Version
        </h3>
        {renderGrid('v2')}
      </div>
    </div>
  );
}
