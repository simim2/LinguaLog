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
 * version/provider/model/analyzedAt은 "이 분석 결과가 언제, 어떤 조합으로
 * 생성되었는지"를 기록하기 위한 메타데이터로, 향후 프롬프트가 개정되거나
 * Provider/Model이 바뀌었을 때 재분석(Re-analyze) 필요 여부를 판단하는
 * 근거로 사용한다 (예: 저장된 version이 CONFIG.ANALYSIS_VERSION보다 낮으면
 * "다시 분석하기"를 제안하는 식).
 *
 * Phase 2.0(MVP)에서는 cefr / topic / feedback 세 항목만 실제로 채워진다.
 * emotions, grammar, conversationTypes, keywords, reviewSentences,
 * recommendedExpressions 등은 향후 버전에서 추가될 필드로, 아직 분석기가
 * 채우지 않으므로 이 typedef에도 포함하지 않았다 (JSON_SCHEMA와 항상 1:1 대응).
 *
 * @typedef {Object} JournalAnalysis
 * @property {string} version    - 분석 로직 버전 (CONFIG.ANALYSIS_VERSION 참조)
 * @property {string} provider   - 분석에 사용된 AI Provider (예: "gemini")
 * @property {string} model      - 분석에 사용된 모델명 (예: "gemini-2.5-flash")
 * @property {string} cefr       - CEFR 레벨 (예: "B1")
 * @property {string} topic      - 일기의 주요 주제 한 줄 (예: "Weekend trip")
 * @property {string} feedback   - AI가 제공하는 2~3줄 피드백
 * @property {string} analyzedAt - 분석이 완료된 시각 (ISO datetime)
 */

/**
 * 문법 분석 세부 구조. 현재는 placeholder이며, 향후 실제 분석 결과가
 * 이 형태로 채워질 예정입니다. 필드 자체는 자유 형식(Object)에 가깝게
 * 열어두되, 대표적으로 예상되는 키를 문서화합니다.
 * @typedef {Object} GrammarAnalysis
 * @property {Array<{original: string, corrected: string, explanation: string}>} [errors]
 *           - 발견된 문법 오류와 교정 제안 목록
 * @property {number} [accuracyScore]      - 문법 정확도 점수 (0~100, 예상)
 */

/**
 * 대화/문체 유형 분석 구조. 예: 일기가 서술형인지, 대화형인지 등.
 * @typedef {Object} ConversationAnalysis
 * @property {string} [primaryType]        - 주요 유형 (예: "narrative", "dialogue")
 * @property {Object.<string, number>} [distribution] - 유형별 비율
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
