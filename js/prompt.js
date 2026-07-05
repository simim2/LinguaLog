/**
 * prompt.js
 * -----------------------------------------------------------------------
 * AI 분석 요청에 사용할 시스템 프롬프트와 응답 스키마를 정의합니다.
 * api.js는 이 파일의 상수만 가져다 쓰고, 프롬프트 문구 자체를 직접 만들지
 * 않습니다. 프롬프트를 수정하고 싶으면 이 파일만 고치면 됩니다.
 *
 * ANALYSIS_VERSION은 config.js의 CONFIG.ANALYSIS_VERSION과 항상 동일한
 * 값을 참조합니다. 분석 로직(프롬프트/스키마)이 개정되면(예: "1.0" → "1.1")
 * 두 값을 함께 올리면 되고, 이미 저장된 entry.analysis.version과 비교해
 * 재분석 필요 여부를 판단하는 데 사용할 수 있습니다.
 *
 * Phase 2.0(MVP) 범위: CEFR / Topic / Feedback 세 항목만 분석합니다.
 * 감정/문법/추천표현/대화유형 등은 이후 버전에서 이 프롬프트와 스키마를
 * 확장하는 방식으로 추가될 예정입니다.
 * -----------------------------------------------------------------------
 */

/** 분석 로직 버전. config.js의 값과 항상 동일하게 유지된다. */
const ANALYSIS_VERSION = CONFIG.ANALYSIS_VERSION;

/**
 * 실제로 요청/검증에 사용하는 JSON 스키마 (MVP 범위).
 * validateResponse()가 이 키 목록을 기준으로 응답을 검사한다.
 * @type {{ cefr: string, topic: string, feedback: string }}
 */
const JSON_SCHEMA = {
  cefr: '',
  topic: '',
  feedback: '',
};

/**
 * OpenAI/Gemini 공통으로 사용할 시스템 프롬프트.
 * - JSON만 반환하도록 명시적으로 강제한다 (Markdown, 설명 문장 금지).
 * - JSON_SCHEMA를 문자열로 함께 삽입해 모델이 정확한 키 이름을 따르게 한다.
 */
const SYSTEM_PROMPT = `
You are an English writing coach analyzing a language learner's journal entry.

Analyze the journal entry below and output ONLY a single valid JSON object
that matches exactly this shape (no extra keys, no missing keys):

${JSON.stringify(JSON_SCHEMA, null, 2)}

Rules:
- "cefr": one of "A1", "A2", "B1", "B2", "C1", "C2" based on the writer's English level.
- "topic": a short phrase (max 6 words) summarizing what the entry is about.
- "feedback": 2-3 sentences of constructive, encouraging feedback in English.
- Output raw JSON only. Do NOT wrap it in Markdown code fences.
- Do NOT include any explanation, preamble, or text outside the JSON object.
`.trim();
