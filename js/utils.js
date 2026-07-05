/**
 * utils.js
 * -----------------------------------------------------------------------
 * 여러 파일에서 공통으로 사용하는 순수 함수(pure function)들을 모아둔 파일.
 * DOM 조작 헬퍼, 날짜 포맷, 텍스트 분석(단어/문장 수), 토스트 알림 등을
 * 담당하며, 특정 화면(Home/History/Dashboard)의 로직은 포함하지 않습니다.
 * -----------------------------------------------------------------------
 */

const Utils = (() => {
  /** querySelector 짧게 쓰기 위한 헬퍼 */
  function qs(selector, scope = document) {
    return scope.querySelector(selector);
  }

  /** querySelectorAll을 배열로 반환하는 헬퍼 */
  function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  /**
   * 디바운스: 짧은 시간 안에 여러 번 호출되어도 마지막 호출만 실행되도록 함.
   * (예: 입력창 자동저장, 실시간 검색에 사용)
   */
  function debounce(fn, delay = 300) {
    let timerId = null;
    return function debounced(...args) {
      clearTimeout(timerId);
      timerId = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /** 오늘 날짜를 YYYY-MM-DD 형식(ISO date)으로 반환 */
  function getTodayISODate() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  /** 화면 상단에 표시할 "2026년 7월 4일 토요일" 형식의 날짜 문자열 */
  function formatDisplayDate(date = new Date()) {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const yyyy = date.getFullYear();
    const mm = date.getMonth() + 1;
    const dd = date.getDate();
    const day = days[date.getDay()];
    return `${yyyy}년 ${mm}월 ${dd}일 (${day})`;
  }

  /** ISO 날짜 문자열(YYYY-MM-DD) → { year, month, day } 분해 (History 그룹핑용) */
  function splitISODate(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return { year, month, day };
  }

  /** 간단한 영어 단어 수 세기 (공백 기준) */
  function countWords(text) {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  }

  /** 간단한 영어 문장 수 세기 (. ! ? 기준, 약식 계산) */
  function countSentences(text) {
    if (!text || !text.trim()) return 0;
    const matches = text.trim().match(/[^.!?]+[.!?]+/g);
    if (matches && matches.length > 0) return matches.length;
    // 문장부호가 없는 경우 텍스트가 있으면 최소 1문장으로 취급
    return text.trim().length > 0 ? 1 : 0;
  }

  /**
   * entry.date(YYYY-MM-DD) 기준 정렬. history.js/dashboard.js에서 각각
   * 중복 구현되어 있던 정렬 비교 로직을 하나로 통합했다.
   * @param {Array<{date: string}>} entries
   * @param {'asc'|'desc'} order - 'asc': 오래된순, 'desc': 최신순
   * @returns {Array} 정렬된 새 배열 (원본 배열은 변경하지 않음)
   */
  function sortByDate(entries, order = 'desc') {
    const sorted = [...entries];
    sorted.sort((a, b) => (order === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
    return sorted;
  }

  /** 평균 문장 길이(문장당 평균 단어 수) 계산 */
  function averageSentenceLength(text) {
    const words = countWords(text);
    const sentences = countSentences(text);
    if (sentences === 0) return 0;
    return Math.round((words / sentences) * 10) / 10;
  }

  /** XSS 방지를 위한 최소한의 HTML 이스케이프 */
  function escapeHtml(str = '') {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /** 고유 ID 생성 (일기 항목 id로 사용) */
  function generateId() {
    return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /** 숫자를 0 밑으로/최대값 위로 넘지 않도록 고정 */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * 화면 우하단에 짧게 뜨는 토스트 메시지.
   * type: 'success' | 'error' | 'info'
   */
  function showToast(message, type = 'success') {
    const container = qs('#toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    // 다음 프레임에 클래스를 추가해 트랜지션이 실행되도록 함
    requestAnimationFrame(() => toast.classList.add('toast--visible'));

    setTimeout(() => {
      toast.classList.remove('toast--visible');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, CONFIG.TOAST_DURATION_MS);
  }

  /**
   * 삭제 등 위험한 동작 전에 표시하는 확인 모달을 여는 헬퍼.
   * confirmModal 엘리먼트가 index.html에 이미 존재한다고 가정합니다.
   * onConfirm: 사용자가 "삭제"를 눌렀을 때 실행할 콜백
   */
  function openConfirmModal({ title, message, confirmLabel = '삭제', onConfirm }) {
    const modal = qs('#confirm-modal');
    if (!modal) return;

    qs('#confirm-modal-title', modal).textContent = title;
    qs('#confirm-modal-message', modal).textContent = message;
    const confirmBtn = qs('#confirm-modal-confirm', modal);
    confirmBtn.textContent = confirmLabel;

    modal.classList.add('is-open');

    // 이전에 등록된 핸들러가 남아있지 않도록 노드를 복제해서 교체
    const freshBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(freshBtn, confirmBtn);

    freshBtn.addEventListener('click', () => {
      modal.classList.remove('is-open');
      onConfirm && onConfirm();
    });

    qs('#confirm-modal-cancel', modal).onclick = () => {
      modal.classList.remove('is-open');
    };
  }

  return {
    qs,
    qsa,
    debounce,
    getTodayISODate,
    formatDisplayDate,
    splitISODate,
    countWords,
    countSentences,
    sortByDate,
    averageSentenceLength,
    escapeHtml,
    generateId,
    clamp,
    showToast,
    openConfirmModal,
  };
})();
