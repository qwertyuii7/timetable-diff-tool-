'use client';

import { useState, useEffect } from 'react';
import { useTimetableStore } from '../store/useTimetableStore';
import { generateChangelog } from '../lib/ai';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function SummaryTab() {
  const { diffs } = useTimetableStore();
  const [sentences, setSentences] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      const res = await generateChangelog(diffs);
      setSentences(res);
      setLoading(false);
    }
    if (diffs.length > 0) {
      fetchSummary();
    }
  }, [diffs]);

  const copyToClipboard = () => {
    const text = sentences.map(s => `• ${s}`).join('\n');
    navigator.clipboard.writeText(`Timetable Updates:\n${text}`);
    alert('Copied to clipboard!');
  };

  if (diffs.length === 0) return <div className="text-slate-400">No changes to summarize.</div>;

  return (
    <Card className="max-w-3xl mx-auto border-white/10 bg-[#0F172A]/80 backdrop-blur-xl shadow-2xl">
      <CardHeader className="border-b border-white/5">
        <CardTitle className="text-white">Change Summary</CardTitle>
        <CardDescription className="text-slate-400">A human-readable list of what changed, ready to share.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[#1E293B] rounded w-3/4"></div>
            <div className="h-4 bg-[#1E293B] rounded w-1/2"></div>
            <div className="h-4 bg-[#1E293B] rounded w-5/6"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              {sentences.length === 0 ? (
                <li className="text-slate-500">No significant schedule changes detected.</li>
              ) : (
                sentences.map((s, i) => (
                  <li key={i} className="text-slate-300">{s}</li>
                ))
              )}
            </ul>
            {sentences.length > 0 && (
              <Button onClick={copyToClipboard} variant="outline" className="mt-4 border-indigo-500/30 text-indigo-400 bg-transparent hover:bg-indigo-500/10 hover:text-indigo-300">
                Copy as text
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
