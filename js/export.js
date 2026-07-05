/**
 * export.js
 * -----------------------------------------------------------------------
 * Dashboard의 다운로드 버튼(CSV / Excel / PDF)에서 사용할 내보내기 전용
 * 모듈입니다. Phase 1.5(현재)에서는 함수 자리만 만들어두고, 실제 파일
 * 생성 로직은 구현하지 않습니다.
 *
 * 향후 구현 시:
 *   - exportCSV: 순수 텍스트 CSV 생성
 *   - exportExcel: SheetJS(xlsx) 라이브러리 사용 예정
 *   - exportPDF: jsPDF 라이브러리 사용 예정
 * 세 함수 모두 EntryStorage.getAll()로 얻은 entries 배열을 그대로
 * 받아 처리하도록 시그니처를 통일했습니다.
 * -----------------------------------------------------------------------
 */

const ExportService = (() => {
  /**
   * 전체 일기 기록을 CSV로 내보낸다. (미구현)
   * @param {JournalEntry[]} entries
   */
  function exportCSV(entries) {
    // TODO: date, content, wordCount, sentenceCount, analysis 요약 컬럼을
    // 포함한 CSV 문자열을 생성하고 Blob으로 다운로드한다.
    Utils.showToast('CSV 다운로드는 다음 단계에서 구현됩니다.');
  }

  /**
   * 전체 일기 기록을 Excel(.xlsx)로 내보낸다. (미구현)
   * @param {JournalEntry[]} entries
   */
  function exportExcel(entries) {
    // TODO: SheetJS(XLSX) CDN 추가 후 워크시트 생성 로직 구현.
    Utils.showToast('Excel 다운로드는 다음 단계에서 구현됩니다.');
  }

  /**
   * 전체 일기 기록을 PDF로 내보낸다. (미구현)
   * @param {JournalEntry[]} entries
   */
  function exportPDF(entries) {
    // TODO: jsPDF CDN 추가 후 문서 생성 로직 구현.
    Utils.showToast('PDF 다운로드는 다음 단계에서 구현됩니다.');
  }

  return { exportCSV, exportExcel, exportPDF };
})();
