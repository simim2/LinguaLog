# Architecture

## LinguaLog System Architecture

**Version:** 1.0

---

# 1. Overview

LinguaLog는 AI를 이용하여 영어 일기를 분석하고, 그 결과를 장기적으로 축적하여 사용자의 영어 성장 과정을 시각화하는 웹 애플리케이션입니다.

프로젝트는 **모듈화(Modular Architecture)** 와 **확장성(Scalability)** 을 최우선으로 설계합니다.

현재는 LocalStorage 기반의 웹 애플리케이션이지만, 향후 Cloud Sync와 Flutter 모바일 앱으로 확장할 수 있도록 구조를 유지합니다.

---

# 2. Architecture Overview

```
┌────────────────────────────┐
│           UI Layer         │
│                            │
│ Home                       │
│ History                    │
│ Dashboard                  │
│ Settings                   │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│      Application Layer     │
│                            │
│ app.js                     │
│ dashboard.js               │
│ history.js                 │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│      Business Layer        │
│                            │
│ api.js                     │
│ prompt.js                  │
│ utils.js                   │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│      Storage Layer         │
│                            │
│ storage.js                 │
│ LocalStorage               │
└────────────────────────────┘
```

---

# 3. Layer Responsibilities

## UI Layer

사용자 인터페이스를 담당합니다.

포함 화면

* Home
* History
* Dashboard
* Settings

UI는 데이터를 보여주는 역할만 수행하며,

AI 호출이나 Storage 접근은 직접 수행하지 않습니다.

---

## Application Layer

사용자의 행동을 처리합니다.

예시

* 저장 버튼 클릭
* 삭제
* 수정
* AI 분석 실행
* Dashboard 갱신

Business Layer와 UI를 연결하는 역할입니다.

---

## Business Layer

프로젝트의 핵심 로직입니다.

### api.js

AI Provider와 통신합니다.

현재는 Gemini를 사용하지만,

향후

* OpenAI
* Self-hosted LLM
* Local AI

등으로 쉽게 교체할 수 있도록 Provider 구조를 유지합니다.

---

### prompt.js

AI Prompt를 관리합니다.

Prompt는 코드 내부에 흩어지지 않고

모든 Prompt를 한 곳에서 관리합니다.

---

### utils.js

공통 기능을 제공합니다.

예시

* 날짜 포맷
* 시간 포맷
* Word Count
* 제목 자동 생성
* 정렬

---

## Storage Layer

모든 데이터 저장을 담당합니다.

현재

```
Browser

↓

LocalStorage
```

향후

```
Browser

↓

Cloud API

↓

Database
```

로 변경되더라도

UI는 변경되지 않도록 설계합니다.

---

# 4. Data Flow

사용자가 일기를 저장하는 과정

```
User

↓

Home

↓

app.js

↓

EntryStorage.create()

↓

LocalStorage
```

---

AI 분석 과정

```
User

↓

Analyze Button

↓

AnalysisAPI.analyzeJournal()

↓

Prompt 생성

↓

Gemini API

↓

JSON 결과

↓

Entry.analysis 저장

↓

History

↓

Dashboard
```

Dashboard는

AI를 다시 호출하지 않고

저장된 analysis 데이터를 이용합니다.

---

# 5. Entry Structure

모든 영어 일기는 하나의 Entry로 저장됩니다.

```
Entry

id

title

content

createdAt

updatedAt

analysis
```

### id

고유 식별자

### title

자동 생성

첫 문장을 이용

### content

영어 일기 원문

### createdAt

생성 시간

### updatedAt

수정 시간

### analysis

AI 분석 결과

---

# 6. Analysis Structure

현재 구조

```
analysis

version

provider

model

cefr

topic

feedback

conversationTypes

keywords

grammar

vocabulary

analyzedAt
```

향후

다음 데이터가 추가될 수 있습니다.

* Emotion
* Writing Style
* Fluency
* Pronunciation Notes
* Writing Complexity

---

# 7. Storage Architecture

현재

```
LocalStorage

Entries

Settings

AI Settings
```

향후

```
Cloud

Users

Entries

Analysis

Statistics
```

로 확장 예정입니다.

Storage 접근은 반드시

```
EntryStorage
```

를 통해 수행합니다.

LocalStorage를 직접 접근하지 않습니다.

---

# 8. AI Architecture

UI는

절대로

fetch()

를 직접 호출하지 않습니다.

반드시

```
AnalysisAPI.analyzeJournal()
```

만 호출합니다.

AI Provider는

```
Provider

↓

Gemini

↓

(OpenAI)

↓

(Local LLM)
```

형태로 교체 가능하도록 설계합니다.

---

# 9. Dashboard Architecture

Dashboard는

새로운 AI 분석을 수행하지 않습니다.

이미 저장된

```
Entry.analysis
```

만 이용합니다.

이를 통해

* 빠른 로딩
* API 비용 절감
* 동일한 결과 유지

를 보장합니다.

---

# 10. Mobile Architecture

웹과 모바일는

동일한 데이터 구조를 사용합니다.

```
Flutter

↓

AnalysisAPI

↓

Cloud

↓

Entries

↓

Dashboard
```

웹에서 저장한 데이터는

향후 모바일에서도 그대로 사용할 수 있어야 합니다.

이를 위해

UI와 Storage를 최대한 분리합니다.

---

# 11. Design Principles

모든 기능은 다음 원칙을 따릅니다.

## Separation of Concerns

UI

↓

Business Logic

↓

Storage

역할을 명확히 분리합니다.

---

## Single Responsibility

각 파일은 하나의 책임만 가집니다.

예시

app.js

→ 화면 제어

api.js

→ AI 통신

storage.js

→ 데이터 저장

---

## Extensibility

새로운 기능을 추가할 때

기존 구조를 최대한 유지합니다.

---

## Reusability

공통 기능은 utils.js로 분리합니다.

중복 코드를 최소화합니다.

---

## Maintainability

프로젝트가 커져도

쉽게 수정할 수 있도록

모듈화를 유지합니다.

---

# 12. Future Architecture

향후 구조

```
Flutter App
        │
        ▼
 Cloud Backend
        │
        ▼
 Database
        │
        ▼
Analysis Service
        │
        ▼
Dashboard
```

웹과 모바일는 동일한 Entry 구조와 Analysis 구조를 공유합니다.

이 구조를 유지하는 것이 LinguaLog의 장기적인 아키텍처 목표입니다.
