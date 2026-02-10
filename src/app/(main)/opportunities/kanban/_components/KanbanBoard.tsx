'use client';

import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import { STAGES } from '@/lib/constants';
import type { Opportunity } from '@/types/opportunity';
import { useState, useEffect } from 'react';

interface KanbanBoardProps {
  initialOpportunities: Opportunity[];
}

export function KanbanBoard({ initialOpportunities }: KanbanBoardProps) {
  const [opportunities, setOpportunities] = useState(initialOpportunities);

  useEffect(() => {
    setOpportunities(initialOpportunities);
  }, [initialOpportunities]);

  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId as Opportunity['stage'];

    // 乐观更新本地状态
    setOpportunities((prev) =>
      prev.map((opp) =>
        opp.id === draggableId ? { ...opp, stage: newStage } : opp
      )
    );

    // 持久化到后端
    try {
      await fetch(`/api/opportunities/${draggableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
    } catch {
      // 回滚
      setOpportunities((prev) =>
        prev.map((opp) =>
          opp.id === draggableId
            ? { ...opp, stage: source.droppableId as Opportunity['stage'] }
            : opp
        )
      );
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage.key}
            stageKey={stage.key}
            label={stage.label}
            color={stage.color}
            opportunities={opportunities.filter((o) => o.stage === stage.key)}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
