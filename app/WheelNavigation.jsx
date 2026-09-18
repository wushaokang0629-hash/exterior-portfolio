import { useEffect, useState } from 'react';
import OptionWheel from '../components/react-bits/OptionWheel';
import './WheelNavigation.css';
const items = ['首页', '作品', '关于', '联系'];
const links = ['#/', '#/works', '#/about', '#/contact'];
export default function WheelNavigation({ route }) {
  const current = route.startsWith('/works') ? 1 : route === '/about' ? 2 : route === '/contact' ? 3 : 0;
  const [selected, setSelected] = useState(current);
  useEffect(() => setSelected(current), [current]);
  return <>
    <a className="wheel-brand" href="#/" aria-label="SHAOKANG 首页"><img src="./wordmark.svg" alt="SHAOKANG." /></a>
    <nav className="wheel-navigation" aria-label="主导航" onKeyDown={e => { if (e.key === 'Enter') window.location.hash = links[selected]; }}>
      <div className="wheel-navigation-picker">
        <OptionWheel key={current} items={items} defaultSelected={current} textColor="#a6a6a6" activeColor="#ffffff" side="left" fontSize={3} spacing={1.4} curve={1} tilt={6} blur={2} fade={0.25} smoothing={200} inset={80} loop={false} draggable soundVolume={0.5} onChange={index => setSelected(index)} />
      </div>
      <a className="wheel-navigation-enter" href={links[selected]}>进入{items[selected]} ↗</a>
    </nav>
  </>;
}