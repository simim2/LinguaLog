# CLAUDE.md

# LinguaLog AI Development Instructions

> This document defines the development rules for AI assistants working on the LinguaLog project.
>
> Please read this file before making any code changes.

---

# Project Overview

LinguaLog is **not simply an AI English journal application.**

The goal of the project is to become a **personal English growth platform** that records, analyzes, and visualizes a user's English learning journey.

When implementing new features, always prioritize the long-term vision over short-term convenience.

---

# Read These Documents First

Before implementing any feature, read the following documents in order.

1. docs/ProjectVision.md
2. docs/Architecture.md
3. docs/DevelopmentGuide.md
4. docs/Roadmap.md

If a Phase document exists, read it before implementation.

Example

```
docs/

Phase-3.5A/

Requirements.md

Design.md

ImplementationPlan.md

ClaudePrompt.md
```

Implementation should follow those documents whenever possible.

---

# Your Role

Your responsibility is **implementation**, not product planning.

Please:

* implement requested features
* preserve project architecture
* minimize unnecessary changes
* explain trade-offs before making architectural changes

Do NOT redesign the project unless explicitly requested.

---

# Core Principles

## 1. Preserve Existing Architecture

Avoid large-scale refactoring.

Prefer extending the existing architecture.

---

## 2. Minimize File Changes

Modify only the files required for the requested feature.

Do not reorganize the project unless requested.

---

## 3. Reuse Existing Code

Before creating new functions,

look for reusable code.

If similar logic already exists,

reuse or extend it.

---

## 4. Keep UI Simple

LinguaLog is designed to help users write.

Avoid adding unnecessary dialogs,

complex settings,

or additional clicks.

Writing should always feel lightweight.

---

# AI Rules

UI must never call fetch() directly.

Always use

```
AnalysisAPI.analyzeJournal(entry)
```

AI providers must remain replaceable.

Current provider:

Gemini

Future providers may include

* OpenAI
* Local LLM
* Self-hosted API

Do not hard-code Gemini-specific logic into the UI.

---

# Storage Rules

Always use Storage classes.

Do not access LocalStorage directly from UI code.

Current storage objects include

* EntryStorage
* SettingsStorage
* AISettingsStorage

---

# Entry Rules

Entries are ID-based.

Never assume

"One Entry per Day."

Multiple entries per day are supported.

Dates are used only for grouping.

Operations should use Entry IDs.

---

# Analysis Rules

Analysis data should always be stored in structured JSON.

Current schema includes

* CEFR
* Topic
* Feedback
* Conversation Types
* Keywords
* Grammar
* Vocabulary

If the schema changes,

consider updating

```
ANALYSIS_VERSION
```

and preserve compatibility with previous analysis versions whenever possible.

---

# Dashboard Rules

Dashboard should never call the AI again.

Dashboard reads only stored analysis data.

Statistics should always be generated from stored Entries.

---

# Mobile-first Thinking

Although the current project is a web application,

it is expected to become a Flutter application later.

Avoid browser-specific logic unless necessary.

Prefer reusable business logic.

---

# Documentation-first Development

Before implementation,

Requirements,

Design,

Implementation Plan,

and Claude Prompt

should already exist.

If they do not exist,

recommend creating them before implementation.

---

# When Receiving a Request

Always follow this order.

## Step 1

Analyze the current project.

---

## Step 2

Explain

* current implementation
* affected files
* potential side effects

---

## Step 3

List

* files to modify
* reason for modification

---

## Step 4

Wait for confirmation.

Do not immediately implement large changes.

---

## Step 5

Implement after approval.

---

## Step 6

After implementation,

summarize

* modified files
* completed features
* testing steps
* recommended Git commit message

---

# Coding Style

Prefer

* readable code
* small functions
* reusable utilities
* descriptive variable names

Avoid

* duplicated logic
* deeply nested code
* unnecessary abstraction

---

# Communication Style

When proposing implementation,

be specific.

Prefer

✔ "Modify app.js because..."

instead of

✘ "I will improve the project."

If architectural changes are necessary,

explain why first.

---

# Long-term Goal

Every feature should help answer one question:

"Will this improve the user's English growth experience?"

If not,

consider a simpler implementation.

The project values

**maintainability**

more than

rapid feature development.

---

# Final Reminder

When in doubt,

follow the documentation.

If documentation conflicts with implementation,

ask before changing the architecture.

Do not silently change project design.
