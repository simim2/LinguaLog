/**
 * app.js
 * -----------------------------------------------------------------------
 * 앱의 진입점(entry point). 다음을 담당합니다.
 *   1. 화면(Home/History/Dashboard) 전환
 *   2. 다크모드 / 폰트 크기 / AI 설정(Provider·Model·API Key) 적용 및 저장
 *   3. Home 화면의 입력창 실시간 카운트 + 목표 진행률 표시
 *   4. 저장/수정/삭제/초기화 버튼 (EntryStorage와 실제 연결됨)
 *   5. "AI 분석" 버튼 → AnalysisAPI.analyzeJournal()만 호출 (fetch/파싱은 api.js 내부)
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

    Utils.qs('#live-word-count').textContent = `${words} words`;
    Utils.qs('#live-sentence-count').textContent = `${sentences} sentences`;
    Utils.qs('#goal-progress-label').textContent = `${words} / ${CONFIG.DAILY_GOAL_WORDS} words`;

    const progress = Utils.clamp((words / CONFIG.DAILY_GOAL_WORDS) * 100, 0, 100);
    Utils.qs('#goal-bar-fill').style.width = `${progress}%`;

    // 미리보기 카드 동기화
    const preview = Utils.qs('#preview-body');
    preview.innerHTML = text.trim()
      ? Utils.escapeHtml(text)
      : `<p class="empty-state">아직 작성한 내용이 없습니다. 위 입력창에 오늘의 영어 일기를 적어보세요.</p>`;
  }

  function bindJournalTextarea() {
    const textarea = Utils.qs('#journal-textarea');
    textarea.addEventListener('input', updateLiveStats);
    // TODO: debounce된 DraftStorage.save 호출로 자동저장 연결 (다음 단계)
  }

  /** 오늘 날짜의 저장된 entry를 불러와 textarea/미리보기/분석 결과를 채운다 */
  function loadTodayEntry() {
    const todayEntry = EntryStorage.getByDate(Utils.getTodayISODate());
    Utils.qs('#journal-textarea').value = todayEntry ? todayEntry.content : '';
    updateLiveStats();
    renderAnalysisResult(todayEntry ? todayEntry.analysis : null);
    return todayEntry;
  }

  // ---------------------------------------------------------------------
  // Home : 저장 / 수정 / 삭제 / 초기화 버튼 (EntryStorage 실제 연결)
  // ---------------------------------------------------------------------
  function bindJournalActions() {
    Utils.qs('#save-btn').addEventListener('click', () => {
      const text = Utils.qs('#journal-textarea').value.trim();
      if (!text) {
        Utils.showToast('내용을 입력한 뒤 저장해주세요.', 'error');
        return;
      }

      const today = Utils.getTodayISODate();
      const existing = EntryStorage.getByDate(today);
      if (existing) {
        Utils.showToast('오늘 일기는 이미 저장되어 있습니다. "수정" 버튼을 사용해주세요.', 'error');
        return;
      }

      EntryStorage.create({ date: today, content: text });
      loadTodayEntry();
      Utils.showToast('저장되었습니다.');
    });

    Utils.qs('#edit-btn').addEventListener('click', () => {
      const today = Utils.getTodayISODate();
      const existing = EntryStorage.getByDate(today);
      if (!existing) {
        Utils.showToast('먼저 저장해주세요.', 'error');
        return;
      }
      const text = Utils.qs('#journal-textarea').value.trim();
      if (!text) {
        Utils.showToast('내용을 입력해주세요.', 'error');
        return;
      }
      EntryStorage.update(existing.id, { content: text });
      loadTodayEntry();
      Utils.showToast('수정되었습니다.');
    });

    Utils.qs('#delete-btn').addEventListener('click', () => {
      const today = Utils.getTodayISODate();
      const existing = EntryStorage.getByDate(today);
      if (!existing) {
        Utils.showToast('삭제할 내용이 없습니다.', 'error');
        return;
      }
      Utils.openConfirmModal({
        title: '정말 삭제하시겠습니까?',
        message: '삭제한 일기는 복구할 수 없습니다.',
        confirmLabel: '삭제',
        onConfirm: () => {
          EntryStorage.remove(existing.id);
          Utils.qs('#journal-textarea').value = '';
          loadTodayEntry();
          Utils.showToast('삭제되었습니다.');
        },
      });
    });

    Utils.qs('#reset-btn').addEventListener('click', () => {
      const textarea = Utils.qs('#journal-textarea');
      if (!textarea.value.trim()) return;
      Utils.openConfirmModal({
        title: '입력 내용을 초기화할까요?',
        message: '작성 중인 내용이 모두 지워집니다.',
        confirmLabel: '초기화',
        onConfirm: () => {
          textarea.value = '';
          updateLiveStats();
          Utils.showToast('초기화되었습니다.');
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

      const today = Utils.getTodayISODate();
      const existing = EntryStorage.getByDate(today);
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
    loadTodayEntry();
  }

  return { init, switchView };
})();

document.addEventListener('DOMContentLoaded', App.init);
