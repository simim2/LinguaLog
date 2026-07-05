/**
 * api.js
 * -----------------------------------------------------------------------
 * AI 분석 기능의 유일한 진입점입니다. UI(app.js 등)는 절대 fetch를 직접
 * 호출하지 않고, 오직 아래 함수만 사용합니다.
 *
 *     const analysis = await AnalysisAPI.analyzeJournal(entry);
 *
 * 내부 흐름:
 *   UI → analyzeJournal(entry)
 *          → AISettingsStorage에서 provider/model/apiKey 조회
 *          → AIProviders[provider].call(...)  (현재는 gemini만 등록)
 *          → validateResponse(rawJsonText)
 *          → parseAnalysis(validated, meta)  → JournalAnalysis 반환
 *
 * 향후 OpenAI, 자체 서버 API로 바꾸더라도:
 *   1) AIProviders에 새 provider 함수를 추가하고
 *   2) config.js의 AI_PROVIDERS에 항목을 추가하면
 * UI 코드는 한 줄도 수정할 필요가 없습니다.
 * -----------------------------------------------------------------------
 */

/**
 * AI 분석 중 발생하는 오류를 구분하기 위한 커스텀 에러.
 * app.js는 error.code만 보고 사용자에게 적절한 메시지를 보여준다.
 * code: 'NO_API_KEY' | 'AUTH_FAILED' | 'RATE_LIMIT' | 'NETWORK_ERROR' | 'TIMEOUT' | 'INVALID_RESPONSE'
 */
class AnalysisError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'AnalysisError';
    this.code = code;
  }
}

/**
 * Provider별 실제 호출 구현을 모아둔 레지스트리.
 * 각 provider는 { call(apiKey, model, userText) } 형태의 async 함수를 제공해야 하며,
 * 성공 시 "모델이 응답한 원본 텍스트(JSON 문자열이어야 함)"를 반환하고,
 * 실패 시 AnalysisError를 던진다.
 */
const AIProviders = (() => {
  /** Gemini generateContent REST API 호출 */
  async function callGemini(apiKey, model, userText) {
    const providerConfig = CONFIG.AI_PROVIDERS.gemini;
    const url = `${providerConfig.endpoint}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.API_TIMEOUT);

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: userText }] }],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new AnalysisError('TIMEOUT', '분석 요청이 시간 초과되었습니다. 잠시 후 다시 시도해주세요.');
      }
      // fetch 자체가 실패하는 경우 (오프라인, DNS 실패 등)
      throw new AnalysisError('NETWORK_ERROR', '네트워크 연결을 확인해주세요.');
    } finally {
      clearTimeout(timeoutId);
    }

    if (response.status === 401 || response.status === 403) {
      throw new AnalysisError('AUTH_FAILED', 'API Key가 올바르지 않거나 인증에 실패했습니다.');
    }
    if (response.status === 429) {
      throw new AnalysisError('RATE_LIMIT', '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
    }
    if (!response.ok) {
      throw new AnalysisError('INVALID_RESPONSE', `분석 서버 오류가 발생했습니다. (status ${response.status})`);
    }

    let data;
    try {
      data = await response.json();
    } catch (err) {
      throw new AnalysisError('INVALID_RESPONSE', 'AI 응답을 해석할 수 없습니다.');
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== 'string' || !text.trim()) {
      throw new AnalysisError('INVALID_RESPONSE', 'AI 응답이 비어있습니다.');
    }
    return text;
  }

  return {
    gemini: { call: callGemini },
    // TODO: openai: { call: callOpenAI }, selfHosted: { call: callSelfHosted } 등 향후 추가
  };
})();

const AnalysisAPI = (() => {
  /**
   * 일기 본문을 AI로 분석 요청한다.
   * @param {JournalEntry} entry - 분석할 일기 (entry.content 사용)
   * @returns {Promise<JournalAnalysis>}
   */
  async function analyzeJournal(entry) {
    const text = (entry?.content || '').trim();
    if (!text) {
      throw new AnalysisError('INVALID_RESPONSE', '분석할 내용이 없습니다.');
    }

    const aiSettings = AISettingsStorage.get();
    if (!aiSettings.apiKey) {
      throw new AnalysisError('NO_API_KEY', 'Gemini API Key가 설정되어 있지 않습니다. 설정에서 먼저 입력해주세요.');
    }

    const providerKey = aiSettings.provider || CONFIG.DEFAULT_AI_PROVIDER;
    const provider = AIProviders[providerKey];
    if (!provider) {
      throw new AnalysisError('INVALID_RESPONSE', `지원하지 않는 AI Provider입니다: ${providerKey}`);
    }

    const model = aiSettings.model || CONFIG.AI_PROVIDERS[providerKey].defaultModel;
    const truncatedText = text.slice(0, CONFIG.MAX_TEXT_LENGTH);

    const rawText = await provider.call(aiSettings.apiKey, model, truncatedText);
    const validated = validateResponse(rawText);
    return parseAnalysis(validated, { provider: providerKey, model });
  }

  /**
   * AI 응답 원본 텍스트가 JSON_SCHEMA와 일치하는지 검증한다.
   * @param {string} rawText - provider.call()이 반환한 원본 텍스트 (JSON 문자열 기대)
   * @returns {{ cefr: string, topic: string, feedback: string }}
   */
  function validateResponse(rawText) {
    let parsed;
    try {
      // 모델이 실수로 코드펜스(```json ... ```)를 붙였을 경우를 대비한 방어적 처리
      const cleaned = rawText.trim().replace(/^```json\s*|^```\s*|```$/g, '');
      parsed = JSON.parse(cleaned);
    } catch (err) {
      throw new AnalysisError('INVALID_RESPONSE', 'AI 응답이 올바른 JSON 형식이 아닙니다.');
    }

    const requiredKeys = Object.keys(JSON_SCHEMA);
    const missing = requiredKeys.filter((key) => typeof parsed[key] !== 'string');
    if (missing.length > 0) {
      throw new AnalysisError('INVALID_RESPONSE', `AI 응답에 필요한 항목이 없습니다: ${missing.join(', ')}`);
    }

    const validCefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (!validCefrLevels.includes(parsed.cefr)) {
      throw new AnalysisError('INVALID_RESPONSE', `CEFR 값이 올바르지 않습니다: ${parsed.cefr}`);
    }

    return { cefr: parsed.cefr, topic: parsed.topic, feedback: parsed.feedback };
  }

  /**
   * 검증된 응답 + 메타 정보를 최종 JournalAnalysis 객체로 변환한다.
   * @param {{ cefr: string, topic: string, feedback: string }} validated
   * @param {{ provider: string, model: string }} meta
   * @returns {JournalAnalysis}
   */
  function parseAnalysis(validated, meta) {
    return {
      version: CONFIG.ANALYSIS_VERSION,
      provider: meta.provider,
      model: meta.model,
      cefr: validated.cefr,
      topic: validated.topic,
      feedback: validated.feedback,
      analyzedAt: new Date().toISOString(),
    };
  }

  return { analyzeJournal, validateResponse, parseAnalysis };
})();
