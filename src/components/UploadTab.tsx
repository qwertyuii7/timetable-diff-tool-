'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { parseFile, RawRow, normalizeDay, normalizeTime } from '../lib/parser';
import { Session } from '../types';
import { useTimetableStore } from '../store/useTimetableStore';
import { normalizeRooms } from '../lib/ai';
import { FileUp, TableProperties, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadState {
  v1Raw: RawRow[] | null;
  v2Raw: RawRow[] | null;
  v1Headers: string[];
  v2Headers: string[];
  mapping: {
    courseCode: string;
    section: string;
    day: string;
    startTime: string;
    endTime: string;
    room: string;
  };
  step: 'upload' | 'mapping' | 'done';
}

export function UploadTab({ onComplete }: { onComplete: () => void }) {
  const { setV1Sessions, setV2Sessions } = useTimetableStore();
  const [state, setState] = useState<UploadState>({
    v1Raw: null,
    v2Raw: null,
    v1Headers: [],
    v2Headers: [],
    mapping: {
      courseCode: '',
      section: '',
      day: '',
      startTime: '',
      endTime: '',
      room: ''
    },
    step: 'upload'
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, version: 'v1' | 'v2') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseFile(file);
      if (data.length === 0) return;
      const headers = Object.keys(data[0]);

      setState(prev => {
        const next = {
          ...prev,
          [`${version}Raw`]: data,
          [`${version}Headers`]: headers,
        };
        
        if (!prev.mapping.courseCode) {
          const guess = (keywords: string[]) => headers.find(h => keywords.some(k => h.toLowerCase().includes(k))) || '';
          next.mapping = {
            courseCode: guess(['course', 'subject', 'code']),
            section: guess(['sec', 'group']),
            day: guess(['day']),
            startTime: guess(['start', 'time']),
            endTime: guess(['end']),
            room: guess(['room', 'venue', 'location']),
          };
        }

        if (next.v1Raw && next.v2Raw) {
          next.step = 'mapping';
        }
        
        return next;
      });
    } catch (err) {
      console.error(err);
      alert('Error parsing file');
    }
  };

  const handleMappingChange = (field: keyof UploadState['mapping'], value: string) => {
    setState(prev => ({
      ...prev,
      mapping: { ...prev.mapping, [field]: value }
    }));
  };

  const processMapping = async () => {
    if (!state.v1Raw || !state.v2Raw) return;

    const mapToSessions = (raw: RawRow[]): Session[] => {
      return raw.map((row) => {
        const courseCode = row[state.mapping.courseCode] || '';
        const section = row[state.mapping.section] || '';
        const rawDay = row[state.mapping.day] || '';
        const day = normalizeDay(rawDay);
        const startTime = normalizeTime(row[state.mapping.startTime] || '');
        const endTime = normalizeTime(row[state.mapping.endTime] || '');
        const room = row[state.mapping.room] || '';
        
        return {
          id: `${courseCode}-${section}-${day}-${startTime}`,
          courseCode,
          section,
          day,
          startTime,
          endTime,
          room,
          roomNormalized: room,
          raw: row,
        };
      }).filter(s => s.courseCode && s.day);
    };

    let v1 = mapToSessions(state.v1Raw);
    let v2 = mapToSessions(state.v2Raw);

    const allRooms = Array.from(new Set([...v1.map(s => s.room), ...v2.map(s => s.room)]));
    const normalizedMap = await normalizeRooms(allRooms);

    v1 = v1.map(s => ({ ...s, roomNormalized: normalizedMap[s.room] || s.room }));
    v2 = v2.map(s => ({ ...s, roomNormalized: normalizedMap[s.room] || s.room }));

    setV1Sessions(v1);
    setV2Sessions(v2);
    setState(prev => ({ ...prev, step: 'done' }));
    onComplete();
  };

  if (state.step === 'mapping') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
        <Card className="border-0 shadow-xl shadow-blue-900/5 bg-white/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-4">
              <TableProperties className="w-7 h-7 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Map Your Columns</CardTitle>
            <CardDescription className="text-base">We detected the headers in your spreadsheet. Please confirm them below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {Object.keys(state.mapping).map((field) => (
                <div key={field} className="grid gap-2">
                  <Label className="capitalize text-sm font-semibold text-gray-700">{field.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  <Select 
                    value={state.mapping[field as keyof UploadState['mapping']]} 
                    onValueChange={(val) => handleMappingChange(field as keyof UploadState['mapping'], val || '')}
                  >
                    <SelectTrigger className="bg-gray-50/50 border-gray-200">
                      <SelectValue placeholder="Select column..." />
                    </SelectTrigger>
                    <SelectContent>
                      {state.v1Headers.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <Button onClick={processMapping} className="w-full mt-8 h-12 text-lg rounded-xl shadow-md bg-blue-600 hover:bg-blue-700 group">
              Process Timetables
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <UploadDropzone
        title="Previous Version (V1)"
        description="Upload the old timetable (.csv or .xlsx)"
        loaded={!!state.v1Raw}
        onUpload={(e) => handleFileUpload(e, 'v1')}
        id="v1"
      />
      <UploadDropzone
        title="New Version (V2)"
        description="Upload the new timetable (.csv or .xlsx)"
        loaded={!!state.v2Raw}
        onUpload={(e) => handleFileUpload(e, 'v2')}
        id="v2"
      />
    </div>
  );
}

function UploadDropzone({ title, description, loaded, onUpload, id }: { title: string, description: string, loaded: boolean, onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void, id: string }) {
  return (
    <Card className={`border-0 shadow-lg transition-all duration-300 ${loaded ? 'shadow-emerald-900/10 bg-emerald-50/30 ring-1 ring-emerald-500/50' : 'shadow-blue-900/5 bg-white/80'} backdrop-blur-xl`}>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${loaded ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50/50'}`}>
          <Label htmlFor={`${id}-upload`} className="cursor-pointer flex flex-col items-center justify-center w-full h-full">
            {loaded ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                <span className="text-emerald-700 font-semibold text-lg">File Loaded Successfully</span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center text-gray-500 hover:text-blue-600 transition-colors">
                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                  <FileUp className="w-8 h-8" />
                </div>
                <span className="font-medium text-lg">Click or drag file to upload</span>
              </div>
            )}
            <Input 
              id={`${id}-upload`}
              type="file" 
              accept=".csv, .xlsx" 
              className="hidden" 
              onChange={onUpload} 
            />
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
