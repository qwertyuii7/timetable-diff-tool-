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

  if (diffs.length === 0) return <div>No changes to summarize.</div>;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Change Summary</CardTitle>
        <CardDescription>A human-readable list of what changed, ready to share.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <ul className="list-disc pl-5 space-y-2">
              {sentences.length === 0 ? (
                <li className="text-gray-500">No significant schedule changes detected.</li>
              ) : (
                sentences.map((s, i) => (
                  <li key={i} className="text-gray-800">{s}</li>
                ))
              )}
            </ul>
            {sentences.length > 0 && (
              <Button onClick={copyToClipboard} variant="outline" className="mt-4">
                Copy as text
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
