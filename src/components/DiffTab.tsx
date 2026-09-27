'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTimetableStore } from '../store/useTimetableStore';
import { computeDiff, detectClashes } from '../lib/matcher';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { SessionDiff } from '../types';

export function DiffTab() {
  const { v1Sessions, v2Sessions, diffs, setDiffs } = useTimetableStore();
  const [filterCourse, setFilterCourse] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [filterStatus, setFilterStatus] = useState<SessionDiff['status'] | 'all'>('all');

  useEffect(() => {
    if (v1Sessions.length > 0 && v2Sessions.length > 0 && diffs.length === 0) {
      let computed = computeDiff(v1Sessions, v2Sessions);
      computed = detectClashes(computed, v2Sessions);
      setDiffs(computed);
    }
  }, [v1Sessions, v2Sessions, diffs.length, setDiffs]);

  const courses = useMemo(() => Array.from(new Set(diffs.flatMap(d => [d.oldSession?.courseCode, d.newSession?.courseCode]).filter(Boolean))), [diffs]);
  const sections = useMemo(() => Array.from(new Set(diffs.flatMap(d => [d.oldSession?.section, d.newSession?.section]).filter(Boolean))), [diffs]);

  const filteredDiffs = useMemo(() => {
    return diffs.filter(d => {
      const matchCourse = filterCourse === 'All' || d.oldSession?.courseCode === filterCourse || d.newSession?.courseCode === filterCourse;
      const matchSection = filterSection === 'All' || d.oldSession?.section === filterSection || d.newSession?.section === filterSection;
      const matchStatus = filterStatus === 'all' || d.status === filterStatus;
      return matchCourse && matchSection && matchStatus;
    });
  }, [diffs, filterCourse, filterSection, filterStatus]);

  if (diffs.length === 0) return <div>Analyzing changes...</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center bg-[#0F172A]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-lg mb-8">
        <Select value={filterCourse} onValueChange={(val) => setFilterCourse(val || 'All')}>
          <SelectTrigger className="w-[180px] bg-[#090D16] border-[#1E293B] text-slate-200"><SelectValue placeholder="Course" /></SelectTrigger>
          <SelectContent className="bg-[#1E293B] border-[#1E293B] text-slate-200">
            <SelectItem value="All">All Courses</SelectItem>
            {courses.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterSection} onValueChange={(val) => setFilterSection(val || 'All')}>
          <SelectTrigger className="w-[180px] bg-[#090D16] border-[#1E293B] text-slate-200"><SelectValue placeholder="Section" /></SelectTrigger>
          <SelectContent className="bg-[#1E293B] border-[#1E293B] text-slate-200">
            <SelectItem value="All">All Sections</SelectItem>
            {sections.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex gap-2 ml-auto">
          <Badge 
            variant={filterStatus === 'all' ? 'default' : 'outline'} 
            className={`cursor-pointer ${filterStatus === 'all' ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-0' : 'border-[#1E293B] text-slate-400 hover:text-white'}`} onClick={() => setFilterStatus('all')}
          >All</Badge>
          <Badge 
            variant={filterStatus === 'added' ? 'default' : 'outline'} 
            className={`cursor-pointer ${filterStatus === 'added' ? 'bg-emerald-500/20 text-emerald-400 border-0' : 'border-[#1E293B] text-emerald-500/50 hover:text-emerald-400'}`} onClick={() => setFilterStatus('added')}
          >Added</Badge>
          <Badge 
            variant={filterStatus === 'removed' ? 'default' : 'outline'} 
            className={`cursor-pointer ${filterStatus === 'removed' ? 'bg-rose-500/20 text-rose-400 border-0' : 'border-[#1E293B] text-rose-500/50 hover:text-rose-400'}`} onClick={() => setFilterStatus('removed')}
          >Removed</Badge>
          <Badge 
            variant={filterStatus === 'changed' ? 'default' : 'outline'} 
            className={`cursor-pointer ${filterStatus === 'changed' ? 'bg-amber-500/20 text-amber-400 border-0' : 'border-[#1E293B] text-amber-500/50 hover:text-amber-400'}`} onClick={() => setFilterStatus('changed')}
          >Changed</Badge>
          <Badge 
            variant={filterStatus === 'unchanged' ? 'default' : 'outline'} 
            className={`cursor-pointer ${filterStatus === 'unchanged' ? 'bg-[#1E293B] text-slate-300 border-0' : 'border-[#1E293B] text-slate-500 hover:text-slate-300'}`} onClick={() => setFilterStatus('unchanged')}
          >Unchanged</Badge>
          <Badge 
            variant={filterStatus === 'ambiguous' ? 'default' : 'outline'} 
            className={`cursor-pointer ${filterStatus === 'ambiguous' ? 'bg-indigo-500/20 text-indigo-400 border-0' : 'border-[#1E293B] text-indigo-500/50 hover:text-indigo-400'}`} onClick={() => setFilterStatus('ambiguous')}
          >Needs Review</Badge>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="bg-[#0F172A] border border-white/5 rounded-xl p-1 mb-6">
          <TabsTrigger value="calendar" className="rounded-lg data-[state=active]:bg-[#1E293B] data-[state=active]:text-white text-slate-400">Calendar View</TabsTrigger>
          <TabsTrigger value="list" className="rounded-lg data-[state=active]:bg-[#1E293B] data-[state=active]:text-white text-slate-400">List View</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="mt-4">
          <CalendarView diffs={filteredDiffs} />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <ListView diffs={filteredDiffs} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
