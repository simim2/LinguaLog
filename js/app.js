/**
 * app.js
 * -----------------------------------------------------------------------
 * 앱의 진입점(entry point). 다음을 담당합니다.
 *   1. 화면(Home/History/Dashboard) 전환
 *   2. 다크모드 / 폰트 크기 / AI 설정(Provider·Model·API Key) 적용 및 저장
 *   3. Home 화면의 입력창 실시간 카운트 + 권장 길이(500단어) 안내
 *   4. 저장(업서트)/삭제/New Entry 버튼 (EntryStorage와 실제 연결됨)
 *   5. "AI 분석" 버튼 → AnalysisAPI.analyzeJournal()만 호출 (fetch/파싱은 api.js 내부)
 *
 * Phase 3.5: "하루 = Entry 1개" 가정을 제거했습니다. Home은 더 이상 날짜로
 * Entry를 찾지 않고, 클로저 변수 currentEntryId(현재 작성창에 로드된 Entry의
 * ID, 없으면 null)로 상태를 관리합니다.
 *   - currentEntryId가 null일 때 저장 → 새 Entry 생성, 성공 시 그 ID를 로드
 *   - currentEntryId가 있을 때 저장 → 해당 Entry를 수정(업서트)
 *   - "New Entry" 버튼 → textarea 비우기 + currentEntryId = null (새 글 시작)
 * 페이지를 새로고침하면 항상 빈 작성창으로 시작합니다(특정 날짜를 자동으로
 * 불러오지 않음). 여러 Entry를 확인/수정하려면 History를 사용합니다.
 *
 * 이벤트는 가능한 한 상위 컨테이너에 위임(event delegation)하여 등록하고,
 * 전역 변수는 이 모듈의 클로저 안에만 존재하도록 최소화했습니다.
 * -----------------------------------------------------------------------
 */

