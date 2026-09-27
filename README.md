# What Changed? - Timetable Diff Tool

An intelligent timetable diffing tool that takes two versions of a timetable spreadsheet and shows exactly what changed — added sessions, removed sessions, and modified sessions (time/room/day) — while correctly ignoring rows that were merely reordered.

## Features
- **Deterministic Diffing**: Exact match and fuzzy match algorithms.
- **Clash Detection**: Highlights when rescheduled sections collide with existing bookings.
- **Visual Calendar**: Shows changes directly on a split animated weekly grid.
- **Client-Side Processing**: Fully private and extremely fast.

## Tech Stack
- Next.js 14
- Tailwind CSS & Shadcn UI
- Zustand (State Management)
- Framer Motion (Animations)
- SheetJS (Excel Parsing)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Deployment
See the provided Deployment Guide for Vercel instructions.
