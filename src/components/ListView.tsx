'use client';

import { SessionDiff } from '../types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useTimetableStore } from '../store/useTimetableStore';
import { CheckCircle2, AlertTriangle, Info, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent } from './ui/card';

export function ListView({ diffs }: { diffs: SessionDiff[] }) {
  const { setDiffs, diffs: allDiffs } = useTimetableStore();

  const handleResolveAmbiguous = (diffIndex: number, chosenCandidateId: string) => {
    const diffToResolve = allDiffs[diffIndex];
    if (!diffToResolve.candidates || !diffToResolve.newSession) return;
    
    const candidate = diffToResolve.candidates.find(c => c.id === chosenCandidateId);
    if (!candidate) return;

    const newDiffs = [...allDiffs];
    newDiffs[diffIndex] = {
      status: 'changed',
      oldSession: candidate,
      newSession: diffToResolve.newSession,
      changedFields: ['day', 'startTime', 'endTime', 'room'],
      confidence: 1.0
    };
    setDiffs(newDiffs);
  };

  if (diffs.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-[#0F172A]/80 backdrop-blur-md">
        <CardContent className="flex flex-col items-center justify-center p-16 text-slate-400">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-sm border border-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Nothing changed &mdash; you&apos;re all set</h3>
          <p className="text-slate-500 text-center max-w-sm">
            Both schedules match perfectly based on your current filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-white/10 shadow-2xl bg-[#0F172A] overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#090D16]">
            <TableRow className="hover:bg-transparent border-b-white/10">
              <TableHead className="w-[140px] font-semibold text-slate-400">Status</TableHead>
              <TableHead className="font-semibold text-slate-400">Course</TableHead>
              <TableHead className="font-semibold text-slate-400">Section</TableHead>
              <TableHead className="font-semibold text-slate-400">Day & Time (Old → New)</TableHead>
              <TableHead className="font-semibold text-slate-400">Room (Old → New)</TableHead>
              <TableHead className="font-semibold text-slate-400">Alerts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {diffs.map((diff, i) => {
              const s1 = diff.oldSession;
              const s2 = diff.newSession;
              const displayS = s2 || s1;
              const globalIndex = allDiffs.findIndex(d => d === diff);

              return (
                <TableRow key={i} className="group hover:bg-[#1E293B]/50 transition-colors border-b-white/5">
                  <TableCell>
                    <StatusBadge status={diff.status} />
                  </TableCell>
                  <TableCell className="font-bold text-slate-200">{displayS?.courseCode}</TableCell>
                  <TableCell className="font-medium text-slate-500">{displayS?.section}</TableCell>
                  <TableCell>
                    {diff.status === 'changed' ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-1 rounded-md ${diff.changedFields?.includes('day') || diff.changedFields?.includes('startTime') || diff.changedFields?.includes('endTime') ? 'bg-rose-500/10 text-rose-400 line-through decoration-rose-400/50' : 'bg-[#1E293B] text-slate-400'}`}>
                          {s1?.day} {s1?.startTime}-{s1?.endTime}
                        </span>
                        <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                        <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-medium">
                          {s2?.day} {s2?.startTime}-{s2?.endTime}
                        </span>
                      </div>
                    ) : diff.status === 'ambiguous' ? (
                      <div className="space-y-3">
                        <span className="inline-block px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 font-medium text-sm">
                          {s2?.day} {s2?.startTime}-{s2?.endTime} <span className="opacity-70">(New)</span>
                        </span>
                        <div className="bg-[#090D16] rounded-lg p-3 text-xs border border-white/5">
                          <div className="text-slate-500 font-semibold mb-2 uppercase tracking-wider text-[10px]">Match Candidates:</div>
                          {diff.candidates?.map(c => (
                            <div key={c.id} className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
                              <span className="font-medium text-slate-300">{c.day} {c.startTime}-{c.endTime}</span>
                              <Button size="sm" variant="outline" className="h-7 text-xs shadow-sm bg-transparent border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 transition-colors" onClick={() => handleResolveAmbiguous(globalIndex, c.id)}>Accept Match</Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">{displayS?.day} {displayS?.startTime}-{displayS?.endTime}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {diff.status === 'changed' ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-1 rounded-md ${diff.changedFields?.includes('room') ? 'bg-rose-500/10 text-rose-400 line-through decoration-rose-400/50' : 'bg-[#1E293B] text-slate-400'}`}>
                          {s1?.room}
                        </span>
                        {diff.changedFields?.includes('room') && (
                           <>
                             <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                             <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-medium">
                               {s2?.room}
                             </span>
                           </>
                        )}
                      </div>
                    ) : diff.status === 'ambiguous' ? (
                      <span className="text-slate-200 font-medium">{s2?.room}</span>
                    ) : (
                      <span className="text-slate-400">{displayS?.room}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {diff.causesClash?.map((clash, j) => (
                      <Badge key={j} variant="destructive" className="flex items-center gap-1.5 mt-1 text-xs whitespace-nowrap bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 shadow-none font-medium px-2 py-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        {clash.message}
                      </Badge>
                    ))}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: SessionDiff['status'] }) {
  switch (status) {
    case 'added': return <Badge className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-semibold px-2.5 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span> Added</Badge>;
    case 'removed': return <Badge className="bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 font-semibold px-2.5 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5"></span> Removed</Badge>;
    case 'changed': return <Badge className="bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 font-semibold px-2.5 py-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5"></span> Changed</Badge>;
    case 'ambiguous': return <Badge className="bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 font-semibold px-2.5 py-0.5"><Info className="w-3 h-3 mr-1.5" /> Needs Review</Badge>;
    default: return <Badge variant="secondary" className="bg-[#1E293B] text-slate-400 hover:bg-[#1E293B]/80 border border-white/5 font-medium px-2.5 py-0.5">Unchanged</Badge>;
  }
}
