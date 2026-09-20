'use client';
import { useEffect, useState } from 'react';
import RingHome from './RingHome';
import AboutPage from './AboutPage';
import GlowCursor from '../components/react-bits/GlowCursor';
import PortfolioNavigation from './PortfolioNavigation';
import InfiniteSpiral from '../components/react-bits/InfiniteSpiral';
import './SpiralWorks.css';

import ScrollStack from '../components/react-bits/ScrollStack';
import { projects } from './portfolio-data';

const spiralItems = projects.map(p => ({ id:p.id, src:p.image, alt:p.title, label:p.title, href:`#/works/${p.category}/${p.id}` }));
export default function Portfolio() {
  const [route, setRoute] = useState('/');

  useEffect(() => {
    const sync = () => setRoute(window.location.hash.slice(1) || '/');
    sync(); window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  const parts = route.split('/').filter(Boolean);
  const project = projects.find(p=>p.id===parts[2]) || projects[0];

  return <GlowCursor className="portfolio-cursor" color="#7C3AED" secondaryColor="#A78BFA" trailLength={40} trailWidth={8} trailTaper={0.8} followSpeed={0.16} glowIntensity={route === '/' ? 0.6 : 1.9} glowSpread={1.2} hotspot={0.65} brightness={1.25} opacity={route === '/' ? 0.35 : 1} pulseSpeed={1.1} noiseStrength={0.035} idleFade idleTimeout={700} fadeDuration={900} blendMode="screen"><div className="portfolio-shell">
    <PortfolioNavigation route={route}/>
    {route==='/' ? <RingHome/>
    : parts[0]==='works' && parts.length<3 ? <main className="spiral-works"><div className="spiral-heading"><a className="back-link" href="#/">← 首页</a><h1>全部作品</h1><p>{projects.length} 个项目 · 自动浏览 · 拖动切换 · 点击进入</p></div><div className="spiral-canvas"><InfiniteSpiral items={spiralItems} animationMode="all" speed={0.55} radius={170} cardWidth={100} cardHeight={100} verticalSpacing={60} perspective={1000} cardRadius={10} centerScale={1.2} edgeBlur={6} cardsPerTurn={7} pauseOnHover={false} /></div></main>
    : parts[0]==='works' && parts.length===3 ? <main className="detail-page detail-page--stack"><div className="detail-intro"><a className="back-link" href="#/works">← 全部作品</a><p className="eyebrow">PROJECT / {String(project.images.length).padStart(2,'0')} IMAGES</p><h1>{project.title}</h1>{project.description && <p className="project-description">{project.description}</p>}<p className="muted">向下滚动，逐张浏览项目效果图</p></div><ScrollStack key={project.id} items={project.images.map((image,index)=>({ ...image, eyebrow:`${project.title} · IMAGE ${String(index+1).padStart(2,'0')}`, title:project.title, body:`第 ${index+1} 张 / 共 ${project.images.length} 张`, accent:['#7cff67','#B497CF','#5227FF'][index%3] }))}/></main>
    : <AboutPage contactOnly={parts[0]!=='about'}/>}
  </div></GlowCursor>;
}
