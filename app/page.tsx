import { LOGS, LogEntry, Arrow } from "@/components/logs";

const BLOG = "https://blog.naver.com/pacho_";
const MAIL = "eyjeong1202@gmail.com";

export default function Home() {
  return (
    <main>
      <section className="wrap" style={{ paddingBlock: "48px 56px" }}>
        <div className="mast">
          <div>
            <div className="arch">Archive · Field log · Seoul · 2026</div>
            <h1 className="h1" style={{ marginTop: 18 }}>손으로 반복하던 빌드와 배포를,<br />돌아가는 파이프라인으로.</h1>
            <p className="lede" style={{ marginTop: 22 }}>
              차량 제어 소프트웨어 현장에서 CI/CD/CT 환경을 직접 구축하고 운영해 온 엔지니어입니다.
              Jenkins·Docker 기반 자동화, 진단 데이터 파싱 스크립트, 팀이 매일 보는 현황 대시보드까지.
              아래는 실제로 처리한 일을 기록한 작업 일지입니다.
            </p>
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", marginTop: 30 }}>
              <a className="mail" href={`mailto:${MAIL}`}>이메일 보내기 <span className="addr">{MAIL}</span></a>
              <a className="link" href="#logs">작업 일지 읽기</a>
              <a className="arrow" href={BLOG} target="_blank" rel="noopener">네이버 블로그 <Arrow /></a>
            </div>
          </div>
          <div className="hero-photo">
            <div className="frame"><img className="photo" src="/assets/bench.jpg" alt="ECU 보드와 하네스가 놓인 작업대" style={{ aspectRatio: "3 / 2" }} /></div>
            <div className="cap"><span>WORKBENCH</span><span>ECU · harness · scope</span></div>
          </div>
        </div>
        <dl className="facts">
          <div><dt>DOMAIN</dt><dd>자동차 임베디드 SW</dd></div>
          <div><dt>CORE</dt><dd>Jenkins · Docker · Python</dd></div>
          <div><dt>WORK MODE</dt><dd>원격 · 크몽 등 플랫폼 가능</dd></div>
          <div><dt>REPLY</dt><dd>평일 24시간 내</dd></div>
        </dl>
      </section>

      <section id="logs" className="wrap" style={{ paddingBlock: "24px 40px" }}>
        <div style={{ paddingTop: 28 }}>
          <div className="arch">Archive 01 · Logs</div>
          <h2 className="h2" style={{ marginTop: 10 }}>작업 일지</h2>
          <p className="body" style={{ marginTop: 10, maxWidth: "40em" }}>문제 → 처리 → 결과 순으로 적었습니다. 고객사 정보와 내부 수치는 뺐고, 사진은 재현 이미지입니다.</p>
        </div>
        {LOGS.map((l) => (
          <div key={l.id} className="sheet">
            <span className="sheet-tab">{l.meta}</span>
            <span className="sheet-tab stamp">{l.tag.split(" · ")[0]}</span>
            <LogEntry log={l} />
          </div>
        ))}
      </section>

      <section id="work" className="wrap" style={{ paddingBlock: 56 }}>
        <div className="arch">Archive 02 · Services</div>
        <h2 className="h2" style={{ marginTop: 10 }}>맡길 수 있는 일</h2>
        <p className="body" style={{ margin: "10px 0 28px", maxWidth: "40em" }}>전담 인프라 인력이 없는 소규모 팀·1인 개발사·연구실에서 효과가 큽니다.</p>
        <dl className="def">
          <div><dt>CI/CD/CT 파이프라인 구축</dt><dd>Jenkins·Docker로 빌드→정적분석→테스트→배포를 자동화합니다. Windows 에이전트, ALM 연계 배포, 산출물 보관 정책까지 포함합니다.</dd></div>
          <div><dt>Python 자동화 스크립트</dt><dd>엑셀·CSV·로그처럼 손으로 옮기던 데이터를 파싱해 JSON·DB로 정리합니다. CAN/UDS 사양, 병합 셀, 비트 필드 같은 까다로운 포맷도 다룹니다.</dd></div>
          <div><dt>현황 대시보드</dt><dd>빌드 성공률, 테스트 결과, 배포 이력처럼 팀이 매일 묻는 숫자를 한 화면에 모읍니다. 정적 HTML부터 Jenkins API 연동까지 규모에 맞게.</dd></div>
          <div><dt>콘텐츠·업무 API 자동화</dt><dd>블로그 발행, 이미지 업로드, 보고서 생성처럼 정해진 시간에 반복되는 일을 API로 이어 스케줄링합니다.</dd></div>
        </dl>
      </section>

      <section id="how" className="wrap" style={{ paddingBlock: "8px 56px" }}>
        <div className="arch">Archive 03 · Process</div>
        <h2 className="h2" style={{ marginTop: 10 }}>진행 순서</h2>
        <p className="body" style={{ margin: "10px 0 28px", maxWidth: "40em" }}>범위를 먼저 고정하고, 작은 단위로 자주 보여드립니다.</p>
        <div className="steps">
          <div className="step"><h4>현황 파악</h4><p>지금 손으로 하는 작업과 환경(OS·툴체인·권한)을 30분 통화나 문서로 확인합니다.</p></div>
          <div className="step"><h4>범위·견적 확정</h4><p>자동화할 단계, 산출물, 검수 기준을 문서로 정리해 합의합니다. 범위 밖은 별도 견적입니다.</p></div>
          <div className="step"><h4>구축·중간 공유</h4><p>파이프라인은 스테이지 단위, 스크립트는 기능 단위로 나눠 동작하는 상태를 중간중간 보여드립니다.</p></div>
          <div className="step"><h4>인수·문서화</h4><p>설정 파일, 실행 방법, 장애 시 복구 절차를 README로 남깁니다. 인수 후 2주 보정 기간 포함.</p></div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBlock: "8px 64px" }}>
        <div className="arch" style={{ marginBottom: 14 }}>Archive 04 · Tools</div>
        <div className="tools">
          <div><h5>CI / CD / CT</h5><p>Jenkins<br />Docker<br />Windows agent<br />ALM 연계<br />Git</p></div>
          <div><h5>Embedded / Automotive</h5><p>Simulink<br />TRACE32 (Lauterbach)<br />CAN / UDS · DID<br />C</p></div>
          <div><h5>Scripting / Data</h5><p>Python<br />openpyxl · pandas<br />JSON 스키마<br />REST API</p></div>
          <div><h5>Web / Dashboard</h5><p>HTML · CSS · JS<br />React · Next.js<br />Firebase · Postgres<br />차트 시각화</p></div>
        </div>
      </section>

      <section id="contact" className="wrap" style={{ paddingBlock: "0 72px" }}>
        <div className="letter">
          <div>
            <div className="eyebrow">Contact</div>
            <h2 className="h2" style={{ marginTop: 12 }}>지금 손으로 하는 일이 있다면<br />먼저 이야기해 주세요.</h2>
            <p className="body" style={{ marginTop: 14, maxWidth: "36em" }}>현재 환경과 반복 작업을 간단히 적어 보내주시면, 자동화 가능 여부와 대략의 범위를 답변드립니다.</p>
          </div>
          <div style={{ display: "grid", gap: 18, justifyItems: "start" }}>
            <a className="mail" href={`mailto:${MAIL}?subject=%5B%EC%9E%90%EB%8F%99%ED%99%94%20%EB%AC%B8%EC%9D%98%5D`}>이메일 보내기 <span className="addr">{MAIL}</span></a>
            <a className="arrow" href={BLOG} target="_blank" rel="noopener">네이버 블로그 blog.naver.com/pacho_ <Arrow /></a>
          </div>
        </div>
      </section>
    </main>
  );
}
