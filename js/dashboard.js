/**
 * dashboard.js
 * -----------------------------------------------------------------------
 * Dashboard 화면(통계 카드, 차트, Top20 단어 표, 최근 목록)을 그리는 모듈.
 *
 * Phase 1 현재 상태:
 *   - EntryStorage.getAll()이 아직 빈 배열([])만 반환하므로,
 *     아래 렌더 함수들은 "데이터가 없을 때의 UI"를 정확히 보여주는 데 집중합니다.
 *   - Chart.js 인스턴스는 미리 생성해두어, Phase 2에서 실제 일기 데이터가
 *     쌓이면 render()만 다시 호출해도 차트가 자동으로 채워지도록 설계했습니다.
 * -----------------------------------------------------------------------
 */

const DashboardView = (() => {
  let charts = {}; // { monthly, daily, words, sentences } Chart.js 인스턴스 캐시
  let initialized = false;

  /** 차트 4개를 최초 1회 생성 (빈 데이터 상태) */
  function createCharts() {
    if (typeof Chart === 'undefined') {
      console.warn('[Dashboard] Chart.js가 아직 로드되지 않았습니다.');
      return;
    }

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: getComputedColor('--color-text-muted') } },
        y: { grid: { color: CONFIG.CHART_COLORS.grid }, ticks: { color: getComputedColor('--color-text-muted') }, beginAtZero: true },
      },
    };

    charts.monthly = new Chart(Utils.qs('#chart-monthly'), {
      type: 'bar',
      data: { labels: [], datasets: [{ data: [], backgroundColor: CONFIG.CHART_COLORS.primary, borderRadius: 6, maxBarThickness: 28 }] },
      options: baseOptions,
    });

    charts.daily = new Chart(Utils.qs('#chart-daily'), {
      type: 'bar',
      data: { labels: [], datasets: [{ data: [], backgroundColor: CONFIG.CHART_COLORS.secondary, borderRadius: 6, maxBarThickness: 14 }] },
      options: baseOptions,
    });

    charts.words = new Chart(Utils.qs('#chart-words'), {
      type: 'line',
      data: { labels: [], datasets: [{ data: [], borderColor: CONFIG.CHART_COLORS.primary, backgroundColor: CONFIG.CHART_COLORS.primarySoft, fill: true, tension: 0.35, pointRadius: 2 }] },
      options: baseOptions,
    });

    charts.sentences = new Chart(Utils.qs('#chart-sentences'), {
      type: 'line',
      data: { labels: [], datasets: [{ data: [], borderColor: CONFIG.CHART_COLORS.secondary, backgroundColor: CONFIG.CHART_COLORS.secondarySoft, fill: true, tension: 0.35, pointRadius: 2 }] },
      options: baseOptions,
    });
  }

  /** CSS 변수 값을 실제 색상 문자열로 읽어오는 헬퍼 (Chart.js는 var() 직접 인식 못함) */
  function getComputedColor(cssVarName) {
    return getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim() || '#6B7280';
  }

  /** CEFR 레벨 ↔ 점수 매핑 (평균 계산용). */
  const CEFR_SCALE = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  /** 통계 요약 카드 렌더 */
  function renderStats(entries) {
    const totalDays = new Set(entries.map((e) => e.date)).size;
    const totalEntries = entries.length;
    const totalWords = entries.reduce((sum, e) => sum + (e.wordCount || 0), 0);
    const totalSentences = entries.reduce((sum, e) => sum + (e.sentenceCount || 0), 0);
    const avgWords = totalEntries ? Math.round(totalWords / totalEntries) : 0;
    const avgSentences = totalEntries ? Math.round((totalSentences / totalEntries) * 10) / 10 : 0;

    Utils.qs('#stat-days').textContent = totalDays;
    Utils.qs('#stat-entries').textContent = totalEntries;
    Utils.qs('#stat-words').textContent = totalWords;
    Utils.qs('#stat-sentences').textContent = totalSentences;
    Utils.qs('#stat-avg-words').textContent = avgWords;
    Utils.qs('#stat-avg-sentences').textContent = avgSentences;
    Utils.qs('#stat-avg-cefr').textContent = computeAverageCefr(entries);
  }

  /**
   * analysis.cefr이 있는 entry들의 평균 CEFR 레벨을 계산한다.
   * A1~C2를 0~5 점수로 변환해 평균을 낸 뒤 가장 가까운 레벨로 반올림한다.
   * 분석된 entry가 하나도 없으면 "-"를 반환한다.
   * @param {JournalEntry[]} entries
   * @returns {string}
   */
  function computeAverageCefr(entries) {
    const scores = entries
      .map((e) => e.analysis?.cefr)
      .filter((cefr) => CEFR_SCALE.includes(cefr))
      .map((cefr) => CEFR_SCALE.indexOf(cefr));

    if (scores.length === 0) return '-';

    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return CEFR_SCALE[Utils.clamp(Math.round(avgScore), 0, CEFR_SCALE.length - 1)];
  }

  /** 4개 차트 데이터 갱신 */
  function renderCharts(entries) {
    if (!charts.monthly) return; // Chart.js 미로드 시 안전 종료

    const sorted = Utils.sortByDate(entries, 'asc');

    // 월별 작성량 집계
    const monthlyMap = {};
    sorted.forEach((e) => {
      const key = e.date.slice(0, 7); // YYYY-MM
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    });
    charts.monthly.data.labels = Object.keys(monthlyMap);
    charts.monthly.data.datasets[0].data = Object.values(monthlyMap);
    charts.monthly.update();

    // 일별 작성량 (최근 30건 기준)
    const recentDaily = sorted.slice(-30);
    charts.daily.data.labels = recentDaily.map((e) => e.date.slice(5));
    charts.daily.data.datasets[0].data = recentDaily.map(() => 1);
    charts.daily.update();

    // 단어 수 / 문장 수 변화 추이
    charts.words.data.labels = sorted.map((e) => e.date.slice(5));
    charts.words.data.datasets[0].data = sorted.map((e) => e.wordCount || 0);
    charts.words.update();

    charts.sentences.data.labels = sorted.map((e) => e.date.slice(5));
    charts.sentences.data.datasets[0].data = sorted.map((e) => e.sentenceCount || 0);
    charts.sentences.update();
  }

  /** 가장 많이 사용한 단어 Top 20 표 렌더 */
  function renderWordTable(entries) {
    const tbody = Utils.qs('#word-table-body');
    const freq = {};
    const stopwords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'to', 'and', 'of', 'in', 'on', 'it', 'i']);

    entries.forEach((e) => {
      (e.content || '')
        .toLowerCase()
        .match(/[a-z']+/g)
        ?.forEach((word) => {
          if (stopwords.has(word) || word.length < 2) return;
          freq[word] = (freq[word] || 0) + 1;
        });
    });

    const top20 = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 20);

    if (top20.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="empty-state">데이터가 쌓이면 표시됩니다.</td></tr>`;
      return;
    }

    tbody.innerHTML = top20
      .map(([word, count], idx) => `<tr><td>${idx + 1}</td><td>${Utils.escapeHtml(word)}</td><td>${count}</td></tr>`)
      .join('');
  }

  /** 최근 작성 목록 렌더 */
  function renderRecentList(entries) {
    const list = Utils.qs('#recent-list');
    const recent = Utils.sortByDate(entries, 'desc').slice(0, 6);

    if (recent.length === 0) {
      list.innerHTML = `<li class="empty-state">아직 작성한 일기가 없습니다.</li>`;
      return;
    }

    list.innerHTML = recent
      .map((e) => `<li><strong>${e.date}</strong> · ${e.wordCount || 0} words</li>`)
      .join('');
  }

  /**
   * AI 분석 기반 통계(예: CEFR 분포, 감정 분포 등)를 위한 자리.
   * 현재는 모든 entry의 analysis가 null이므로 아무것도 그리지 않고
   * 안전하게 종료한다. 향후 analysis 데이터가 쌓이면 이 함수 안에서
   * entries.filter(e => e.analysis) 형태로 집계 로직을 추가하면 된다.
   * @param {JournalEntry[]} entries
   */
  function renderAnalysisInsights(entries) {
    const analyzed = entries.filter((e) => e.analysis);
    if (analyzed.length === 0) return; // Phase 1.5: 분석 데이터 없음, 표시할 것 없음
    // TODO: analyzed 배열을 바탕으로 CEFR 분포, 감정 분포 등 차트/카드 추가
  }

  /** 전체 렌더 진입점. 데이터가 바뀔 때마다(저장/삭제 등) 다시 호출하면 됩니다. */
  function render() {
    const entries = EntryStorage.getAll();
    renderStats(entries);
    renderCharts(entries);
    renderWordTable(entries);
    renderRecentList(entries);
    renderAnalysisInsights(entries);
  }

  /** CSV/Excel/PDF 다운로드 버튼을 export.js와 연결 (최초 1회만 바인딩) */
  function bindDownloadButtons() {
    Utils.qs('#download-csv-btn').addEventListener('click', () => ExportService.exportCSV(EntryStorage.getAll()));
    Utils.qs('#download-xlsx-btn').addEventListener('click', () => ExportService.exportExcel(EntryStorage.getAll()));
    Utils.qs('#download-pdf-btn').addEventListener('click', () => ExportService.exportPDF(EntryStorage.getAll()));
  }

  function init() {
    if (!initialized) {
      createCharts();
      bindDownloadButtons();
      initialized = true;
    }
    render();
  }

  return { init, render };
})();
