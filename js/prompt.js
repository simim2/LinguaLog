/**
 * prompt.js
 * -----------------------------------------------------------------------
 * AI 분석 요청에 사용할 시스템 프롬프트와 응답 스키마를 정의합니다.
 * api.js는 이 파일의 상수만 가져다 쓰고, 프롬프트 문구 자체를 직접 만들지
 * 않습니다. 프롬프트를 수정하고 싶으면 이 파일만 고치면 됩니다.
 *
 * ANALYSIS_VERSION / PROMPT_VERSION은 config.js의 CONFIG 값을 그대로
 * 참조합니다. 스키마(어떤 필드가 있는지)가 바뀌면 ANALYSIS_VERSION을,
 * 프롬프트 문구만 다듬으면 PROMPT_VERSION만 올리면 됩니다.
 *
 * Phase 3.0 범위: CEFR / Topic / Feedback (v1.0) +
 * Conversation Type / Keywords / Grammar / Vocabulary (v1.1, 이번 추가분).
 * 감정 분석, 추천 표현, Word Cloud 등은 이후 버전에서 확장될 예정입니다.
 * -----------------------------------------------------------------------
 */

/** 분석 스키마 버전. config.js의 값과 항상 동일하게 유지된다. */
const ANALYSIS_VERSION = CONFIG.ANALYSIS_VERSION;

/** 프롬프트 문구 버전. config.js의 값과 항상 동일하게 유지된다. */
const PROMPT_VERSION = CONFIG.PROMPT_VERSION;

/**
 * Conversation Type으로 허용되는 값 목록.
 * 프롬프트 문구(모델에게 제시하는 선택지)와 api.js의 validateResponse()
 * (모델이 목록 밖의 값을 반환했을 때 걸러내는 검증) 양쪽에서 이 배열
 * 하나만 참조하도록 해서, 유형을 추가/변경할 때 이 파일만 고치면 된다.
 */
const CONVERSATION_TYPES = [
  'Daily Life',
  'Experience',
  'Opinion',
  'Future Plan',
  'Question',
  'Request',
  'Storytelling',
  'Reflection',
  'Learning',
  'Work',
  'Travel',
  'Hobby',
];

/**
 * 실제로 요청/검증에 사용하는 JSON 스키마 (v1.1).
 * validateResponse()가 이 키 목록을 기준으로 응답을 검사한다.
 */
const JSON_SCHEMA = {
  cefr: '',
  topic: '',
  feedback: '',
  conversationTypes: [],
  keywords: [],
  grammar: { score: 0, summary: '' },
  vocabulary: { level: '', summary: '' },
};

/**
 * Gemini(및 향후 다른 Provider)에 공통으로 사용할 시스템 프롬프트.
 * - JSON만 반환하도록 여러 번 명시적으로 강제한다 (Markdown, 설명 문장 금지).
 * - JSON_SCHEMA와 CONVERSATION_TYPES를 문자열로 함께 삽입해 모델이
 *   정확한 키 이름과 허용된 값만 쓰도록 유도한다.
 */
const SYSTEM_PROMPT = `
You are an English writing coach analyzing a language learner's journal entry.

Analyze the journal entry below and output ONLY a single valid JSON object
that matches exactly this shape (no extra keys, no missing keys):

${JSON.stringify(JSON_SCHEMA, null, 2)}

Field rules:
- "cefr": one of "A1", "A2", "B1", "B2", "C1", "C2" based on the writer's English level.
- "topic": a short phrase (max 6 words) summarizing what the entry is about.
- "feedback": 2-3 sentences of constructive, encouraging feedback in English.
- "conversationTypes": an array of one or more values, chosen ONLY from this list:
  ${JSON.stringify(CONVERSATION_TYPES)}
- "keywords": an array of 5 to 10 important keywords from the entry, all lowercase, no duplicates.
- "grammar.score": an integer from 1 to 5 (5 = excellent grammar).
- "grammar.summary": one short sentence describing the overall grammar level.
- "vocabulary.level": one of "Beginner", "Intermediate", "Advanced".
- "vocabulary.summary": one short sentence describing the vocabulary usage.

Output format rules (very important):
- Output raw JSON only. Do NOT wrap it in Markdown code fences (no \`\`\`).
- Do NOT include any explanation, preamble, greeting, or text outside the JSON object.
- The response must start with "{" and end with "}".
`.trim();
