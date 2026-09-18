import './AboutPage.css';
export default function AboutPage({ contactOnly = false }) {
  return <main className="profile-page">
    <div className="profile-orbit" aria-hidden="true" />
    <div className="profile-grid">
      <section className="profile-intro">
        <p className="profile-kicker">{contactOnly ? 'GET IN TOUCH' : 'ABOUT ME'} <span> / SHAOKANG</span></p>
        <h1>{contactOnly ? '让想法，\n成为风景。'.split('\n').map((s,i)=><span key={i}>{s}</span>) : <>吴少康<span className="profile-english">WU SHAOKANG</span></>}</h1>
        <p className="profile-role">景观设计师 <span>LANDSCAPE DESIGNER</span></p>
        <p className="profile-statement">以方案推敲塑造空间，<br/>以视觉表达呈现设计。</p>
        <p className="profile-summary">自 2019 年进入景观设计行业，工作涵盖方案设计、深化推敲及空间可视化。擅长结合三维模型检验空间关系，通过建模、渲染与后期表达，让设计意图更加清晰、直观。</p>
        <div className="profile-tags"><span>方案设计</span><span>模型推敲</span><span>视觉表达</span></div>
        <a className="profile-work-link" href="#/works">查看我的作品 <span>↗</span></a>
      </section>
      <div className="profile-details">
        {!contactOnly && <>
          <section className="profile-section"><h2><span>01 / EXPERIENCE</span>工作经历</h2>
            <article className="profile-job"><div className="profile-date">2021 — 至今</div><h3>安徽省交通规划设计研究总院</h3><p className="profile-position">园林分院 · 设计师</p><p>主要负责中小型景观项目的方案设计，以及大型项目的方案深化。将设计构思转化为三维空间，通过模型推敲、效果图渲染和后期制作，支持方案的研究、完善与展示。</p><div className="profile-job-note">方案设计 / 方案深化 / 三维建模 / 效果图表达</div></article>
            <article className="profile-job"><div className="profile-date">2019 — 2021</div><h3>黑森林景观设计公司</h3><p className="profile-position">设计师助理</p><p>参与景观方案深化与模型推敲，协助将设计思路转化为具体的空间表达。在方案反复比较与调整中，积累空间尺度、形态关系与视觉呈现的实践经验。</p><div className="profile-job-note">方案深化 / 模型推敲</div></article>
          </section>
          <section className="profile-section"><h2><span>02 / PRACTICE</span>专业方向</h2><div className="profile-practice"><article><h3>从构思到空间</h3><p>围绕方案开展深化与模型推敲，借助三维视角研究空间关系，让设计思路逐步清晰。</p></article><article><h3>从空间到画面</h3><p>承担建模、渲染与后期制作，通过光影、材质和画面组织，呈现场地氛围与设计意图。</p></article></div></section>
          <section className="profile-section"><h2><span>03 / TOOLKIT</span>常用工具</h2><div className="profile-tools"><div><strong>SketchUp</strong><span>三维建模 · 方案推敲</span></div><div><strong>D5 Render</strong><span>材质灯光 · 效果图渲染</span></div><div><strong>Photoshop</strong><span>图像后期 · 视觉表达</span></div></div></section>
        </>}
        <section className="profile-section profile-contact"><h2><span>{contactOnly ? 'CONTACT' : '04 / CONTACT'}</span>与我联系</h2><p>关于景观设计与空间表达，欢迎交流。</p><a href="mailto:1193590664@qq.com"><span>EMAIL</span><strong>1193590664@qq.com</strong><i>↗</i></a><a href="tel:+8613966384837"><span>PHONE</span><strong>139 6638 4837</strong><i>↗</i></a></section>
      </div>
    </div>
    <footer className="profile-footer"><span>WU SHAOKANG · LANDSCAPE DESIGN</span><span>SINCE 2019</span></footer>
  </main>;
}