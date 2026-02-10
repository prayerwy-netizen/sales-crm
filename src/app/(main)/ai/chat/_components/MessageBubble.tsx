'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  time?: string;
}

export function MessageBubble({ role, content, time }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div className={cn(
        'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
        isUser ? 'bg-primary' : 'bg-slate-100'
      )}>
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className={cn(
        'max-w-[70%] rounded-xl px-4 py-2.5',
        isUser
          ? 'bg-primary text-white'
          : 'glass-card'
      )}>
        <p className={cn(
          'text-sm leading-relaxed',
          isUser ? 'text-white' : 'text-slate-700'
        )}>
          {content}
        </p>
        {time && (
          <p className={cn(
            'text-[10px] mt-1',
            isUser ? 'text-white/60' : 'text-slate-400'
          )}>
            {time}
          </p>
        )}
      </div>
    </div>
  );
}
