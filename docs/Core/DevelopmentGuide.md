# Development Guide

## LinguaLog Development Guide

**Version:** 1.0

---

# 1. Purpose

이 문서는 LinguaLog 프로젝트의 개발 원칙과 구현 규칙을 정의합니다.

모든 새로운 기능은 이 문서를 기준으로 설계하고 구현합니다.

목표는 다음과 같습니다.

* 유지보수성이 높은 코드
* 확장 가능한 구조
* 일관된 개발 방식
* AI를 활용한 효율적인 개발

---

# 2. Development Workflow

새로운 기능은 반드시 아래 순서를 따릅니다.

```
Idea

↓

Requirements.md

↓

Design.md

↓

ImplementationPlan.md

↓

ClaudePrompt.md

↓

Claude 구현

↓

Code Review

↓

Git Commit

↓

CHANGELOG 업데이트
```

구현을 시작하기 전에 반드시 요구사항과 설계를 완료합니다.

---

# 3. Team Roles

## ChatGPT

역할

* Product Manager
* Solution Architect
* Technical Reviewer
* Documentation Manager

책임

* 요구사항 분석
* 프로젝트 설계
* Architecture 검토
* 코드 리뷰
* 개발 로드맵 관리
* Claude Prompt 작성

---

## Claude

역할

* Software Engineer

책임

* 기능 구현
* 리팩토링
* 버그 수정
* 테스트
* 구현 계획 제안

Claude는 구현을 담당하며, 프로젝트의 방향이나 요구사항은 문서를 기준으로 합니다.

---

# 4. Development Principles

## 4.1 Existing Structure First

가능하면 기존 구조를 유지합니다.

필요 이상의 리팩토링은 하지 않습니다.

새로운 기능은 기존 구조 위에 자연스럽게 확장합니다.

---

## 4.2 Minimal Changes

하나의 기능을 위해 프로젝트 전체를 변경하지 않습니다.

수정 범위를 최소화합니다.

---

## 4.3 Reusability

같은 기능이 두 번 이상 사용된다면 공통 함수로 분리합니다.

예시

* 날짜 포맷
* 시간 포맷
* 제목 생성
* 정렬
* Word Count

은 utils.js에서 관리합니다.

---

## 4.4 Separation of Concerns

UI는 화면만 담당합니다.

Business Logic은 기능을 담당합니다.

Storage는 저장만 담당합니다.

각 계층의 역할을 혼합하지 않습니다.

---

# 5. File Responsibilities

## app.js

화면 제어

사용자 이벤트

Navigation

---

## history.js

History 화면

Entry 목록

상세 보기

---

## dashboard.js

통계

차트

AI Insights

---

## api.js

AI Provider

API 호출

응답 처리

---

## prompt.js

Prompt 관리

JSON Schema 관리

---

## storage.js

LocalStorage 관리

CRUD

---

## utils.js

공통 함수

---

# 6. AI Development Rules

UI에서

절대로

fetch()를 직접 호출하지 않습니다.

반드시

```
AnalysisAPI.analyzeJournal(entry)
```

만 호출합니다.

AI Provider를 교체하더라도

UI는 변경되지 않아야 합니다.

---

# 7. Storage Rules

Storage는 반드시

EntryStorage

AISettingsStorage

등의 클래스를 통해 접근합니다.

LocalStorage를 직접 접근하지 않습니다.

---

# 8. Data Rules

Entry는 반드시 고유 ID를 가집니다.

날짜는 그룹핑 용도로만 사용합니다.

저장 여부를 날짜 기준으로 판단하지 않습니다.

모든 기능은 Entry ID를 기준으로 동작합니다.

---

# 9. UI Rules

사용자 경험(UX)을 최우선으로 고려합니다.

원칙

* 입력을 막지 않는다.
* 경고는 표시하지만 가능한 한 사용을 제한하지 않는다.
* AI 분석 실패가 데이터 손실로 이어져서는 안 된다.
* 저장은 항상 안전해야 한다.

---

# 10. AI Analysis Rules

AI 분석 결과는

반드시 구조화된 데이터(JSON)로 저장합니다.

예시

* CEFR
* Topic
* Feedback
* Conversation Type
* Keywords
* Grammar
* Vocabulary

분석 결과는 Dashboard와 Growth Report에서 재사용됩니다.

---

# 11. Prompt Rules

Prompt는 prompt.js에서만 관리합니다.

다른 파일에 Prompt를 작성하지 않습니다.

Prompt가 변경되면

ANALYSIS_VERSION도 함께 검토합니다.

---

# 12. Version Rules

Analysis 구조가 변경되면

ANALYSIS_VERSION을 증가시킵니다.

예시

```
1.0

↓

1.1

↓

1.2
```

구버전 데이터는 오류를 발생시키지 않고,

필요 시 재분석을 안내합니다.

---

# 13. Documentation Rules

새로운 기능은 반드시 문서를 먼저 작성합니다.

순서

1. Requirements
2. Design
3. ImplementationPlan
4. ClaudePrompt

문서가 승인된 후 구현을 시작합니다.

---

# 14. Git Rules

권장 Commit 형식

```
feat: add multiple journal entries

fix: resolve history sorting issue

refactor: simplify analysis renderer

docs: add architecture documentation
```

하나의 Commit에는 하나의 기능만 포함하는 것을 권장합니다.

---

# 15. Testing Checklist

구현 완료 후 반드시 확인합니다.

□ 저장

□ 수정

□ 삭제

□ AI 분석

□ History

□ Dashboard

□ Settings

□ 모바일 화면

□ 새로고침

□ LocalStorage 데이터

새로운 기능이 기존 기능을 깨뜨리지 않는지 확인합니다.

---

# 16. Future Development

새로운 기능을 추가할 때 항상 아래 질문을 확인합니다.

* ProjectVision과 일치하는가?
* Architecture를 유지하는가?
* Dashboard에서 활용 가능한 데이터인가?
* 모바일에서도 재사용 가능한가?
* 기존 구조를 크게 변경하지 않는가?

모든 질문에 "예"라고 답할 수 있을 때 구현을 진행합니다.

---

# 17. Long-term Goal

LinguaLog는 단순한 AI 영어 일기 서비스가 아니라,

사용자의 영어 성장 데이터를 기록하고 분석하는 플랫폼을 목표로 합니다.

모든 구현은 이 목표를 기준으로 판단합니다.

새로운 기능보다 지속 가능한 구조를 우선하며,

기능 하나를 추가할 때도 장기적인 확장성을 항상 고려합니다.
