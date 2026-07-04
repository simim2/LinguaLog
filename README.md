# English Journal AI

Notion × ChatGPT × Duolingo 감성의 영어 학습 일기장 웹앱입니다.
Vanilla HTML/CSS/JS로 제작되었으며, 향후 OpenAI API 연동을 고려한 구조로 설계했습니다.

## 현재 단계 (Phase 1)
- 폴더 구조 및 기본 UI 완성
- Home / History / Dashboard 3개 화면
- 다크모드, 폰트 크기 설정
- Chart.js 기반 대시보드 뼈대
- 저장/히스토리/AI 분석 기능은 다음 단계에서 순차 구현 예정

## 폴더 구조
```
index.html
css/style.css
js/
  config.js     전역 설정 및 상수
  utils.js      공용 유틸 함수
  storage.js    LocalStorage 접근 레이어
  history.js    History 화면 로직
  dashboard.js  Dashboard 화면 로직
  app.js        앱 진입점 (네비게이션, 다크모드, Home 상호작용)
```

## 실행 방법
별도 빌드 과정 없이 `index.html`을 브라우저로 열면 바로 실행됩니다.
