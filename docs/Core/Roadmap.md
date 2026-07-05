# Roadmap

> LinguaLog Development Roadmap
>
> Last Updated: 2026-07-05

---

# Vision

LinguaLog is not an AI diary.

It is a long-term English Growth Platform that helps users record, analyze, and visualize their English learning journey.

Development prioritizes:

- Record First
- Growth Over Perfection
- Data-Driven Learning
- Long-term Maintainability

---

# Development Status

| Phase | Status |
|--------|--------|
| Phase 1 - Core Journal | ✅ Complete |
| Phase 2 - AI Integration | ✅ Complete |
| Phase 3 - AI Analysis Expansion | ✅ Complete |
| Phase 3.5A - Writing Experience | 🚧 In Progress |
| Phase 4 - Dashboard Insights | ⏳ Planned |
| Phase 5 - Word Bank | ⏳ Planned |
| Phase 6 - Export & Backup | ⏳ Planned |
| Phase 7 - Cloud Sync | ⏳ Planned |
| Phase 8 - Flutter App | ⏳ Planned |

---

# Phase 1 — Core Journal ✅

## Goals

- Journal CRUD
- LocalStorage
- Basic UI
- Entry Management

### Completed

- ✅ Create Entry
- ✅ Edit Entry
- ✅ Delete Entry
- ✅ Automatic Title Generation
- ✅ Multiple Entries per Day
- ✅ Entry ID-based Storage

---

# Phase 2 — AI Integration ✅

## Goals

Integrate Gemini through a provider abstraction layer.

### Completed

- ✅ Gemini Provider
- ✅ Provider Architecture
- ✅ Prompt Layer
- ✅ Structured Response
- ✅ Analysis Validation

---

# Phase 3 — AI Analysis Expansion ✅

## Goals

Expand AI analysis beyond simple feedback.

### Completed

- ✅ CEFR Level
- ✅ Topic Detection
- ✅ Grammar Analysis
- ✅ Vocabulary Analysis
- ✅ Conversation Type Analysis
- ✅ Keyword Extraction

---

# Phase 3.5A — Writing Experience 🚧

## Objective

Make writing easier, faster, and more enjoyable while preserving a clean architecture.

### Completed

- ✅ Multiple Entries per Day
- ✅ Entry ID Architecture
- ✅ Automatic Title Generation
- ✅ History Search
- ✅ History Sorting
- ✅ Inline Edit
- ✅ Delete Entry

### Remaining

- ⏳ Writing UX Polish
- ⏳ Documentation Synchronization
- ⏳ UX Improvements based on user feedback

Priority

★★★★★

---

# Phase 4 — Dashboard Insights

## Goal

Visualize long-term English growth.

### Planned

- Grammar Trend
- Vocabulary Trend
- CEFR Progress
- Conversation Type Statistics
- AI Growth Insights

Priority

★★★★★

---

# Phase 5 — Word Bank

## Goal

Build a personal vocabulary learning system.

### Planned

- Personal Word Bank
- Favorite Words
- Learned Words
- Review Status
- Search & Filter

Priority

★★★★☆

---

# Phase 6 — Export & Backup

## Goal

Allow users to export and back up their learning history.

### Planned

- CSV Export
- Excel Export
- PDF Report
- Backup
- Restore

Priority

★★★☆☆

---

# Phase 7 — Cloud Sync

## Goal

Synchronize data across devices.

### Planned

- User Account
- Cloud Database
- Device Sync
- Authentication

Priority

★★★★☆

---

# Phase 8 — Flutter Mobile App

## Goal

Provide a native mobile experience.

### Planned

- Flutter Application
- Shared Data Model
- Cloud Synchronization
- Push Notifications
- Mobile-first Writing Experience

Priority

★★★★★

---

# Guiding Principles

Every new feature follows the same workflow:

1. Requirements
2. Design Review
3. Claude Prompt
4. Implementation
5. Code Review
6. Documentation Update

---

# Notes

- Document-Driven Development is the default workflow.
- Architecture changes should be minimized.
- New AI analysis fields must preserve backward compatibility.
- Dashboard must use stored analysis data and must never re-call the AI API.
- Documentation should remain synchronized with the implementation.