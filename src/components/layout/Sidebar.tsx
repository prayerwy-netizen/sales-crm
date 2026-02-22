'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Kanban,
  List,
  Users,
  Handshake,
  MessageSquare,
  Bot,
  FileText,
  Settings,
  ChevronDown,
  Sparkles,
  BarChart3,
  FolderOpen,
  Database,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: '工作台', href: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  {
    label: '商机管理',
    icon: <Kanban className="h-4 w-4" />,
    children: [
      { label: '商机看板', href: '/opportunities/kanban' },
      { label: '商机列表', href: '/opportunities/list' },
      { label: '商机统计', href: '/opportunities/stats' },
    ],
  },
  {
    label: '客户管理',
    icon: <Users className="h-4 w-4" />,
    children: [
      { label: '终端客户', href: '/customers' },
      { label: '生态合作伙伴', href: '/partners' },
      { label: '基础客户库', href: '/customers/base' },
      { label: '沟通记录', href: '/customers/communications' },
      { label: '客户统计', href: '/customers/stats' },
    ],
  },
  {
    label: 'AI助手',
    icon: <Bot className="h-4 w-4" />,
    children: [
      { label: 'AI对话录入', href: '/ai/chat' },
      { label: '品牌内容生成', href: '/ai/brand-content' },
      { label: 'AI分析报告', href: '/ai/reports' },
    ],
  },
  { label: '产品资源库', href: '/resources', icon: <FolderOpen className="h-4 w-4" /> },
  { label: '系统设置', href: '/settings', icon: <Settings className="h-4 w-4" /> },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    '商机管理': true,
    '客户管理': true,
    'AI助手': true,
  });

  const toggle = (label: string) => {
    setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="glass-sidebar w-[220px] h-screen flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-200/50">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800">销售红宝书</h1>
          <p className="text-[10px] text-slate-400">智能运营系统</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
        {navItems.map((item) => {
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggle(item.label)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100/60 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    {item.label}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 transition-transform',
                      expanded[item.label] && 'rotate-180'
                    )}
                  />
                </button>
                {expanded[item.label] && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors',
                          isActive(child.href)
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/60'
                        )}
                      >
                        <span className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          isActive(child.href) ? 'bg-primary' : 'bg-slate-300'
                        )} />
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors',
                isActive(item.href!)
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/60'
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
