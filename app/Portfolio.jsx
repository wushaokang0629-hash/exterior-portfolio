'use client';
import { useEffect, useState } from 'react';
import RingHome from './RingHome';
import GlowCursor from '../components/react-bits/GlowCursor';
import StaggeredMenu from '../components/react-bits/StaggeredMenu';
import GooeyNav from '../components/react-bits/GooeyNav';
import DriftWall from '../components/react-bits/DriftWall';
import DepthCarousel from '../components/react-bits/DepthCarousel';
import { categories, projects } from './portfolio-data';

const menuItems = [
  { label: '首页', ariaLabel: '返回首页', link: '#/' },
  { label: '作品', ariaLabel: '浏览作品分类', link: '#/works' },
  { label: '关于', ariaLabel: '关于我', link: '#/about' },
  { label: '联系', ariaLabel: '联系方式', link: '#/contact' },
];
const gooeyItems = categories.map(c => ({label:c.name, href:`#category-${c.id}`}));
export default function Portfolio() {
  const [route, setRoute] = useState('/');
  const [category, setCategory] = useState(0);
  useEffect(() => {
    const sync = () => setRoute(window.location.hash.slice(1) || '/');
    sync(); window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  const parts = route.split('/').filter(Boolean);
  const cat = categories.find(c=>c.id===parts[1]) || categories[category];
  const project = projects.find(p=>p.id===parts[2]) || projects[0];
  const categoryProjects = cat.id === 'all' ? projects : projects.filter(p=>p.category===cat.id);
  const selectedCount = categories[category].id === 'all' ? projects.length : projects.filter(p=>p.category===categories[category].id).length;
  const wallItems = categoryProjects.map(p=>({image:p.image,title:p.title,href:`#/works/${cat.id}/${p.id}`}));
  const selectCategory = e => {
    const anchor = e.target.closest('a');
    if (!anchor || !anchor.hash.startsWith('#category-')) return;
    if (e.type === 'keydown' && !['Enter',' '].includes(e.key)) return;
    e.preventDefault();
    setCategory(categories.findIndex(c=>`#category-${c.id}`===anchor.hash));
  };
  const localWallLink = e => {
    const anchor = e.target.closest('a');
    if (anchor?.hash.startsWith('#/')) { e.preventDefault(); window.location.hash = anchor.hash; }
  };
  return <GlowCursor className="portfolio-cursor" color="#7C3AED" secondaryColor="#A78BFA" trailLength={40} trailWidth={8} trailTaper={0.8} followSpeed={0.16} glowIntensity={route === '/' ? 0.6 : 1.9} glowSpread={1.2} hotspot={0.65} brightness={1.25} opacity={route === '/' ? 0.35 : 1} pulseSpeed={1.1} noiseStrength={0.035} idleFade idleTimeout={700} fadeDuration={900} blendMode="screen"><div className="portfolio-shell">
    <div className="menu-layer" key={route} onKeyDown={e=>{if(e.key==='Escape') e.currentTarget.querySelector('[aria-expanded="true"]')?.click();}}>
      <StaggeredMenu position="right" items={menuItems} socialItems={[]} displaySocials={true} displayItemNumbering={true} menuButtonColor="#fff" openMenuButtonColor="#fff" changeMenuColorOnOpen={true} colors={['#B497CF','#5227FF']} logoUrl="./wordmark.svg" accentColor="#ff6b6b" isFixed={true}/>
    </div>
    {route==='/' ? <RingHome/>
    : parts[0]==='works' && parts.length===1 ? <main className="category-page"><a className="back-link" href="#/">← 首页</a><div className="page-heading"><p className="eyebrow">SELECT A CATEGORY</p><h1>作品分类<span> / 02</span></h1></div><div className="category-nav" onClick={selectCategory} onKeyDown={selectCategory}><GooeyNav items={gooeyItems} particleCount={15} particleDistances={[90,10]} particleR={100} initialActiveIndex={category} animationTime={600} timeVariance={300} colors={[1,2,3,1,2,3,1,4]}/></div><a className="category-entry" href={`#/works/${categories[category].id}`}><span className="category-number">0{category+1}</span><div><p className="eyebrow">{categories[category].english}</p><h2>{categories[category].name}</h2><p>{selectedCount ? `${selectedCount} 个项目` : '作品整理中'}</p></div><span className="entry-arrow">↗</span></a></main>
    : parts[0]==='works' && parts.length===2 ? <main className="wall-page"><div className="wall-heading"><a className="back-link" href="#/works">← 作品分类</a><h1>{cat.name}</h1><p>{categoryProjects.length} 个项目 · 点击进入项目</p></div><div className="wall-canvas" onClick={localWallLink}>{wallItems.length ? <DriftWall items={wallItems} columns={5} tileWidth={200} tileHeight={132} gap={18} tilt={16} turn={-14} perspective={1200} depth={120} speed={42} direction="up" variance={0.45} parallax={0.6} lift={64} fade={0.6} dim={0.55} overlayColor="#060010"/> : <div className="empty-projects"><p>该分类作品整理中</p><a href="#/works/all">浏览全部项目 ↗</a></div>}</div></main>
    : parts[0]==='works' && parts.length===3 ? <main className="detail-page"><a className="back-link" href={`#/works/${cat.id}`}>← {cat.name}</a><p className="eyebrow">PROJECT PREVIEW / 04</p><h1>{project.title}</h1><div className="project-carousel"><DepthCarousel key={project.id} items={project.images} cardWidth={660} cardHeight={420} depth={220} spread={90} tilt={22} tiltDirection="right" perspective={1400} visibleCards={4} falloff={0.2} blur={6} autoplay loop/></div><p className="muted">{project.images.length} 张效果图</p></main>
    : <main className="info-page"><a className="back-link" href="#/">← 首页</a><p className="eyebrow">{parts[0]==='about'?'ABOUT':'CONTACT'}</p><h1>{parts[0]==='about'?'关于我':'联系我'}</h1><p className="muted">{parts[0]==='about'?'个人介绍与工作经历将在这里补充。':'联系方式将在这里补充。'}</p></main>}
  </div></GlowCursor>;
}
