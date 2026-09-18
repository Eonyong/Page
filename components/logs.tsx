export type Log = { id: string; tag: string; title: string; problem: string; steps: string[]; result: string; img: string; cap: string; meta: string; flip?: boolean };

export const LOGS: Log[] = [
  { id: "ci", tag: "CI / CT · Jenkins · Docker · ALM", title: "차량 제어 SW를 위한 Docker·Jenkins CI/CT 환경 구축",
    problem: "빌드 환경이 개발자 PC마다 달라 \"내 PC에선 되는데\"가 반복되고, 배포 결과를 ALM에 손으로 등록하던 상황.",
    steps: ["빌드 툴체인을 Docker 이미지로 고정해 어느 에이전트에서든 같은 결과가 나오도록 구성",
      "Jenkins 파이프라인을 빌드 → 정적분석 → 테스트(CT) → 산출물 보관으로 단계화, Windows 에이전트 병행",
      "배포 산출물과 테스트 결과를 ALM에 자동 등록하는 연계 스크립트 작성",
      "인증·권한 미설정으로 열려 있던 보안 구성 정상화, 유실된 빌드 산출물 복구 절차 수립"],
    result: "환경 편차 제거 · ALM 수동 등록 0건 · 산출물 보관·복구 정책 확립", img: "/assets/server.jpg", cap: "빌드 에이전트 선반", meta: "LOG 01" },
  { id: "parser", tag: "데이터 파싱 · Python · CAN / UDS", title: "한글 진단 사양서(Excel)를 DID 단위 JSON으로 바꾸는 파서",
    problem: "진단 통신 사양이 병합 셀·비트 범위·바이트 순서가 뒤섞인 한글 엑셀로만 관리되어, 테스트 도구에 넣을 때마다 손으로 옮겨 적어야 했던 상황.",
    steps: ["병합 셀 값을 하위 행에 전파해 행 단위 레코드로 정규화",
      "\"Bit 3~5\" 같은 범위 표기와 Motorola/Intel 바이트 순서를 해석해 구조화",
      "Reserved 필드·빈 행은 규칙으로 걸러내고, 변환 실패 항목은 별도 리포트로 분리",
      "결과 JSON은 테스트 자동화 도구와 대시보드가 그대로 읽는 공용 스키마로 설계"],
    result: "수작업 전사 → 스크립트 1회 실행 · 오기입 원천 차단 · 변경 이력 추적 가능", img: "/assets/spec.jpg", cap: "진단 사양서 검토", meta: "LOG 02", flip: true },
  { id: "mbd", tag: "MBD · Simulink · TRACE32", title: "Simulink 제어 로직 모델링과 디버거 기반 검증",
    problem: "제어 로직을 모델로 설계하고 생성된 코드를 실제 타깃에서 검증하는 과정이 개발자와 검증 담당자 사이에서 끊겨 있던 상황.",
    steps: ["Simulink로 제어 로직을 모델링하고 모델–코드 일관성을 지키는 작업 규칙 정리",
      "Lauterbach TRACE32 스크립트(PRACTICE)로 타깃 플래싱·브레이크·변수 덤프 자동화",
      "검증 결과를 CI의 CT 단계에 편입해 사람이 개입하는 구간 최소화"],
    result: "플래싱·검증 스크립트화 · 모델→타깃 왕복 시간 단축", img: "/assets/probe.jpg", cap: "JTAG 디버그 프로브", meta: "LOG 03" },
  { id: "blog", tag: "API 자동화 · Python · Blogger API", title: "블로그 콘텐츠 자동 발행 파이프라인",
    problem: "글 작성·이미지 업로드·발행을 매번 손으로 하다 보니 꾸준한 발행이 어려웠던 개인 프로젝트.",
    steps: ["플랫폼을 API 지원 여부와 비용으로 비교해 선정하고, 발행 스크립트를 스케줄러에 연결",
      "이미지 호스팅을 외부 서비스(ImgBB·GitHub)로 분리해 본문 삽입 자동화",
      "숏폼 영상 파이프라인은 입력 조건(원본 영상 필요)을 확인하고 범위에서 제외. 안 되는 것은 빨리 확인"],
    result: "발행 작업 무인화 · 이미지 처리 자동 삽입", img: "/assets/bench.jpg", cap: "작업대", meta: "LOG 04", flip: true },
];

export function LogEntry({ log }: { log: Log }) {
  return (
    <article id={log.id} className={`log ${log.flip ? "flip" : ""}`}>
      <div className="log-img">
        <div className="frame"><img className="photo" src={log.img} alt={log.cap} loading="lazy" style={{ aspectRatio: "4 / 3" }} /></div>
        <div className="cap"><span>{log.meta}</span><span>{log.cap}</span></div>
      </div>
      <div>
        <div className="mono" style={{ fontSize: 12, color: "var(--ink2)", letterSpacing: ".06em" }}>{log.tag}</div>
        <h3 className="h3" style={{ marginTop: 10 }}>{log.title}</h3>
        <p className="body" style={{ marginTop: 12 }}>{log.problem}</p>
        <ul>{log.steps.map((s) => <li key={s}>{s}</li>)}</ul>
        <div className="result"><b>결과</b>{log.result}</div>
      </div>
    </article>
  );
}

export function Arrow() {
  return (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
}
