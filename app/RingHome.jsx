import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { projects, categories } from './portfolio-data';
import './RingHome.css';
const INTRO_KEY='shaokang-home-intro-v1';
let introPlayed=false;
const featuredProjects=projects.filter(project=>project.importedFrom!=='zcool');
export default function RingHome(){
 const root=useRef(null),camera=useRef(null),ring=useRef(null),cards=useRef([]);
 const motion=useRef({angle:0,target:0,paused:false,dragging:false,lastX:0,distance:0});
 const [active,setActive]=useState(0),[ready,setReady]=useState(false);
 const step=360/featuredProjects.length;
 useEffect(()=>{
  const host=root.current,reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let seen=introPlayed;try{seen ||= sessionStorage.getItem(INTRO_KEY)==='1';}catch{}
  const isHome=!window.location.hash||['#/','#'].includes(window.location.hash),intro=!seen&&!reduced&&isHome;
  if(isHome){introPlayed=true;try{sessionStorage.setItem(INTRO_KEY,'1');}catch{}}
  host.dataset.intro=intro?'playing':'complete';
  let radius=420,frame=0,last=0,running=!intro,mounted=true;const shape={mix:intro?0:1};
  const size=()=>{const w=host.clientWidth,c=Math.min(300,w*.225,host.clientHeight*.30);radius=c*1.85;host.style.setProperty('--ring-radius',`${radius}px`);host.style.setProperty('--ring-card-width',`${c}px`);};
  size();const observer=new ResizeObserver(size);observer.observe(host);
  const reveal=()=>{running=true;setReady(true);host.dataset.intro='complete';};
  const context=gsap.context(()=>{
   if(intro){gsap.set(camera.current,{rotateX:-78,scale:.62,y:-85});gsap.set('.ring-home-copy, .ring-home-nav, .ring-home-footer, .ring-controls',{opacity:0,y:12});gsap.timeline({onComplete:reveal}).to(camera.current,{rotateX:-20,scale:1.06,y:-20,duration:1.55,ease:'power3.inOut'},.15).to(camera.current,{rotateX:0,scale:1,y:0,duration:.95,ease:'power3.out'},1.55).to(shape,{mix:1,duration:.95,ease:'power3.out'},1.55).to('.ring-home-copy, .ring-home-nav, .ring-home-footer, .ring-controls',{opacity:1,y:0,stagger:.08,duration:.65},1.85);}else reveal();
  },host);
  const render=time=>{if(!mounted||!ring.current)return;const dt=Math.min((time-(last||time))/1000,.05);last=time;const m=motion.current;if(running&&!reduced&&!m.paused&&!m.dragging&&!document.hidden)m.target-=dt*4;m.angle+=(m.target-m.angle)*(1-Math.exp(-dt*9));ring.current.style.transform=`translateZ(${-radius}px)`;cards.current.forEach((card,i)=>{if(!card)return;const angle=((i*step+m.angle+180)%360+360)%360-180;const a=angle*Math.PI/180;const facing=Math.cos(a);card.style.transform=`translate3d(${Math.sin(a)*radius+angle/80*radius*.12*shape.mix}px,0,${radius-(1-Math.cos(a))*radius*(1-.72*shape.mix)}px) rotateY(${angle*(1-.28*shape.mix)}deg)`;card.style.opacity=String(Math.max(0,Math.min(1,(104-Math.abs(angle))/16)));card.style.filter=`brightness(${.7+.3*Math.max(0,facing)})`;card.style.pointerEvents=running&&facing>.12?'auto':'none';card.tabIndex=running&&facing>.12?0:-1;});const index=((Math.round(-m.angle/step)%featuredProjects.length)+featuredProjects.length)%featuredProjects.length;setActive(p=>p===index?p:index);if(mounted)frame=requestAnimationFrame(render);};
  frame=requestAnimationFrame(render);return()=>{mounted=false;cancelAnimationFrame(frame);observer.disconnect();context.revert();};
 },[step]);
 const move=d=>{const m=motion.current;m.target=Math.round(m.target/step)*step+d*step;};
 const release=e=>{const m=motion.current;if(m.dragging&&m.distance>6&&e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);m.dragging=false;};
 return <main className="ring-home" ref={root}>
  <div className="ring-home-copy"><p>ARCHITECTURAL &amp; LANDSCAPE VISUALIZATION</p><h1>以光影，<br/>呈现空间。</h1></div>
  <section className="ring-stage" aria-label="精选作品环形画廊" onPointerEnter={()=>{motion.current.paused=true;}} onPointerLeave={()=>{motion.current.paused=false;motion.current.dragging=false;}} onFocusCapture={()=>{motion.current.paused=true;}} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))motion.current.paused=false;}}
   onWheel={e=>{if(!ready)return;motion.current.target-=Math.max(-100,Math.min(100,e.deltaX||e.deltaY))*.08;}} onPointerDown={e=>{if(!ready||e.button!==0)return;Object.assign(motion.current,{dragging:true,lastX:e.clientX,distance:0});}}
   onPointerMove={e=>{const m=motion.current;if(!m.dragging)return;const dx=e.clientX-m.lastX;m.lastX=e.clientX;m.distance+=Math.abs(dx);m.target+=dx*.15;if(m.distance>6)e.currentTarget.setPointerCapture(e.pointerId);}}
   onPointerUp={release} onPointerCancel={release} onClickCapture={e=>{if(motion.current.distance>6){e.preventDefault();e.stopPropagation();motion.current.distance=0;}}}
   onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(-1);}if(e.key==='ArrowLeft'){e.preventDefault();move(1);}}}>
   <div className="ring-camera" ref={camera}><div className="project-ring" ref={ring}>{featuredProjects.map((p,i)=><a className="ring-card" key={p.id} ref={el=>{cards.current[i]=el;}} href={`#/works/${p.category}/${p.id}`} style={{transform:`rotateY(${i*step}deg) translateZ(var(--ring-radius))`}} aria-label={`查看${p.title}`} draggable="false"><img src={p.image} alt={p.title} draggable="false" fetchPriority={i===0?'high':'auto'}/><div className="ring-card-caption"><span>{categories.find(c=>c.id===p.category)?.name}</span><h2>{p.title}</h2></div></a>)}</div></div>
  </section>
  <div className="ring-controls"><button type="button" onClick={()=>move(1)} aria-label="上一个精选项目" disabled={!ready}>←</button><span>{String(active+1).padStart(2,'0')}<i>/</i>{String(featuredProjects.length).padStart(2,'0')}</span><button type="button" onClick={()=>move(-1)} aria-label="下一个精选项目" disabled={!ready}>→</button></div>
  <footer className="ring-home-footer"><span>建筑 · 景观 · 空间可视化</span><a href="#/works">全部作品 <span>↗</span></a><span className="ring-hint">拖动浏览 / 点击进入项目</span></footer>
 </main>;
}
