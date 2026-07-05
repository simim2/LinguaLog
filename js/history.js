/**
 * history.js
 * -----------------------------------------------------------------------
 * History 화면(좌측 날짜 트리, 검색, 정렬, 우측 상세 패널)을 담당하는 모듈.
 *
 * Phase 2.0: EntryStorage가 실제 데이터를 반환하므로 트리/검색/정렬이
 * 실제로 동작한다. 상세 패널에서 수정/삭제도 이 화면 안에서 바로 처리한다
 * (Home은 "오늘 일기"만 다루므로, 과거 기록 수정은 History에서 인라인으로 한다).
 *
 * Analysis 영역은 Utils.renderAnalysisDetails()를 통해 Home과 동일한
 * 마크업을 공유한다 (CEFR/Topic/Feedback + Conversation Type/Keywords/
 * Grammar/Vocabulary). 새 분석 항목이 추가되면 그 함수만 확장하면 된다.
 * -----------------------------------------------------------------------
 */

const HistoryView = (() => {
  let selectedEntryId = null;
  let sortOrder = 'newest'; // 'newest' | 'oldest'
  let searchKeyword = '';
  let editingEntryId = null; // 현재 인라인 수정 중인 entry id (없으면 null)

  /** 검색어 + 정렬 조건을 적용한 목록 반환 */
  function getFilteredEntries() {
    const all = EntryStorage.getAll();
    const keyword = searchKeyword.trim().toLowerCase();

    const filtered = keyword
      ? all.filter((e) => {
          const haystack = `${e.content || ''} ${e.date} ${(e.tags || []).join(' ')}`.toLowerCase();
          return haystack.includes(keyword);
        })
      : all;

    return Utils.sortByDate(filtered, sortOrder === 'newest' ? 'desc' : 'asc');
  }

  /** 연/월/일 트리 구조로 그룹핑 */
  function groupByYearMonth(entries) {
    const tree = {};
    entries.forEach((entry) => {
      const { year, month } = Utils.splitISODate(entry.date);
      tree[year] = tree[year] || {};
      tree[year][month] = tree[year][month] || [];
      tree[year][month].push(entry);
    });
    return tree;
  }

  /** 좌측 날짜 트리 렌더 */
  function renderTree() {
    const container = Utils.qs('#history-tree');
    const entries = getFilteredEntries();

    if (entries.length === 0) {
      container.innerHTML = `<p class="empty-state empty-state--sidebar">${
        searchKeyword ? '검색 결과가 없습니다.' : '저장된 기록이 없습니다.'
      }</p>`;
      return;
    }

    const tree = groupByYearMonth(entries);
    let html = '';

    Object.keys(tree).sort((a, b) => (sortOrder === 'newest' ? b - a : a - b))
      .forEach((year) => {
        html += `<div class="history-tree__year">${year}</div>`;
        Object.keys(tree[year]).sort((a, b) => (sortOrder === 'newest' ? b - a : a - b))
          .forEach((month) => {
            html += `<div class="history-tree__month">${parseInt(month, 10)}월</div>`;
            tree[year][month].forEach((entry) => {
              const isSelected = entry.id === selectedEntryId ? 'is-selected' : '';
              html += `<button type="button" class="history-tree__day ${isSelected}" data-entry-id="${entry.id}">${entry.date}</button>`;
            });
          });
      });

    container.innerHTML = html;
  }

  /** 우측 상세 패널 렌더 (보기 모드 / 수정 모드 분기) */
  function renderDetail(entry) {
    const panel = Utils.qs('#history-detail');

    if (!entry) {
      panel.innerHTML = `
        <div class="empty-state empty-state--panel">
          <span class="empty-state__icon" aria-hidden="true">📖</span>
          <p>왼쪽에서 날짜를 선택하면<br />여기에서 일기 내용을 확인할 수 있어요.</p>
        </div>`;
      return;
    }

    const isEditing = editingEntryId === entry.id;

    panel.innerHTML = `
      <div class="card">
        <div class="journal-card__header">
          <div>
            <h2 class="card-title">${entry.date}</h2>
            <p class="card-subtitle">${entry.wordCount || 0} words · ${entry.sentenceCount || 0} sentences</p>
          </div>
        </div>
        ${isEditing ? '' : renderAnalysisSection(entry.analysis)}
        ${
          isEditing
            ? `<textarea class="journal-textarea" id="history-edit-textarea">${Utils.escapeHtml(entry.content || '')}</textarea>`
            : `<div class="preview-body">${Utils.escapeHtml(entry.content || '')}</div>`
        }
        <div class="journal-card__actions">
          ${
            isEditing
              ? `
                <button class="btn btn--primary" data-action="save-edit" data-entry-id="${entry.id}">저장</button>
                <button class="btn btn--ghost" data-action="cancel-edit" data-entry-id="${entry.id}">취소</button>
              `
              : `
                <button class="btn btn--secondary" data-action="edit-entry" data-entry-id="${entry.id}">수정</button>
                <button class="btn btn--danger-outline" data-action="delete-entry" data-entry-id="${entry.id}">삭제</button>
              `
          }
        </div>
      </div>`;
  }

  /**
   * Analysis 영역 렌더. 실제 필드 마크업은 Home과 공유하는
   * Utils.renderAnalysisDetails()에 위임하고, 이 함수는 "분석 없음" 상태와
   * 컨테이너만 담당한다.
   * @param {JournalAnalysis|null} analysis
   * @returns {string} HTML 문자열
   */
  function renderAnalysisSection(analysis) {
    if (!analysis) {
      return `
        <div class="analysis-section analysis-section--empty">
          <p class="empty-state">아직 AI 분석 결과가 없습니다. Home 화면에서 오늘 일기를 분석해보세요.</p>
        </div>`;
    }

    return `<div class="analysis-section">${Utils.renderAnalysisDetails(analysis)}</div>`;
  }

  /** 날짜 클릭 시 상세 표시 (이벤트 위임) */
  function handleTreeClick(e) {
    const dayBtn = e.target.closest('.history-tree__day');
    if (!dayBtn) return;

    editingEntryId = null;
    selectedEntryId = dayBtn.dataset.entryId;
    Utils.qsa('.history-tree__day').forEach((el) => el.classList.remove('is-selected'));
    dayBtn.classList.add('is-selected');

    const entry = EntryStorage.getById(selectedEntryId);
    renderDetail(entry);
  }

  /** 상세 패널 내 수정/삭제/저장/취소 버튼 처리 (이벤트 위임) */
  function handleDetailClick(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, entryId } = btn.dataset;

    if (action === 'edit-entry') {
      editingEntryId = entryId;
      renderDetail(EntryStorage.getById(entryId));
      return;
    }

    if (action === 'cancel-edit') {
      editingEntryId = null;
      renderDetail(EntryStorage.getById(entryId));
      return;
    }

    if (action === 'save-edit') {
      const newContent = Utils.qs('#history-edit-textarea').value.trim();
      if (!newContent) {
        Utils.showToast('내용을 입력해주세요.', 'error');
        return;
      }
      EntryStorage.update(entryId, { content: newContent });
      editingEntryId = null;
      renderDetail(EntryStorage.getById(entryId));
      renderTree(); // word/sentence count가 바뀌었을 수 있으므로 트리도 갱신
      Utils.showToast('수정되었습니다.');
      return;
    }

    if (action === 'delete-entry') {
      Utils.openConfirmModal({
        title: '정말 삭제하시겠습니까?',
        message: '삭제한 일기는 복구할 수 없습니다.',
        confirmLabel: '삭제',
        onConfirm: () => {
          EntryStorage.remove(entryId);
          selectedEntryId = null;
          editingEntryId = null;
          renderTree();
          renderDetail(null);
          Utils.showToast('삭제되었습니다.');
        },
      });
    }
  }

  function handleSearchInput(e) {
    searchKeyword = e.target.value;
    renderTree();
  }

  function handleSortChange(e) {
    sortOrder = e.target.value;
    renderTree();
  }

  function bindEvents() {
    Utils.qs('#history-tree').addEventListener('click', handleTreeClick);
    Utils.qs('#history-detail').addEventListener('click', handleDetailClick);
    Utils.qs('#history-search').addEventListener('input', Utils.debounce(handleSearchInput, 200));
    Utils.qs('#history-sort').addEventListener('change', handleSortChange);
  }

  let bound = false;

  function init() {
    if (!bound) {
      bindEvents();
      bound = true;
    }
    renderTree();
    // 이미 선택된 항목이 있으면(다른 화면에서 돌아온 경우) 유지, 없으면 빈 상태
    renderDetail(selectedEntryId ? EntryStorage.getById(selectedEntryId) : null);
  }

  return { init, refresh: renderTree };
})();
