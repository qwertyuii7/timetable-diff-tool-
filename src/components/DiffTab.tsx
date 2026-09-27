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
      <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg">
        <Select value={filterCourse} onValueChange={(val) => setFilterCourse(val || 'All')}>
          <SelectTrigger className="w-[180px] bg-white"><SelectValue placeholder="Course" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Courses</SelectItem>
            {courses.map(c => <SelectItem key={c} value={c!}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterSection} onValueChange={(val) => setFilterSection(val || 'All')}>
          <SelectTrigger className="w-[180px] bg-white"><SelectValue placeholder="Section" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Sections</SelectItem>
            {sections.map(s => <SelectItem key={s} value={s!}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex gap-2 ml-auto">
          <Badge 
            variant={filterStatus === 'all' ? 'default' : 'outline'} 
            className="cursor-pointer" onClick={() => setFilterStatus('all')}
          >All</Badge>
          <Badge 
            variant={filterStatus === 'added' ? 'default' : 'outline'} 
            className="cursor-pointer border-emerald-500 text-emerald-700 data-[state=active]:bg-emerald-500" onClick={() => setFilterStatus('added')}
          >Added</Badge>
          <Badge 
            variant={filterStatus === 'removed' ? 'default' : 'outline'} 
            className="cursor-pointer border-red-500 text-red-700" onClick={() => setFilterStatus('removed')}
          >Removed</Badge>
          <Badge 
            variant={filterStatus === 'changed' ? 'default' : 'outline'} 
            className="cursor-pointer border-amber-500 text-amber-700" onClick={() => setFilterStatus('changed')}
          >Changed</Badge>
          <Badge 
            variant={filterStatus === 'unchanged' ? 'default' : 'outline'} 
            className="cursor-pointer border-gray-500 text-gray-700" onClick={() => setFilterStatus('unchanged')}
          >Unchanged</Badge>
          <Badge 
            variant={filterStatus === 'ambiguous' ? 'default' : 'outline'} 
            className="cursor-pointer border-purple-500 text-purple-700" onClick={() => setFilterStatus('ambiguous')}
          >Needs Review</Badge>
        </div>
      </div>

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
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