const App = (() => {
  /** 현재 활성화된 뷰 이름 ('home' | 'history' | 'dashboard') */
  let currentView = 'home';

  /** AI 분석 중 중복 클릭 방지 플래그 */
  let isAnalyzing = false;

  /**
   * Home 작성창에 현재 로드되어 있는 Entry의 ID. null이면 "아직 저장되지
   * 않은 새 글"을 작성 중이라는 뜻이다 (Phase 3.5의 핵심 상태 변수).
   */
  let currentEntryId = null;

  // ---------------------------------------------------------------------
  // 상단 날짜 표시
  // ---------------------------------------------------------------------
  function renderTopbarDate() {
    Utils.qs('#topbar-date').textContent = Utils.formatDisplayDate(new Date());
  }

  // ---------------------------------------------------------------------
  // 뷰 전환
  // ---------------------------------------------------------------------
  function switchView(viewName) {
    if (viewName === currentView) return;
    currentView = viewName;

    Utils.qsa('.view').forEach((el) => {
      el.classList.toggle('is-active', el.dataset.viewPanel === viewName);
    });
    Utils.qsa('.nav-tab').forEach((tab) => {
      tab.classList.toggle('is-active', tab.dataset.view === viewName);
    });

    // 뷰가 화면에 보일 때 필요한 데이터를 다시 그려준다 (지연 렌더링)
    if (viewName === 'history') HistoryView.init();
    if (viewName === 'dashboard') DashboardView.init();
  }

  function bindNav() {
    Utils.qs('#main-nav').addEventListener('click', (e) => {
      const btn = e.target.closest('.nav-tab');
      if (!btn) return;
      switchView(btn.dataset.view);
    });
  }

  // ---------------------------------------------------------------------
  // 다크모드
  // ---------------------------------------------------------------------
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  function bindThemeToggle() {
    Utils.qs('#theme-toggle-btn').addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      SettingsStorage.save({ theme: next });
    });
  }

  // ---------------------------------------------------------------------
  // 설정 모달 (폰트 크기 + AI 설정)
  // ---------------------------------------------------------------------
  function applyFontSize(size) {
    document.documentElement.setAttribute('data-font-size', size);
    Utils.qsa('.segmented__option').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.fontSize === size);
    });
  }

  /** Provider select 옵션을 CONFIG.AI_PROVIDERS 기준으로 채운다 */
  function populateProviderSelect(selectedProvider) {
    const select = Utils.qs('#ai-provider-select');
    select.innerHTML = Object.entries(CONFIG.AI_PROVIDERS)
      .map(([key, cfg]) => `<option value="${key}">${Utils.escapeHtml(cfg.label)}</option>`)
      .join('');
    select.value = selectedProvider;
  }

  /** Model select 옵션을 선택된 provider 기준으로 채운다 */
  function populateModelSelect(providerKey, selectedModel) {
    const select = Utils.qs('#ai-model-select');
    const providerConfig = CONFIG.AI_PROVIDERS[providerKey];
    select.innerHTML = providerConfig.models
      .map((model) => `<option value="${model}">${model}</option>`)
      .join('');
    select.value = selectedModel || providerConfig.defaultModel;
  }

  function bindSettingsModal() {
    const modal = Utils.qs('#settings-modal');
    let pendingFontSize = SettingsStorage.get().fontSize;

    Utils.qs('#settings-btn').addEventListener('click', () => {
      pendingFontSize = SettingsStorage.get().fontSize;
      applyFontSize(pendingFontSize);

      const aiSettings = AISettingsStorage.get();
      populateProviderSelect(aiSettings.provider);
      populateModelSelect(aiSettings.provider, aiSettings.model);
      Utils.qs('#ai-api-key-input').value = aiSettings.apiKey;

      modal.classList.add('is-open');
    });

    Utils.qs('#settings-close-btn').addEventListener('click', () => modal.classList.remove('is-open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('is-open');
    });

    Utils.qs('#font-size-group').addEventListener('click', (e) => {
      const btn = e.target.closest('.segmented__option');
      if (!btn) return;
      pendingFontSize = btn.dataset.fontSize;
      applyFontSize(pendingFontSize);
    });

    // Provider가 바뀌면 그 Provider의 모델 목록으로 다시 채운다
    Utils.qs('#ai-provider-select').addEventListener('change', (e) => {
      populateModelSelect(e.target.value);
    });

    // API Key 보기/숨기기 토글
    Utils.qs('#toggle-api-key-visibility').addEventListener('click', () => {
      const input = Utils.qs('#ai-api-key-input');
      input.type = input.type === 'password' ? 'text' : 'password';
    });

    Utils.qs('#settings-save-btn').addEventListener('click', () => {
      SettingsStorage.save({ fontSize: pendingFontSize });
      AISettingsStorage.save({
        provider: Utils.qs('#ai-provider-select').value,
        model: Utils.qs('#ai-model-select').value,
        apiKey: Utils.qs('#ai-api-key-input').value.trim(),
      });
      modal.classList.remove('is-open');
      Utils.showToast('설정이 저장되었습니다.');
    });
  }

  // ---------------------------------------------------------------------
  // Home : 입력창 실시간 통계 + 목표 진행률
  // ---------------------------------------------------------------------
  function updateLiveStats() {
    const text = Utils.qs('#journal-textarea').value;
    const words = Utils.countWords(text);
    const sentences = Utils.countSentences(text);
    const max = CONFIG.RECOMMENDED_MAX_WORDS;

    Utils.qs('#live-word-count').textContent = `${words} words`;
    Utils.qs('#live-sentence-count').textContent = `${sentences} sentences`;
    Utils.qs('#goal-progress-label').textContent = `${words} / ${max} words`;

    // 진행바는 100%에서 멈추지만, 500단어를 넘겨도 입력 자체는 절대 막지 않는다.
    const progress = Utils.clamp((words / max) * 100, 0, 100);
    Utils.qs('#goal-bar-fill').style.width = `${progress}%`;
    Utils.qs('#word-count-warning').hidden = words <= max;

    // 미리보기 카드 동기화
    const preview = Utils.qs('#preview-body');
    preview.innerHTML = text.trim()
      ? Utils.escapeHtml(text)
      : `<p class="empty-state">아직 작성한 내용이 없습니다. 위 입력창에 영어 일기를 적어보세요.</p>`;
  }

  function bindJournalTextarea() {
    const textarea = Utils.qs('#journal-textarea');
    textarea.addEventListener('input', updateLiveStats);
    // TODO: debounce된 DraftStorage.save 호출로 자동저장 연결 (다음 단계)
  }

  /** Home 작성창을 완전히 비우고 "새 글 작성" 상태(currentEntryId = null)로 되돌린다 */
  function resetComposer() {
    currentEntryId = null;
    Utils.qs('#journal-textarea').value = '';
    updateLiveStats();
    renderAnalysisResult(null);
  }

  /** entry를 Home 작성창에 로드한다 (저장 직후 currentEntryId를 갱신할 때 사용) */
  function loadEntryIntoComposer(entry) {
    currentEntryId = entry.id;
    Utils.qs('#journal-textarea').value = entry.content;
    updateLiveStats();
    renderAnalysisResult(entry.analysis);
  }

  // ---------------------------------------------------------------------
  // Home : 저장(업서트) / 삭제 / New Entry 버튼 (EntryStorage 실제 연결)
  // ---------------------------------------------------------------------
  function bindJournalActions() {
    // 저장: currentEntryId가 없으면 새로 생성, 있으면 그 Entry를 업데이트한다.
    // 별도의 "수정" 버튼 없이 저장 버튼 하나가 상태에 따라 알아서 처리한다.
    Utils.qs('#save-btn').addEventListener('click', () => {
      const text = Utils.qs('#journal-textarea').value.trim();
      if (!text) {
        Utils.showToast('내용을 입력한 뒤 저장해주세요.', 'error');
        return;
      }

      if (currentEntryId) {
        EntryStorage.update(currentEntryId, { content: text });
        loadEntryIntoComposer(EntryStorage.getById(currentEntryId));
        Utils.showToast('수정되었습니다.');
      } else {
        const created = EntryStorage.create({ date: Utils.getTodayISODate(), content: text });
        loadEntryIntoComposer(created);
        Utils.showToast('저장되었습니다.');
      }
    });

    Utils.qs('#delete-btn').addEventListener('click', () => {
      if (!currentEntryId) {
        Utils.showToast('삭제할 내용이 없습니다.', 'error');
        return;
      }
      Utils.openConfirmModal({
        title: '정말 삭제하시겠습니까?',
        message: '삭제한 일기는 복구할 수 없습니다.',
        confirmLabel: '삭제',
        onConfirm: () => {
          EntryStorage.remove(currentEntryId);
          resetComposer();
          Utils.showToast('삭제되었습니다.');
        },
      });
    });

    // New Entry: 현재 작성 중인 내용을 비우고 currentEntryId를 초기화해
    // 완전히 새로운 일기를 시작할 수 있게 한다.
    Utils.qs('#new-entry-btn').addEventListener('click', () => {
      const textarea = Utils.qs('#journal-textarea');
      if (!textarea.value.trim() && !currentEntryId) return; // 이미 빈 상태면 아무것도 안 함

      Utils.openConfirmModal({
        title: '새 일기를 시작할까요?',
        message: currentEntryId ? '작성창의 내용이 비워집니다 (저장된 내용은 유지됩니다).' : '작성 중인 내용이 모두 지워집니다.',
        confirmLabel: 'New Entry',
        onConfirm: () => {
          resetComposer();
          Utils.showToast('새 일기를 시작합니다.');
        },
      });
    });
  }

  // ---------------------------------------------------------------------
  // Home : AI 분석 결과 표시
  // ---------------------------------------------------------------------
  function renderAnalysisResult(analysis) {
    const card = Utils.qs('#analysis-result-card');
    if (!analysis) {
      card.hidden = true;
      return;
    }
    Utils.qs('#analysis-result-body').innerHTML = Utils.renderAnalysisDetails(analysis);
    card.hidden = false;
  }

  /**
   * AI 분석 API 에러 코드 → 사용자 친화적 메시지 매핑.
   * api.js가 던지는 AnalysisError.code만 보고 판단하며, 내부 구현(fetch 등)에는
   * 관여하지 않는다.
   */
  const ANALYSIS_ERROR_MESSAGES = {
    NO_API_KEY: 'Gemini API Key가 설정되어 있지 않습니다. 설정에서 먼저 입력해주세요.',
    AUTH_FAILED: 'API Key가 올바르지 않습니다. 설정에서 다시 확인해주세요.',
    RATE_LIMIT: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
    TIMEOUT: '분석 요청이 시간 초과되었습니다. 다시 시도해주세요.',
    INVALID_RESPONSE: 'AI 분석 결과를 처리하지 못했습니다. 다시 시도해주세요.',
  };

  function setAnalyzeButtonLoading(loading) {
    const btn = Utils.qs('#analyze-btn');
    const spinner = Utils.qs('#analyze-spinner');
    const label = Utils.qs('#analyze-btn-label');
    btn.disabled = loading;
    spinner.hidden = !loading;
    label.textContent = loading ? 'Analyzing...' : 'AI 분석';
  }

  function bindAnalyzeButton() {
    Utils.qs('#analyze-btn').addEventListener('click', async () => {
      if (isAnalyzing) return; // 중복 클릭 방지

      if (!currentEntryId) {
        Utils.showToast('먼저 저장해주세요. 저장된 일기만 분석할 수 있습니다.', 'error');
        return;
      }
      const existing = EntryStorage.getById(currentEntryId);
      if (!existing) {
        Utils.showToast('먼저 저장해주세요. 저장된 일기만 분석할 수 있습니다.', 'error');
        return;
      }

      isAnalyzing = true;
      setAnalyzeButtonLoading(true);

      try {
        const analysis = await AnalysisAPI.analyzeJournal(existing);
        EntryStorage.saveAnalysis(existing.id, analysis);
        renderAnalysisResult(analysis);
        Utils.showToast('AI 분석이 완료되었습니다.');
      } catch (err) {
        const message = ANALYSIS_ERROR_MESSAGES[err.code] || 'AI 분석 중 오류가 발생했습니다.';
        Utils.showToast(message, 'error');
      } finally {
        isAnalyzing = false;
        setAnalyzeButtonLoading(false);
      }
    });
  }

  // ---------------------------------------------------------------------
  // 초기화
  // ---------------------------------------------------------------------
  function init() {
    const settings = SettingsStorage.get();
    applyTheme(settings.theme);
    applyFontSize(settings.fontSize);

    renderTopbarDate();
    bindNav();
    bindThemeToggle();
    bindSettingsModal();
    bindJournalTextarea();
    bindJournalActions();
    bindAnalyzeButton();
    resetComposer(); // Phase 3.5: 항상 빈 작성창으로 시작 (날짜 기반 자동 로드 없음)
  }

  return { init, switchView };
})();

document.addEventListener('DOMContentLoaded', App.init);
