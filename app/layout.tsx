import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'室外建筑 · 作品集',description:'室外建筑可视化作品集',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {return <html lang="zh-CN"><body>{children}</body></html>;}
