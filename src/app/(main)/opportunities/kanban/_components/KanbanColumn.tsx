'use client';

import { Droppable, Draggable } from '@hello-pangea/dnd';
import { OpportunityCard } from './OpportunityCard';
import { formatCurrency } from '@/lib/utils';
import type { Opportunity } from '@/types/opportunity';
import { useRouter } from 'next/navigation';

interface KanbanColumnProps {
  stageKey: string;
  label: string;
  color: string;
  opportunities: Opportunity[];
}

export function KanbanColumn({ stageKey, label, color, opportunities }: KanbanColumnProps) {
  const router = useRouter();
  const totalAmount = opportunities.reduce((s, o) => s + o.expectedAmount, 0);

  return (
    <div className="kanban-column flex-1 min-w-[240px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          <span className="text-xs text-slate-400 bg-slate-200/60 rounded-full px-1.5">
            {opportunities.length}
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {formatCurrency(totalAmount)}
        </span>
      </div>

      <Droppable droppableId={stageKey}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-2.5 min-h-[400px] rounded-lg p-1 transition-colors ${
              snapshot.isDraggingOver ? 'bg-primary/5' : ''
            }`}
          >
            {opportunities.map((opp, index) => (
              <Draggable key={opp.id} draggableId={opp.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <OpportunityCard
                      opportunity={opp}
                      onClick={() => router.push(`/opportunities/${opp.id}`)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
