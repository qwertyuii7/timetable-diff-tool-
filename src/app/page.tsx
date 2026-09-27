'use client';

import { useState } from 'react';
import { UploadTab } from '@/components/UploadTab';
import { DiffTab } from '@/components/DiffTab';
import { SummaryTab } from '@/components/SummaryTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimetableStore } from '@/store/useTimetableStore';
import { FileUp, GitMerge, TerminalSquare, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { v1Sessions, v2Sessions } = useTimetableStore();
  const [tab, setTab] = useState('upload');

  const hasData = v1Sessions.length > 0 && v2Sessions.length > 0;

  return (
    <main className="min-h-screen bg-[#090D16] text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-12 px-6 md:px-12 pt-16 pb-24">
        
        {/* Hero Section */}
        <header className="text-center space-y-6 pt-10 pb-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <div className="inline-flex items-center justify-center px-3 py-1 bg-white/5 rounded-full mb-6 border border-white/10 shadow-lg backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              <span className="text-xs font-medium tracking-widest text-slate-300 uppercase">Engineered for Precision</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
              What <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Changed?</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
              Topological conflict detection and schedule reconciliation. <br className="hidden md:block" /> Drop two timetables, and we'll compute the exact diff.
            </p>
          </motion.div>
        </header>

        {/* Navigation Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full relative z-10">
          <div className="flex justify-center mb-12">
            <TabsList className="flex w-full max-w-2xl bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-1.5 h-auto">
              <TabsTrigger value="upload" className="flex-1 py-3 rounded-xl data-[state=active]:bg-[#1E293B] data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 transition-all">
                <div className="flex items-center justify-center gap-2 text-sm font-medium"><FileUp className="w-4 h-4" /> 01 / Ingest</div>
              </TabsTrigger>
              <TabsTrigger value="diff" disabled={!hasData} className="flex-1 py-3 rounded-xl data-[state=active]:bg-[#1E293B] data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 transition-all disabled:opacity-30">
                <div className="flex items-center justify-center gap-2 text-sm font-medium"><GitMerge className="w-4 h-4" /> 02 / Diff</div>
              </TabsTrigger>
              <TabsTrigger value="summary" disabled={!hasData} className="flex-1 py-3 rounded-xl data-[state=active]:bg-[#1E293B] data-[state=active]:text-white data-[state=active]:shadow-lg text-slate-400 transition-all disabled:opacity-30">
                <div className="flex items-center justify-center gap-2 text-sm font-medium"><TerminalSquare className="w-4 h-4" /> 03 / Report</div>
              </TabsTrigger>
            </TabsList>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
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
