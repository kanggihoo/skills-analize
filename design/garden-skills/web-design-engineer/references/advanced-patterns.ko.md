# 고급 참조: 구성 요소 패턴 및 코드 템플릿

이 파일에는 특정 작업을 구현할 때 참조할 고급 패턴과 코드 템플릿이 포함되어 있습니다.

## 목차

1. [반응형 슬라이드 엔진](#responsive-slide-engine)
2. [디바이스 시뮬레이션 프레임](#device-simulation-frames)
3. [조정 패널 구현](#tweaks-panel-implementation)
4. [애니메이션 타임라인 엔진](#animation-timeline-engine)
5. [디자인 캔버스(다중 옵션 비교)](#design-canvas)
6. [다크 모드 토글](#dark-mode-toggle)
7. [데이터 시각화 템플릿](#data-visualization-templates)

---

## 반응형 슬라이드 엔진

모든 뷰포트에 자동으로 맞춰지는 고정 크기 프리젠테이션을 구축하는 데 사용됩니다.**주요 규칙**:
- 내부 배열은 0부터 인덱스를 사용하지만 **사용자에게 표시되는 숫자는 항상 1부터 인덱스됩니다**
- 각 `<section class="slide">`는 쉽게 참조할 수 있도록 `data-screen-label="01 Title"`, `data-screen-label="02 Agenda"` 등을 가져옵니다.
- 제어 버튼은 작은 화면에서의 유용성을 보장하기 위해 `.stage` 크기가 조정된 컨테이너 **외부**에 있습니다.```html
<스타일>
  * { 여백: 0; 패딩: 0; 상자 크기 조정: 테두리 상자; }
  몸 { 
    배경: #000; 
    디스플레이: 플렉스; 
    항목 정렬: 중앙; 
    내용 정당화: 센터;
    높이: 100vh;
    오버플로: 숨김;
    글꼴 계열: system-ui, sans-serif;
  }
  .스테이지 {
    너비: 1920px;
    높이: 1080px;
    위치: 상대;
    변환 원점: 중심 중심;
  }
  .슬라이드 {
    위치: 절대;
    삽입: 0;
    디스플레이: 없음;
    패딩: 80px;
  }
  .slide.active { 디스플레이: 플렉스; }
  .controls {
    위치: 고정;
    하단: 20px;
    왼쪽: 50%;
    변환: 번역X(-50%);
    디스플레이: 플렉스;
    간격: 12px;
    Z-색인: 1000;
  }
  .controls 버튼 {
    패딩: 8px 16px;
    테두리: 없음;
    테두리 반경: 6px;
    배경: rgba(255,255,255,0.15);
    색상: 흰색;
    커서: 포인터;
    글꼴 크기: 14px;
  }
  .슬라이드 카운터 {
    위치: 고정;
    하단: 20px;
    오른쪽: 20px;
    색상: rgba(255,255,255,0.6);
    글꼴 크기: 14px;
  }
</style><스크립트>
  // 자동 맞춤 스케일링
  함수 scaleStage() {
    const stage = document.querySelector('.stage');
    const scaleX = window.innerWidth / 1920;
    const scaleY = window.innerHeight / 1080;
    const scale = Math.min(scaleX, scaleY);
    stage.style.transform = `scale(${scale})`;
  }
  window.addEventListener('resize', scaleStage);
  scaleStage();

  // 슬라이드 탐색
  let current =parseInt(localStorage.getItem('slideIndex') || '0');
  const 슬라이드 = document.querySelectorAll('.slide');
  
  함수 showSlide(n) {
    current = Math.max(0, Math.min(n, Slides.length - 1));
    Slides.forEach((s, i) => s.classList.toggle('active', i === current));
    localStorage.setItem('slideIndex', 현재);
    // 인덱싱된 1을 사용자에게 표시하고, 인덱싱된 0을 내부에 저장합니다.
    document.querySelector('.slide-counter').textContent = `${current + 1} / ${slides.length}`;
  }document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ') showSlide(current + 1);
    if (e.key === 'ArrowLeft') showSlide(current - 1);
  });
  
  showSlide(현재);
</script>
```

---

## 장치 시뮬레이션 프레임

### 아이폰 프레임```jsx
const IPhoneFrame = ({ 어린이, 제목 = "앱" }) => (
  <div 스타일={{
    폭: 390,
    높이: 844,
    국경 반경: 48,
    테두리: '12px 솔리드 #1a1a1a',
    오버플로: '숨김',
    위치: '상대적',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    배경: '#fff'
  }}>
    {/* 상태 표시줄 */}
    <div 스타일={{
      키: 54,
      디스플레이: '플렉스',
      alignItems: '가운데',
      justifyContent: '공백',
      패딩: '0 24px',
      글꼴 크기: 14,
      글꼴 무게: 600
    }}>
      <span>9:41</span>
      <div 스타일={{
        폭: 126,
        키: 34,
        배경: '#1a1a1a',
        국경 반경: 20,
        위치: '절대',
        왼쪽: '50%',
        변환: 'translateX(-50%)',
        상단: 8
      }} />
      <span>⚡ 📶</span>
    </div>
    {/* 내용 */}
    <div 스타일={{ 높이: 'calc(100% - 54px)', 오버플로: 'auto' }}>
      {어린이}
    </div>
    {/* 홈 표시기 */}
    <div 스타일={{
      위치:'절대적',
      하단: 8,
      왼쪽: '50%',
      변환: 'translateX(-50%)',
      폭: 134,
      높이: 5,
      배경: '#1a1a1a',
      국경 반경: 3
    }} />
  </div>
);
```

### 브라우저 창 프레임```jsx
const BrowserFrame = ({ 어린이, url = "https://example.com", 제목 = "페이지" }) => (
  <div 스타일={{
    국경 반경: 12,
    오버플로: '숨김',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    테두리: '1px 솔리드 #e5e5e5'
  }}>
    {/* 제목 표시줄 */}
    <div 스타일={{
      배경: '#f5f5f5',
      패딩: '12px 16px',
      디스플레이: '플렉스',
      alignItems: '가운데',
      간격: 12,
      borderBottom: '1px 솔리드 #e5e5e5'
    }}>
      <div 스타일={{ 디스플레이: 'flex', 간격: 8 }}>
        <div 스타일={{ 너비: 12, 높이: 12, borderRadius: '50%', 배경: '#ff5f57' }} />
        <div 스타일={{ 너비: 12, 높이: 12, borderRadius: '50%', 배경: '#febc2e' }} />
        <div 스타일={{ 너비: 12, 높이: 12, borderRadius: '50%', 배경: '#28c840' }} />
      </div>
      <div 스타일={{
        플렉스: 1,
        배경: '#fff',
        국경 반경: 6,
        패딩: '6px 12px',
        글꼴 크기: 13,
        색상: '#666',
        테두리: '1px 솔리드#e0e0e0'
      }}>
        {url}
      </div>
    </div>
    {/* 내용 */}
    <div 스타일={{ 배경: '#fff' }}>
      {어린이}
    </div>
  </div>
);
```

---

## Tweaks Panel Implementation

```jsx
const TweaksPanel = ({ config, onChange, visible }) => {
  (!visible) 경우 null을 반환합니다.
  
  반환 (
    <div 스타일={{
      위치: '고정',
      하단: 20,
      오른쪽: 20,
      폭: 280,
      배경: 'rgba(24, 24, 27, 0.95)',
      배경필터: 'blur(12px)',
      국경 반경: 12,
      패딩: 16,
      색상: '#fff',
      글꼴 크기: 13,
      z인덱스: 9999,
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      테두리: '1px 솔리드 rgba(255,255,255,0.1)'
    }}>
      <div style={{fontWeight: 600, marginBottom: 12,fontSize: 14 }}>조정</div>{Object.entries(config).map(([키, 값]) => (
        <div 키={key} 스타일={{ marginBottom: 12 }}>
          <라벨 스타일={{ 디스플레이: 'block', marginBottom: 4, 불투명도: 0.7 }}>
            {키}
          </label>
          {값 유형 === '부울' ? (
            <입력
              유형="체크박스"
              확인됨={값}
              onChange={e => onChange({ ...config, [key]: e.target.checked })}
            />
          ) : 값 유형 === '숫자' ? (
            <입력
              유형="범위"
              최소="0"
              최대="100"
              값={값}
              onChange={e => onChange({ ...config, [key]: 숫자(e.target.value) })}
              스타일={{ 너비: '100%' }}
            />
          ) : value.startsWith('#') ? (
            <입력
              유형="색상"
              값={값}
              onChange={e => onChange({ ...config, [key]: e.target.value })}
            />
          ) : (
            <입력유형="텍스트"
              값={값}
              onChange={e => onChange({ ...config, [key]: e.target.value })}
              스타일={{
                너비: '100%',
                배경: 'rgba(255,255,255,0.1)',
                테두리: '1px 솔리드 rgba(255,255,255,0.2)',
                국경 반경: 4,
                패딩: '4px 8px',
                색상: '#fff'
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## Animation Timeline Engine

```jsx
const useTime = (기간 = 5000) => {
  const [time, setTime] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);
  const 프레임Ref = React.useRef();
  const startRef = React.useRef();React.useEffect(() => {
    if (!playing) 반환;
    const 애니메이션 = (타임스탬프) => {
      if (!startRef.current) startRef.current = 타임스탬프;
      const elapsed = (timestamp - startRef.current) % 기간;
      setTime(경과시간/지속시간); // 0에서 1
      FrameRef.current = requestAnimationFrame(animate);
    };
    FrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [재생, 기간]);
  
  return { 시간, 재생, setPlaying };
};

const 완화 = {
  선형: t => t,
  easyInOut: t => t < 0.5 ? 2 * 티 * 티 : -1 + (4 - 2 * 티) * 티,
  easyOut: t => 1 - Math.pow(1 - t, 3),
  easyIn: t => t * t * t,
  스프링: t => 1 - Math.pow(Math.E, -6 * t) * Math.cos(8 * t)
};

const 보간 = (t, from, to, easing = Easing.easeInOut) => {
  const 진행 = 완화(Math.max(0, Math.min(1, t)));
  +에서 (-에서) * 진행으로 돌아갑니다.
};// 사용 예:
// const { time } = useTime(3000);
// const opacity = interpolate(time, 0, 1);
// const x = 보간(time, -100, 0, Easing.spring);
```

---

## 디자인 캔버스

비교를 위해 여러 설계 옵션을 나란히 표시하려면:```jsx
const DesignCanvas = ({ options, columns = 3 }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: 24,
    padding: 40,
    background: '#f8f9fa',
    minHeight: '100vh'
  }}>
    {options.map((option, i) => (
      <div key={i} style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #eee',
          fontSize: 13,
          fontWeight: 600,
          color: '#666'
        }}>
          Option {String.fromCharCode(65 + i)}: {option.label}
        </div>
        <div style={{ padding: 16 }}>
          {option.content}
        </div>
      </div>
    ))}
  </div>
);
```

---

## 다크 모드 토글

```jsx
const ThemeProvider = ({ 어린이 }) => {
  const [dark, setDark] = React.useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );const 테마 = 어두움? {
    bg: '#0a0a0b',
    표면: '#18181b',
    테두리: '#27272a',
    텍스트: '#fafafa',
    텍스트 음소거: '#a1a1aa',
    기본: '#3b82f6'
  } : {
    bg: '#ffffff',
    표면: '#f4f4f5',
    테두리: '#e4e4e7',
    텍스트: '#18181b',
    텍스트 음소거: '#71717a',
    기본: '#2563eb'
  };
  
  반환 (
    <ThemeContext.Provider 값={{ 테마, dark, setDark }}>
      <div 스타일={{ 배경: theme.bg, 색상: theme.text, minHeight: '100vh' }}>
        {어린이}
      </div>
    </ThemeContext.Provider>
  );
};
```

---

## 데이터 시각화 템플릿

### Chart.js 빠른 시작```html
<canvas id="myChart" width="800" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
  const ctx = document.getElementById('myChart').getContext('2d');
  new Chart(ctx, {
    type: 'line', // bar, pie, doughnut, radar, etc.
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
        x: { grid: { display: false } }
      }
    }
  });
</script>
```

---

## 색상 시스템 모범 사례

조화로운 색상 시스템을 정의하려면 oklch를 사용하십시오.```css
:root {
  /* oklch-based color system */
  --primary-h: 250;  /* hue */
  --primary: oklch(0.55 0.25 var(--primary-h));
  --primary-light: oklch(0.75 0.15 var(--primary-h));
  --primary-dark: oklch(0.35 0.2 var(--primary-h));
  
  /* Neutrals */
  --gray-50: oklch(0.98 0.002 250);
  --gray-100: oklch(0.96 0.004 250);
  --gray-200: oklch(0.92 0.006 250);
  --gray-300: oklch(0.87 0.008 250);
  --gray-400: oklch(0.71 0.01 250);
  --gray-500: oklch(0.55 0.014 250);
  --gray-600: oklch(0.45 0.014 250);
  --gray-700: oklch(0.37 0.014 250);
  --gray-800: oklch(0.27 0.014 250);
  --gray-900: oklch(0.21 0.014 250);
}
```

---

## 글꼴 권장 사항(기본값이 아닌 선택)> ⚠️ **이는 엄격한 규칙이 아닌 경험을 바탕으로 한 제안입니다.**
> - 항상 브랜드나 디자인 시스템에서 이미 지정한 글꼴을 선호합니다. 사용자가 글꼴 구성표를 제공하지 않은 경우에만 이 표를 참조하세요.
> - 유일한 엄격한 규칙: **Inter / Roboto / Arial / Fraunces / system-ui — AI 생성 콘텐츠에서 과도하게 사용되는 글꼴**을 피하세요. 즉, "이것은 AI에 의해 조립되었습니다."라는 신호를 즉시 표시합니다.
> - 글꼴 선택 시 '유행'보다는 '개성맞춤'에 중점을 두세요. 아래 표에는 전체 목록이 아닌 일반적인 고품질 선택 사항이 나열되어 있습니다.

| 사용 사례 | 추천 | Google 글꼴 이름 |
|------|------|------|
| 현대 제목 | 플러스 자카르타 산스 | 플러스+자카르타+산스 |
| 우아한 본문 텍스트 | 복장 | 복장 |
| 기술적인 느낌 | 스페이스 그로테스크 | 스페이스+그로테스크 |
| 프리미엄 브랜드 | 소라 | 소라 |
| 편집적인 느낌 | 뉴스리더 | 뉴스리더 |
| 필기 스타일 | 주의사항 | 주의사항 |
| 고정 폭 / 코드 | JetBrains 모노 | JetBrains+모노 |```html
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

---

## 색상 × 폰트 페어링 참고

> ⚠️ **이것은 엄격한 규칙이 아닌 경험 기반 페어링 제안입니다.** **디자인 컨텍스트가 전혀 없는 경우** 시작점으로 하나를 선택하세요. Inter + #3b82f6에서 시작하는 것보다 훨씬 낫습니다.
> 사용자가 브랜드/디자인 시스템/참조 사이트를 제공하면 즉시 이 표를 삭제하고 해당 자료를 따르십시오.

개성 있는 시각적 시스템을 빠르게 구축하려면:| 스타일 | 기본 색상(oklch) | 글꼴 페어링 | 최고의 대상 |
|---|---|---|---|
| 현대 기술 | `oklch(0.55 0.25 250)` 청자색 | 스페이스 그로테스크 + 인터 | SaaS, 개발 도구, AI 제품 |
| 우아한 사설 | `oklch(0.35 0.10 30)` 따뜻한 브라운 | 뉴스리더 + 의상 | 콘텐츠 플랫폼, 블로그, 사설 |
| 프리미엄 브랜드 | `oklch(0.20 0.02 250)` 니어 블랙 | 소라 + 플러스 자카르타 산스 | 럭셔리, 컨설팅, 금융 |
| 활발한 소비자 | `oklch(0.70 0.20 30)` 산호 | 플러스 자카르타 산스 + 의상 | 전자상거래, 라이프스타일, 소셜 |
| 최소한의 전문 | `oklch(0.50 0.15 200)` 청록색 | 의상 + 스페이스 그로테스크 | 데이터 제품, 대시보드, B2B |
| 장인의 따뜻함 | `oklch(0.55 0.15 80)` 카라멜 | 경고(장식) + 뉴스리더 | 식음료, 교육, 창작 |

다음 콤보를 피하세요:
- ❌ Inter + Roboto + 파란색 버튼(최고의 AI 미학)
- ❌ 프라우네스 + 퍼플-핑크 그라데이션 (과용)
- ❌ 3개 이상의 글꼴 모음(시각적 혼란)