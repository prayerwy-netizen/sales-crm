'use client';

import { Bell, Search, User } from 'lucide-react';
import { useState } from 'react';

export function TopHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="glass-topbar h-14 flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索商机、客户、合作伙伴..."
          className="w-full rounded-lg border border-slate-200 bg-white/60 pl-9 pr-3 py-1.5 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 hover:bg-slate-100/60 transition-colors">
          <Bell className="h-4.5 w-4.5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-slate-700">王明</p>
            <p className="text-[10px] text-slate-400">销售经理</p>
          </div>
        </div>
      </div>
    </header>
  );
}
