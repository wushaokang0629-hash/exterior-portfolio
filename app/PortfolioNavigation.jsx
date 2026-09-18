import CardNav from '../components/react-bits/CardNav';
import './PortfolioNavigation.css';
const items = [
  { label: '关于', bgColor: '#1B1722', textColor: '#fff', links: [
    { label: '返回首页', ariaLabel: '返回首页', href: '#/' },
    { label: '关于我', ariaLabel: '了解我的背景', href: '#/about' }
  ] },
  { label: '作品', bgColor: '#2F293A', textColor: '#fff', links: [
    { label: '全部项目', ariaLabel: '浏览全部项目', href: '#/works' }
  ] },
  { label: '联系', bgColor: '#2F293A', textColor: '#fff', links: [
    { label: '联系我', ariaLabel: '查看联系方式', href: '#/contact' }
  ] }
];
export default function PortfolioNavigation({ route }) {
  return <header className="portfolio-card-header" onKeyDown={e => { if(e.key === 'Escape') e.currentTarget.querySelector('[aria-expanded="true"]')?.click(); }}>
    <CardNav key={route} logo="./wordmark-dark.svg" logoAlt="SHAOKANG." items={items} baseColor="#fff" menuColor="#000" buttonBgColor="#111" buttonTextColor="#fff" ease="power3.out" />
  </header>;
}