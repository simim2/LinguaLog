/**
 * storage.js
 * -----------------------------------------------------------------------
 * 데이터 저장/조회를 담당하는 레이어입니다.
 * 지금은 LocalStorage로 구현하지만, 다른 파일들은 이 파일이 노출하는
 * 함수 이름(EntryStorage.getAll, EntryStorage.create 등)만 알고 있으면
 * 되도록 설계했습니다. 나중에 IndexedDB나 서버 API로 교체할 때도
 * 이 파일 내부 구현만 바꾸면 app.js / history.js / dashboard.js는
 * 수정할 필요가 없습니다.
 *
 * ── Phase 안내 ──────────────────────────────────────────────────────
 * Phase 2.0: EntryStorage CRUD를 실제로 구현했습니다 (AI 분석 결과를
 * 저장할 대상이 필요하기 때문). AISettingsStorage도 이번에 추가되어
 * Gemini API Key/Provider/Model을 별도 키로 관리합니다.
 * Phase 3.5: "하루 = Entry 1개" 가정을 제거했습니다. CRUD는 원래부터
 * Entry ID 기준으로 동작해서 구조 변경은 없었고, date 기반 단일 조회
 * (getByDate)만 배열을 반환하는 getAllByDate로 교체했습니다. title도
 * 이제 content로부터 자동 생성됩니다.
 *
 * 데이터 모델(JournalEntry, JournalAnalysis 등)의 JSDoc typedef는
 * js/types.js에 있습니다. 이 파일은 저장/조회 로직만 담당합니다.
 * -----------------------------------------------------------------------
 */

/** 공통 LocalStorage read/write 헬퍼 (내부 전용) */
const _LocalStore = {
  read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.error(`[storage] "${key}" 읽기 실패:`, err);
      return fallback;
    }
  },
  write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error(`[storage] "${key}" 쓰기 실패:`, err);
      return false;
    }
  },
};

/**
 * 사용자 설정(다크모드, 폰트 크기) 저장소.
 */
const SettingsStorage = {
  get() {
    return {
      ...CONFIG.DEFAULT_SETTINGS,
      ..._LocalStore.read(CONFIG.STORAGE_KEYS.SETTINGS, {}),
    };
  },
  save(partialSettings) {
    const merged = { ...this.get(), ...partialSettings };
    _LocalStore.write(CONFIG.STORAGE_KEYS.SETTINGS, merged);
    return merged;
  },
};

/**
 * AI 분석 연결 설정(Provider/Model/API Key) 저장소.
 * 일반 사용자 설정(SettingsStorage)과 분리하여, 향후 계정 시스템이
 * 생기면 이 값만 서버 저장으로 옮기기 쉽도록 했다.
 * @returns {AISettings}
 */
const AISettingsStorage = {
  get() {
    const defaults = {
      provider: CONFIG.DEFAULT_AI_PROVIDER,
      model: CONFIG.AI_PROVIDERS[CONFIG.DEFAULT_AI_PROVIDER].defaultModel,
      apiKey: '',
    };
    return { ...defaults, ..._LocalStore.read(CONFIG.STORAGE_KEYS.AI_SETTINGS, {}) };
  },
  save(partialSettings) {
    const merged = { ...this.get(), ...partialSettings };
    _LocalStore.write(CONFIG.STORAGE_KEYS.AI_SETTINGS, merged);
    return merged;
  },
};

/**
 * 구버전 데이터 마이그레이션.
 * analysis/tags 필드가 없는 구버전 entry도 오류 없이 쓸 수 있도록,
 * 읽어올 때 항상 이 함수를 거쳐 최신 형태로 맞춰준다.
 * @param {Object} entry
 * @returns {JournalEntry}
 */
function migrateEntry(entry) {
  if (!entry) return entry;
  return {
    tags: [],
    analysis: null,
    ...entry,
  };
}

/**
 * 일기 항목 저장소. LocalStorage 배열을 CRUD로 조작한다.
 */
