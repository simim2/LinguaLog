# LinguaLog Documentation

## Overview

이 폴더는 LinguaLog 프로젝트의 모든 설계 문서를 관리합니다.

LinguaLog는 단순한 AI 영어일기 웹사이트가 아니라,

**사용자의 영어 성장 데이터를 기록하고 분석하는 플랫폼**을 목표로 개발되고 있습니다.

모든 기능 개발은 이 문서를 기준으로 진행합니다.

---

# Documentation Structure

```
docs/

README.md
ProjectVision.md
Roadmap.md
Architecture.md
DevelopmentGuide.md
CHANGELOG.md

Phase-1/
Phase-2/
Phase-3/
Phase-3.5A/
Phase-3.5B/
Phase-3.5C/
...
```

---

# Documents

## ProjectVision.md

프로젝트의 목표와 철학을 정의합니다.

다음을 포함합니다.

- 프로젝트 목표
- 핵심 가치
- 장기 방향
- 차별점

새로운 기능을 추가하기 전 반드시 확인해야 하는 문서입니다.

---

## Roadmap.md

프로젝트의 전체 개발 계획입니다.

- 완료된 Phase
- 진행 중인 Phase
- 예정된 Phase

를 관리합니다.

---

## Architecture.md

프로젝트의 기술 구조를 정의합니다.

포함 내용

- 시스템 구조
- 데이터 구조
- Storage 구조
- AI 분석 구조
- Dashboard 구조
- 모바일 확장 구조

---

## DevelopmentGuide.md

개발 규칙입니다.

Claude가 구현할 때 반드시 따라야 하는 규칙을 정의합니다.

예를 들어

- 최소 수정 원칙
- 기존 구조 유지
- API 호출 규칙
- Prompt 작성 규칙
- 코드 스타일

등을 관리합니다.

---

## CHANGELOG.md

프로젝트 변경 이력을 관리합니다.

Git Commit과는 별개로

사용자가 이해하기 쉬운 변경 내역을 기록합니다.

---

# Phase Documents

각 Phase는 독립적인 문서를 가집니다.

예시

```
Phase-3.5A/

Requirements.md
Design.md
ImplementationPlan.md
ClaudePrompt.md
```

---

## Requirements.md

무엇을 만들 것인지 정의합니다.

포함 내용

- 왜 필요한가
- 목표
- 기능 목록
- 예외사항
- 성공 조건

---

## Design.md

구현 방법을 설계합니다.

포함 내용

- 화면 변경
- 데이터 변경
- Storage 변경
- 기존 기능 영향
- UI 변경

---

## ImplementationPlan.md

실제 개발 계획입니다.

포함 내용

- 수정 파일
- 작업 순서
- 테스트 계획
- 영향 범위

---

## ClaudePrompt.md

Claude에게 전달하는 구현 문서입니다.

포함 내용

- 구현 범위
- 수정 파일
- 주의사항
- 완료 조건

---

# Development Workflow

새로운 기능은 반드시 아래 순서를 따릅니다.

Idea

↓

Requirements.md 작성

↓

Design.md 작성

↓

ImplementationPlan.md 작성

↓

ClaudePrompt.md 작성

↓

Claude 구현

↓

Code Review

↓

Git Commit

↓

CHANGELOG 업데이트

---

# Development Principles

LinguaLog는

빠른 기능 추가보다

**좋은 구조**

를 우선합니다.

새로운 기능은

기존 구조를 최대한 유지하면서

확장 가능하도록 개발합니다.

---

# AI Development

ChatGPT

- PM
- 프로젝트 설계
- 요구사항 정의
- 아키텍처 검토
- 코드 리뷰
- 로드맵 관리

Claude

- 기능 구현
- 리팩토링
- 버그 수정
- 테스트

역할을 명확히 분리하여 개발합니다.

---

# Long-term Goal

LinguaLog는

영어를 AI로 분석하는 서비스가 아니라,

사용자의 영어 성장 데이터를 축적하고

시각화하는 플랫폼을 목표로 합니다.

모든 기능은

향후

- Dashboard
- Growth Report
- Mobile App
- Cloud Sync

에서 재사용될 수 있도록 설계합니다.