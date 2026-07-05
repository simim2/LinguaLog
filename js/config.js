/**
 * config.js
 * -----------------------------------------------------------------------
 * 앱 전역에서 사용하는 상수와 설정값을 한 곳에 모아둔 파일입니다.
 * 다른 파일(storage.js, app.js, history.js, dashboard.js)은 이 파일의
 * 값을 참조하여 동작하므로, 저장 키 이름/기본값 등을 바꿀 때는
 * 이 파일만 수정하면 됩니다. (하드코딩 방지 → 유지보수성 확보)
 * -----------------------------------------------------------------------
 */

const CONFIG = Object.freeze({
  APP_NAME: 'English Journal AI',
  APP_TAGLINE: 'Write a little English, every day.',

  // ---------------------------------------------------------------------
  // LocalStorage Key 정의
  // 향후 IndexedDB / 서버 DB로 교체할 때도 storage.js 내부 구현만 바꾸면
  // 되도록, 키 이름은 이 한 곳에서만 관리합니다.
  // ---------------------------------------------------------------------
  STORAGE_KEYS: Object.freeze({
    ENTRIES: 'ejai_entries_v1',       // 저장된 일기 목록 (배열)
    DRAFT: 'ejai_draft_v1',           // 자동 저장용 임시 초안
    SETTINGS: 'ejai_settings_v1',     // 다크모드, 폰트 크기 등 사용자 설정
    AI_SETTINGS: 'ejai_ai_settings_v1', // AI Provider / Model / API Key (일반 설정과 분리 보관)
  }),

  // ---------------------------------------------------------------------
  // 사용자 설정 기본값
  // ---------------------------------------------------------------------
  DEFAULT_SETTINGS: Object.freeze({
    theme: 'light',        // 'light' | 'dark'
    fontSize: 'medium',    // 'small' | 'medium' | 'large'
  }),

  FONT_SIZE_MAP: Object.freeze({
    small: '14px',
    medium: '16px',
    large: '18px',
  }),

  // 일일 목표 단어 수 (Home 화면의 진행률 표시에 사용, Phase 2에서 연결)
  DAILY_GOAL_WORDS: 50,

  // ---------------------------------------------------------------------
  // AI 분석 관련 설정 - Phase 2.0에서 Gemini로 실제 연결됨
  // Provider를 하나 더 추가하려면 AI_PROVIDERS에 항목만 추가하면 되고,
  // api.js의 AIProviders 레지스트리에 동일한 key로 호출 함수를 등록하면 된다.
  // (UI/Settings 모달은 이 목록을 그대로 읽어 select 옵션을 그린다)
  // ---------------------------------------------------------------------
  DEFAULT_AI_PROVIDER: 'gemini',

  AI_PROVIDERS: Object.freeze({
    gemini: Object.freeze({
      label: 'Google Gemini',
      endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
      models: Object.freeze(['gemini-2.5-flash', 'gemini-2.5-pro']),
      defaultModel: 'gemini-2.5-flash',
    }),
    // TODO: openai, selfHosted 등을 추가할 때 동일한 형태(label/endpoint/models/defaultModel)로 정의
  }),

  ANALYSIS_VERSION: '1.0',    // JournalEntry.analysis.version 기본값. 분석 로직이
                              // 바뀌면 이 값을 올리고, 재분석 필요 여부는
                              // 저장된 entry.analysis.version과 비교해 판단합니다.
  MAX_TEXT_LENGTH: 3000,      // 분석 요청 시 허용할 최대 글자 수
  API_TIMEOUT: 30000,         // 분석 API 타임아웃 (ms)

  // ---------------------------------------------------------------------
  // 향후 확장 기능 플래그
  // 아직 구현되지 않은 기능은 false로 두고 UI에 "Coming Soon" 배지로 표시합니다.
  // 실제 구현 시 true로 바꾸고 관련 로직을 연결하면 됩니다.
  // ---------------------------------------------------------------------
  FEATURES: Object.freeze({
    aiFeedback: false,        // AI 피드백
    aiExpressions: false,     // AI 추천 표현
    cefrAnalysis: false,      // CEFR 레벨 분석
    sentimentAnalysis: false, // 감정 분석
    grammarAnalysis: false,   // 문법 분석
    conversationType: false,  // 대화 유형 분석
    autoTag: false,           // 태그 자동 생성
    wordCloud: false,         // Word Cloud
    streak: false,            // 연속 작성일(Streak)
    vocabulary: false,        // 단어장
  }),

  // 대시보드 차트 색상 팔레트 (라이트/다크 공통으로 쓰기 좋은 톤)
  CHART_COLORS: Object.freeze({
    primary: '#4361EE',
    primarySoft: 'rgba(67, 97, 238, 0.15)',
    secondary: '#10B981',
    secondarySoft: 'rgba(16, 185, 129, 0.15)',
    grid: 'rgba(120, 128, 150, 0.15)',
  }),

  TOAST_DURATION_MS: 2600,
});
