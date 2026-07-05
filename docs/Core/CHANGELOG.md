# CHANGELOG

All notable changes to the LinguaLog project will be documented in this file.

This changelog follows the principles of **Keep a Changelog** and uses a simplified versioning approach suitable for this project.

---

# Version 1.0.0

## Project Initialization

### Added

* Initial project structure
* Home screen
* History screen
* Dashboard screen
* Settings screen
* LocalStorage-based data management
* Responsive UI
* Theme support

### Notes

This version established the foundation of the LinguaLog project.

---

# Version 1.1.0

## AI Journal Analysis

### Added

* Gemini AI integration
* AI Provider abstraction
* API Settings
* API Key management
* Journal analysis
* CEFR level analysis
* Topic detection
* AI feedback generation
* Analysis result storage

### Changed

* Analysis results are now stored inside each Entry.
* Dashboard reads analysis data from storage instead of calling the AI repeatedly.

### Technical

* Introduced `AnalysisAPI.analyzeJournal()`
* Introduced Prompt management module
* Introduced Analysis Version management

---

# Version 1.2.0

## Analysis Expansion

### Added

* Conversation Type analysis
* Keyword extraction
* Grammar analysis
* Vocabulary analysis
* Analysis Version 1.1

### Changed

* Extended analysis JSON schema
* Improved JSON validation
* Improved History analysis rendering

### Technical

* Version-aware analysis structure
* Better JSON sanitizing
* More reliable AI response validation

---

# Version 1.3.0 (In Progress)

## Writing Experience Improvements

### Planned

* Multiple journal entries per day
* Entry ID-based architecture
* Automatic title generation
* 500-word recommendation
* Improved word counter
* History grouped by date and time
* Better writing workflow

### Changed

* Entry management no longer depends on date.
* Writing experience redesigned for frequent journaling.

---

# Upcoming Versions

## Version 1.4

### Draft System

Planned

* Auto-save drafts
* Restore unfinished writing
* Recovery after refresh
* Recovery after browser restart

---

## Version 1.5

### Dashboard AI Insights

Planned

* CEFR trend
* Grammar trend
* Vocabulary trend
* Conversation Type distribution
* Keyword statistics
* Writing statistics

---

## Version 1.6

### Growth Report

Planned

* Monthly reports
* Weekly reports
* AI growth summary
* Learning pattern analysis

---

## Version 1.7

### Export & Backup

Planned

* Excel export
* CSV export
* JSON export
* Import
* Restore

---

## Version 2.0

### Cloud Platform

Planned

* User accounts
* Cloud synchronization
* Cross-device support
* Online storage

---

## Version 3.0

### Flutter Mobile App

Planned

* Android application
* iOS application
* Shared data model
* Cloud synchronization
* Mobile-first experience

---

# Versioning Policy

LinguaLog uses the following versioning approach.

## Major Version

Large architectural changes.

Examples

* Cloud migration
* Mobile application
* Database migration

---

## Minor Version

New user-facing features.

Examples

* AI analysis
* Dashboard
* Search
* Export

---

## Patch Version

Bug fixes.

Examples

* UI fixes
* Performance improvements
* History sorting fixes
* Storage bug fixes

---

# Analysis Version

AI analysis has its own independent version.

Example

Analysis Version

1.0

↓

1.1

↓

1.2

This version is independent from the application version.

When the analysis schema changes, only the Analysis Version increases.

Older analysis results remain readable and can be re-analyzed when necessary.

---

# Development Philosophy

Every release should improve at least one of the following:

* Writing experience
* AI analysis quality
* Growth visualization
* Performance
* Maintainability

New features should support the long-term vision of LinguaLog rather than adding unnecessary complexity.

---

# Future Goal

The long-term goal of LinguaLog is not simply to analyze English journals.

The goal is to become a personal English growth platform where users can record, analyze, review, and visualize their learning journey over time.
