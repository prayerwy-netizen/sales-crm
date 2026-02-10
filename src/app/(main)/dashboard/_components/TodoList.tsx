'use client';

import { GlassCard } from '@/components/ui';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { useState } from 'react';

interface TodoItem {
  id: string;
  content: string;
  executor: string;
  dueDate: string;
  completed: boolean;
}

const initialTodos: TodoItem[] = [
  { id: '1', content: '收集竞争对手最新报价信息', executor: '王明', dueDate: '2026-02-08', completed: false },
  { id: '2', content: '完成需求调研报告', executor: '张伟', dueDate: '2026-02-10', completed: false },
  { id: '3', content: '完成替换方案对比文档', executor: '张伟', dueDate: '2026-02-12', completed: false },
  { id: '4', content: '安排CEO与华电集团副总会面', executor: '王明', dueDate: '2026-02-15', completed: false },
  { id: '5', content: '准备技术方案第二版', executor: '李强', dueDate: '2026-02-20', completed: false },
];

export function TodoList() {
  const [todos, setTodos] = useState(initialTodos);

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <GlassCard className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          待办事项
        </h3>
        <span className="text-xs text-slate-400">
          {todos.filter((t) => !t.completed).length} 项待完成
        </span>
      </div>
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50/80 cursor-pointer transition-colors"
          >
            {todo.completed ? (
              <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
            ) : (
              <Circle className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                {todo.content}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {todo.executor} · 截止 {todo.dueDate}
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
