'use client';

import { useState } from 'react';
import { UploadTab } from '@/components/UploadTab';
import { DiffTab } from '@/components/DiffTab';
import { SummaryTab } from '@/components/SummaryTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTimetableStore } from '@/store/useTimetableStore';
import { FileUp, GitMerge, TerminalSquare, ArrowRight, Zap, Target, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { v1Sessions, v2Sessions } = useTimetableStore();
  const [tab, setTab] = useState('upload');

  const hasData = v1Sessions.length > 0 && v2Sessions.length > 0;

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#2D2823] font-sans overflow-x-hidden selection:bg-[#E5D5C5] selection:text-[#2D2823]">
      
      {/* Decorative grain/texture (simulated with radial gradient) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden mix-blend-multiply opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#EFE8DD] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#E5D5C5] blur-[120px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 md:px-12 pt-20 pb-24 space-y-24">
        
        {/* Hero Section */}
        <header className="text-center space-y-6 pt-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-[#F5EFE6] rounded-full mb-8 border border-[#E5D5C5] shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-[#B8860B] mr-2"></span>
              <span className="text-xs font-semibold tracking-widest text-[#8B7355] uppercase">Smart Schedule Reconciliation</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#2D2823] mb-6 leading-tight">
              Know exactly <br/>
              <span className="text-[#8B7355] font-serif italic">What Changed.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[#5C5346] max-w-2xl mx-auto font-light leading-relaxed">
              Upload two versions of any university or school timetable. We instantly detect added classes, room re-allocations, shifted times, and hidden clashes.
            </p>
          </motion.div>
        </header>

        {/* How it Works Section */}
        <section className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="space-y-3 p-6 rounded-2xl bg-white/50 border border-[#E5D5C5]/50 shadow-sm backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-[#F5EFE6] flex items-center justify-center border border-[#E5D5C5]">
              <Layers className="w-5 h-5 text-[#8B7355]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2D2823]">1. Ingest Data</h3>
            <p className="text-sm text-[#5C5346] leading-relaxed">Drop your old and new spreadsheets (.csv or .xlsx). We intelligently map your columns automatically.</p>
          </div>
          <div className="space-y-3 p-6 rounded-2xl bg-white/50 border border-[#E5D5C5]/50 shadow-sm backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-[#F5EFE6] flex items-center justify-center border border-[#E5D5C5]">
              <Target className="w-5 h-5 text-[#8B7355]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2D2823]">2. Precise Diffing</h3>
            <p className="text-sm text-[#5C5346] leading-relaxed">Our matching engine pairs sections, identifying time shifts, room changes, and cancellations with 100% accuracy.</p>
          </div>
          <div className="space-y-3 p-6 rounded-2xl bg-white/50 border border-[#E5D5C5]/50 shadow-sm backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full bg-[#F5EFE6] flex items-center justify-center border border-[#E5D5C5]">
              <Zap className="w-5 h-5 text-[#8B7355]" />
            </div>
            <h3 className="text-lg font-semibold text-[#2D2823]">3. Spot Clashes</h3>
            <p className="text-sm text-[#5C5346] leading-relaxed">Review changes on a beautiful side-by-side calendar. We instantly flag if a moved class now collides with another.</p>
          </div>
        </section>

        {/* Main Application Area */}
        <div className="pt-8 scroll-mt-20" id="app">
          <Tabs value={tab} onValueChange={setTab} className="w-full relative z-10">
            <div className="flex justify-center mb-12">
              <TabsList className="flex w-full max-w-2xl bg-white/80 backdrop-blur-xl border border-[#E5D5C5] shadow-lg shadow-[#E5D5C5]/20 rounded-2xl p-1.5 h-auto">
                <TabsTrigger value="upload" className="flex-1 py-3 rounded-xl data-[state=active]:bg-[#FDFBF7] data-[state=active]:text-[#2D2823] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#E5D5C5] text-[#8B7355] transition-all">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium"><FileUp className="w-4 h-4" /> 01 / Upload</div>
                </TabsTrigger>
                <TabsTrigger value="diff" disabled={!hasData} className="flex-1 py-3 rounded-xl data-[state=active]:bg-[#FDFBF7] data-[state=active]:text-[#2D2823] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#E5D5C5] text-[#8B7355] transition-all disabled:opacity-30">
                  <div className="flex items-center justify-center gap-2 text-sm font-medium"><GitMerge className="w-4 h-4" /> 02 / Diff</div>
                </TabsTrigger>
                <TabsTrigger value="summary" disabled={!hasData} className="flex-1 py-3 rounded-xl data-[state=active]:bg-[#FDFBF7] data-[state=active]:text-[#2D2823] data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-[#E5D5C5] text-[#8B7355] transition-all disabled:opacity-30">
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
      </div>
    </main>
  );
}
