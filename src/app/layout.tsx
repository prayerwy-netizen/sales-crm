import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '销售红宝书 - 智能运营系统',
  description: 'AI驱动的销售智能运营系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="font-sans">{children}</body>
    </html>
  );
}
