'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MessageBubble } from './_components/MessageBubble';
import { ParsedDataPreview, type ParsedField } from './_components/ParsedDataPreview';
import { Select } from '@/components/ui/Select';
import { Send } from 'lucide-react';
import { useDataList } from '@/hooks/useData';
import type { Opportunity } from '@/types/opportunity';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: '你好！我是AI录入助手。请选择要更新的商机，然后用自然语言描述你的拜访情况、客户反馈或竞争动态，我会帮你解析为结构化数据。',
    time: '10:00',
  },
];

export default function AIChatPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [selectedOpp, setSelectedOpp] = useState('');

  const { data: opportunities } = useDataList<Opportunity>('/api/opportunities');

  useEffect(() => {
    const id = searchParams.get('opportunityId');
    if (id) setSelectedOpp(id);
  }, [searchParams]);
  const [parsedFields, setParsedFields] = useState<ParsedField[]>([]);
  const [sending, setSending] = useState(false);
  const [writing, setWriting] = useState(false);

  const now = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const handleSend = useCallback(async () => {
    if (!input.trim() || sending) return;
    if (!selectedOpp) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '请先选择要更新的商机。',
        time: now(),
      }]);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      time: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    const text = input;
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/ai/chat-parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, opportunityId: selectedOpp, stage: opportunities.find(o => o.id === selectedOpp)?.stage }),
      });
      const data = await res.json();

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || '解析完成，请在右侧确认结果。',
        time: now(),
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (data.fields?.length) {
        const newFields: ParsedField[] = data.fields.map(
          (f: { dimension: string; dimensionKey?: string; field: string; value: string }, i: number) => ({
            id: `f-${Date.now()}-${i}`,
            dimension: f.dimension,
            dimensionKey: f.dimensionKey,
            field: f.field,
            value: f.value,
            confirmed: false,
          })
        );
        setParsedFields((prev) => [...prev, ...newFields]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，解析出错了，请重试。',
        time: now(),
      }]);
    } finally {
      setSending(false);
    }
  }, [input, sending, selectedOpp]);

  const handleConfirmAll = useCallback(async (confirmedFields: ParsedField[]) => {
    if (!selectedOpp) return;
    setWriting(true);
    try {
      // 按维度分组写入
      const byDim: Record<string, ParsedField[]> = {};
      for (const f of confirmedFields) {
        const key = f.dimensionKey || 'unknown';
        if (!byDim[key]) byDim[key] = [];
        byDim[key].push(f);
      }

      const dimKeys = Object.keys(byDim).filter((k) => k !== 'unknown');
      for (const dimKey of dimKeys) {
        const data: Record<string, string> = {};
        for (const f of byDim[dimKey]) {
          data[f.field] = f.value;
        }
        await fetch(`/api/opportunities/${selectedOpp}/dimensions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dimensionKey: dimKey,
            data,
            scores: {},
          }),
        });
      }

      setParsedFields([]);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `已成功将 ${confirmedFields.length} 条数据写入商机记录。你可以继续描述其他信息，或前往商机详情查看。`,
        time: now(),
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: '写入失败，请重试。',
        time: now(),
      }]);
    } finally {
      setWriting(false);
    }
  }, [selectedOpp]);

  const oppOptions = [
    { value: '', label: '请选择关联商机' },
    ...opportunities.map((o) => ({ value: o.id, label: o.name })),
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-slate-800">AI 对话录入</h2>

      <div className="flex gap-4 h-[calc(100vh-180px)]">
        {/* Left: Chat */}
        <div className="flex-1 flex flex-col glass-card p-0 overflow-hidden">
          {/* Opp selector */}
          <div className="p-3 border-b border-slate-200/50">
            <Select
              value={selectedOpp}
              onChange={(e) => setSelectedOpp(e.target.value)}
              options={oppOptions}
            />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                time={msg.time}
              />
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200/50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="描述你的拜访情况..."
                className="flex-1 rounded-lg border border-slate-300 bg-white/80 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={handleSend}
                className="rounded-lg bg-primary px-3 py-2 text-white hover:bg-primary-dark transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="w-80 shrink-0 overflow-y-auto scrollbar-thin">
          <ParsedDataPreview
            fields={parsedFields}
            onConfirmAll={handleConfirmAll}
            writing={writing}
          />
        </div>
      </div>
    </div>
  );
}
