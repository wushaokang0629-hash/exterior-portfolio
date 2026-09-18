'use client';
import { useEffect, useState } from 'react';
import RingHome from './RingHome';
import GlowCursor from '../components/react-bits/GlowCursor';
import PortfolioNavigation from './PortfolioNavigation';
import InfiniteSpiral from '../components/react-bits/InfiniteSpiral';
import './SpiralWorks.css';

import DepthCarousel from '../components/react-bits/DepthCarousel';
import { categories, projects } from './portfolio-data';

const spiralItems = projects.map(p => ({ id:p.id, src:p.image, alt:p.title, label:p.title, href:`#/works/${p.category}/${p.id}` }));
export default function Portfolio() {
  const [route, setRoute] = useState('/');

  useEffect(() => {
    const sync = () => setRoute(window.location.hash.slice(1) || '/');
    sync(); window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  const parts = route.split('/').filter(Boolean);
  const cat = categories.find(c=>c.id===parts[1]) || categories[0];
  const project = projects.find(p=>p.id===parts[2]) || projects[0];

  return <GlowCursor className="portfolio-cursor" color="#7C3AED" secondaryColor="#A78BFA" trailLength={40} trailWidth={8} trailTaper={0.8} followSpeed={0.16} glowIntensity={route === '/' ? 0.6 : 1.9} glowSpread={1.2} hotspot={0.65} brightness={1.25} opacity={route === '/' ? 0.35 : 1} pulseSpeed={1.1} noiseStrength={0.035} idleFade idleTimeout={700} fadeDuration={900} blendMode="screen"><div className="portfolio-shell">
    <PortfolioNavigation route={route}/>
    {route==='/' ? <RingHome/>
    : parts[0]==='works' && parts.length<3 ? <main className="spiral-works"><div className="spiral-heading"><a className="back-link" href="#/">← 首页</a><h1>全部作品</h1><p>{projects.length} 个项目 · 拖动浏览，点击进入</p></div><div className="spiral-canvas"><InfiniteSpiral items={spiralItems} animationMode="all" speed={0.55} radius={170} cardWidth={100} cardHeight={100} verticalSpacing={60} perspective={1000} cardRadius={10} centerScale={1.2} edgeBlur={6} cardsPerTurn={7} pauseOnHover /></div></main>
    : parts[0]==='works' && parts.length===3 ? <main className="detail-page"><a className="back-link" href="#/works">← 全部作品</a><p className="eyebrow">PROJECT PREVIEW / 04</p><h1>{project.title}</h1><div className="project-carousel"><DepthCarousel key={project.id} items={project.images} cardWidth={660} cardHeight={420} depth={220} spread={90} tilt={22} tiltDirection="right" perspective={1400} visibleCards={4} falloff={0.2} blur={6} autoplay loop/></div><p className="muted">{project.images.length} 张效果图</p></main>
    : <main className="info-page"><a className="back-link" href="#/">← 首页</a><p className="eyebrow">{parts[0]==='about'?'ABOUT':'CONTACT'}</p><h1>{parts[0]==='about'?'关于我':'联系我'}</h1><p className="muted">{parts[0]==='about'?'个人介绍与工作经历将在这里补充。':'联系方式将在这里补充。'}</p></main>}
  </div></GlowCursor>;
}
