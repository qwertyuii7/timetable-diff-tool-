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

  if (diffs.length === 0) return <div className="text-[#5C5346]">No changes to summarize.</div>;

  return (
    <Card className="max-w-3xl mx-auto border-[#E5D5C5] bg-white/80 backdrop-blur-xl shadow-xl">
      <CardHeader className="border-b border-[#E5D5C5]/50">
        <CardTitle className="text-[#2D2823]">Change Summary</CardTitle>
        <CardDescription className="text-[#5C5346]">A human-readable list of what changed, ready to share.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-[#F5EFE6] rounded w-3/4 border border-[#E5D5C5]/50"></div>
            <div className="h-4 bg-[#F5EFE6] rounded w-1/2 border border-[#E5D5C5]/50"></div>
            <div className="h-4 bg-[#F5EFE6] rounded w-5/6 border border-[#E5D5C5]/50"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              {sentences.length === 0 ? (
                <li className="text-[#8B7355]">No significant schedule changes detected.</li>
              ) : (
                sentences.map((s, i) => (
                  <li key={i} className="text-[#2D2823]">{s}</li>
                ))
              )}
            </ul>
            {sentences.length > 0 && (
              <Button onClick={copyToClipboard} variant="outline" className="mt-4 border-[#E5D5C5] text-[#8B7355] bg-white hover:bg-[#F5EFE6] hover:text-[#2D2823]">
                Copy as text
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
