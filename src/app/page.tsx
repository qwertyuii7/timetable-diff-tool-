'use client';

import { useState } from 'react';
import { UploadTab } from '@/components/UploadTab';
import { DiffTab } from '@/components/DiffTab';
import { SummaryTab } from '@/components/SummaryTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimetableStore } from '@/store/useTimetableStore';
import { FileUp, Sparkles, LayoutList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { v1Sessions, v2Sessions } = useTimetableStore();
  const [tab, setTab] = useState('upload');

  const hasData = v1Sessions.length > 0 && v2Sessions.length > 0;

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-white to-white text-gray-900 p-6 md:p-12 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="text-center space-y-4 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center justify-center p-2 bg-blue-50 rounded-2xl mb-4 border border-blue-100 shadow-sm">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold tracking-wide text-blue-800 uppercase">Version 2.0</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 drop-shadow-sm">
              What <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Changed?</span>
            </h1>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto font-medium">
              The intelligent timetable diffing tool. See exactly what moved, what’s new, and spot clashes instantly.
            </p>
          </motion.div>
        </header>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto mb-12 h-14 bg-white/50 backdrop-blur-md border shadow-sm rounded-2xl p-1">
            <TabsTrigger value="upload" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <div className="flex items-center gap-2 text-base"><FileUp className="w-4 h-4" /> 1. Upload</div>
            </TabsTrigger>
            <TabsTrigger value="diff" disabled={!hasData} className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <div className="flex items-center gap-2 text-base"><LayoutList className="w-4 h-4" /> 2. Review Changes</div>
            </TabsTrigger>
            <TabsTrigger value="summary" disabled={!hasData} className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md transition-all">
              <div className="flex items-center gap-2 text-base"><Sparkles className="w-4 h-4" /> 3. Summary</div>
            </TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="upload" className="mt-0 outline-none">
                <UploadTab onComplete={() => setTab('diff')} />
              </TabsContent>
              
              <TabsContent value="diff" className="mt-0 outline-none">
                <DiffTab />
              </TabsContent>
              
              <TabsContent value="summary" className="mt-0 outline-none">
                <SummaryTab />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </main>
  );
}
