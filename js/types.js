/**
 * types.js
 * -----------------------------------------------------------------------
 * 프로젝트 전체에서 사용하는 데이터 구조(JSDoc typedef)를 한 곳에 모아둔
 * 파일입니다. 실행 코드는 없고 타입 문서만 존재합니다.
 *
 * 이 파일은 다른 js 파일보다 먼저 로드될 필요는 없지만(런타임 영향 없음),
 * 의존성 순서상 config.js 다음, utils.js 이전에 두어 "데이터 모델 → 유틸 →
 * 저장소 → 화면 로직" 순서로 읽히도록 배치했습니다.
 * -----------------------------------------------------------------------
 */

/**
 * 하나의 영어 일기 항목.
 * @typedef {Object} JournalEntry
 * @property {string} id              - 고유 ID (Utils.generateId()로 생성)
 * @property {string} date            - YYYY-MM-DD
 * @property {string} title           - 제목 (현재 UI에서는 미사용, 확장 대비)
 * @property {string} content         - 영어 일기 본문
 * @property {number} wordCount       - 저장 시점 자동 계산된 단어 수
 * @property {number} sentenceCount   - 저장 시점 자동 계산된 문장 수
 * @property {string[]} tags          - 태그 (Phase 1: 항상 빈 배열, 향후 자동 태그 생성 기능용)
 * @property {JournalAnalysis|null} analysis - AI 분석 결과. 분석 전에는 null.
 * @property {string} createdAt       - 최초 생성 시각 (ISO datetime)
 * @property {string} updatedAt       - 마지막 수정 시각 (ISO datetime)
 */

/**
 * OpenAI/Gemini 등 AI 분석 결과 구조.
 *
 * version/promptVersion/provider/model/analyzedAt은 "이 분석 결과가 언제,
 * 어떤 프롬프트·모델 조합으로 생성되었는지"를 기록하는 메타데이터다.
 * version은 analysis 스키마(어떤 필드가 존재하는지) 버전이고,
 * promptVersion은 같은 스키마 안에서 프롬프트 문구가 개정된 시점을 구분한다.
 * 예: 스키마는 그대로인데 프롬프트 문구만 다듬은 경우 version은 유지하고
 * promptVersion만 올린다. 향후 재분석(Re-analyze) 필요 여부는 이 두 값을
 * CONFIG.ANALYSIS_VERSION / CONFIG.PROMPT_VERSION과 비교해 판단한다.
 *
 * v1.0: cefr / topic / feedback
 * v1.1(현재): + conversationTypes / keywords / grammar / vocabulary
 * v1.0으로 저장된 기존 데이터는 새 필드가 없을 수 있으므로, 화면에서는
 * 항상 optional하게(값이 없으면 표시 생략) 다뤄야 한다.
 *
 * @typedef {Object} JournalAnalysis
 * @property {string} version         - 분석 스키마 버전 (CONFIG.ANALYSIS_VERSION 참조)
 * @property {string} promptVersion   - 프롬프트 문구 버전 (CONFIG.PROMPT_VERSION 참조)
 * @property {string} provider        - 분석에 사용된 AI Provider (예: "gemini")
 * @property {string} model           - 분석에 사용된 모델명 (예: "gemini-2.5-flash")
 * @property {string} cefr            - CEFR 레벨 (예: "B1")
 * @property {string} topic           - 일기의 주요 주제 한 줄 (예: "Weekend trip")
 * @property {string} feedback        - AI가 제공하는 2~3줄 피드백
 * @property {string[]} [conversationTypes] - 대화/글 유형 (복수 선택, CONVERSATION_TYPES 중에서)
 * @property {string[]} [keywords]    - 핵심 키워드 5~10개 (소문자로 정규화됨)
 * @property {GrammarAnalysis} [grammar]       - 문법 수준 요약
 * @property {VocabularyAnalysis} [vocabulary] - 어휘 수준 요약
 * @property {string} analyzedAt      - 분석이 완료된 시각 (ISO datetime)
 */

/**
 * 문법 수준 요약 (Phase 3.0). 상세 첨삭이 아니라 전반적인 수준 파악용.
 * @typedef {Object} GrammarAnalysis
 * @property {number} score   - 문법 정확도 점수, 1~5점 (5점 만점)
 * @property {string} summary - 한 줄 요약 (예: "Mostly correct grammar with occasional article mistakes.")
 */

/**
 * 어휘 수준 요약 (Phase 3.0).
 * @typedef {Object} VocabularyAnalysis
 * @property {string} level   - 어휘 수준 (예: "Beginner" | "Intermediate" | "Advanced")
 * @property {string} summary - 한 줄 요약 (예: "Good range of daily vocabulary.")
 */

/**
 * 사용자 설정.
 * @typedef {Object} Settings
 * @property {'light'|'dark'} theme
 * @property {'small'|'medium'|'large'} fontSize
 */

/**
 * AI 분석 연결 설정 (Settings 화면에서 입력). 일반 Settings와 분리 저장된다.
 * @typedef {Object} AISettings
 * @property {string} provider - CONFIG.AI_PROVIDERS의 key (예: "gemini")
 * @property {string} model    - 선택된 모델명
 * @property {string} apiKey   - 사용자가 입력한 API Key (LocalStorage 평문 저장, 개인용 MVP 한정)
 */