const EntryStorage = {
  /** 전체 일기 목록 반환 (정렬은 호출부에서 Utils.sortByDate로 처리) */
  getAll() {
    const raw = _LocalStore.read(CONFIG.STORAGE_KEYS.ENTRIES, []);
    // 구버전 데이터도 오류 없이 쓸 수 있도록 읽을 때마다 마이그레이션을 통과시킨다.
    return raw.map(migrateEntry);
  },

  /** id로 단일 일기 조회 */
  getById(id) {
    return this.getAll().find((entry) => entry.id === id) || null;
  },

  /**
   * date(YYYY-MM-DD)에 해당하는 모든 Entry를 반환한다 (Phase 3.5부터 하루에
   * 여러 개가 있을 수 있음). 정렬은 호출부에서 Utils.sortByCreatedAt으로 처리한다.
   * @param {string} date
   * @returns {JournalEntry[]}
   */
  getAllByDate(date) {
    return this.getAll().filter((entry) => entry.date === date);
  },

  /**
   * 새 일기 생성. wordCount/sentenceCount/title은 content로부터 자동
   * 계산되며, analysis는 항상 null로 시작한다 (AI 분석은 저장 후 별도 요청).
   * 같은 날짜에 이미 다른 Entry가 있어도 절대 덮어쓰지 않고 새로 추가된다.
   * @param {{ date: string, content: string }} entryData
   * @returns {JournalEntry}
   */
  create(entryData) {
    const now = new Date().toISOString();
    const entry = {
      id: Utils.generateId(),
      date: entryData.date,
      title: Utils.generateTitle(entryData.content),
      content: entryData.content,
      wordCount: Utils.countWords(entryData.content),
      sentenceCount: Utils.countSentences(entryData.content),
      tags: [],
      analysis: null,
      createdAt: now,
      updatedAt: now,
    };

    const all = this.getAll();
    all.push(entry);
    _LocalStore.write(CONFIG.STORAGE_KEYS.ENTRIES, all);
    return entry;
  },

  /**
   * 기존 일기 수정. content가 바뀌면 wordCount/sentenceCount/title을 다시
   * 계산하고, 기존 analysis는 더 이상 최신 본문을 반영하지 못하므로 null로
   * 초기화한다 (재분석이 필요하다는 신호). Entry ID로만 대상을 찾으므로
   * 같은 날짜에 다른 Entry가 몇 개 있든 영향을 주지 않는다.
   * @param {string} id
   * @param {{ content?: string }} updates
   * @returns {JournalEntry|null}
   */
  update(id, updates) {
    const all = this.getAll();
    const index = all.findIndex((entry) => entry.id === id);
    if (index === -1) return null;

    const existing = all[index];
    const contentChanged = typeof updates.content === 'string' && updates.content !== existing.content;

    const updated = {
      ...existing,
      ...updates,
      title: contentChanged ? Utils.generateTitle(updates.content) : existing.title,
      wordCount: contentChanged ? Utils.countWords(updates.content) : existing.wordCount,
      sentenceCount: contentChanged ? Utils.countSentences(updates.content) : existing.sentenceCount,
      analysis: contentChanged ? null : existing.analysis,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    _LocalStore.write(CONFIG.STORAGE_KEYS.ENTRIES, all);
    return updated;
  },

  /**
   * entry.analysis만 갱신한다 (AI 분석 완료 후 호출).
   * @param {string} id
   * @param {JournalAnalysis} analysisResult
   * @returns {JournalEntry|null}
   */
  saveAnalysis(id, analysisResult) {
    const all = this.getAll();
    const index = all.findIndex((entry) => entry.id === id);
    if (index === -1) return null;

    all[index] = { ...all[index], analysis: analysisResult };
    _LocalStore.write(CONFIG.STORAGE_KEYS.ENTRIES, all);
    return all[index];
  },

  /** 일기 삭제 */
  remove(id) {
    const all = this.getAll();
    const filtered = all.filter((entry) => entry.id !== id);
    if (filtered.length === all.length) return false; // 삭제할 대상이 없었음
    _LocalStore.write(CONFIG.STORAGE_KEYS.ENTRIES, filtered);
    return true;
  },

  /** 전체 데이터 삭제 (설정 초기화 등에서 사용 가능하도록 자리 유지) */
  clearAll() {
    return _LocalStore.write(CONFIG.STORAGE_KEYS.ENTRIES, []);
  },
};

/**
 * 입력 중 임시 자동저장(초안) 저장소.
 * 새로고침해도 작성 중이던 글이 복구되도록 하는 용도 (다음 단계에서 연결 예정).
 */
const DraftStorage = {
  // TODO: 입력창 debounce와 연결하여 실제 자동저장 구현
  get() {
    return _LocalStore.read(CONFIG.STORAGE_KEYS.DRAFT, null);
  },
  // TODO
  save(content) {
    console.warn('[DraftStorage.save] 아직 구현되지 않았습니다.');
    return false;
  },
  // TODO
  clear() {
    console.warn('[DraftStorage.clear] 아직 구현되지 않았습니다.');
    return false;
  },
};
