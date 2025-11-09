'use client';

import { useMemo } from 'react';
import { DndContext, DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Calendar, User, MessageSquare, Paperclip } from 'lucide-react';
import { getPriorityLabel, getPriorityColor } from '@/lib/utils/helpers';
import type { Database } from '@/lib/supabase/database.types';

type Task = Database['public']['Tables']['tasks']['Row'];

interface TaskCardProps {
  task: Task;
  locale?: string;
}

function TaskCard({ task, locale = 'ar' }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="mb-3"
    >
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
        {/* Title */}
        <h4 className="font-medium mb-2 line-clamp-2">
          {locale === 'ar' ? task.title_ar : task.title_en || task.title_ar}
        </h4>

        {/* Priority Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)} bg-opacity-10`}>
            {getPriorityLabel(task.priority, locale)}
          </span>
        </div>

        {/* Due Date */}
        {task.due_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <Calendar className="h-4 w-4" />
            <span>{new Date(task.due_date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}</span>
          </div>
        )}

        {/* Footer Icons */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>0</span>
          </div>
          <div className="flex items-center gap-1">
            <Paperclip className="h-3 w-3" />
            <span>0</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface KanbanColumnProps {
  status: string;
  statusLabel: string;
  tasks: Task[];
  locale?: string;
}

function KanbanColumn({ status, statusLabel, tasks, locale = 'ar' }: KanbanColumnProps) {
  const taskIds = useMemo(() => tasks.map(t => t.id), [tasks]);

  return (
    <div className="flex-shrink-0 w-80">
      {/* Column Header */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-t-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">{statusLabel}</h3>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-b-lg p-4 min-h-[500px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} locale={locale} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMove?: (taskId: string, newStatus: string) => void;
  locale?: string;
}

export function KanbanBoard({ tasks, onTaskMove, locale = 'ar' }: KanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const statuses = [
    { id: 'جديد', label: 'جديد' },
    { id: 'قيد التنفيذ', label: 'قيد التنفيذ' },
    { id: 'قيد المراجعة', label: 'قيد المراجعة' },
    { id: 'مكتمل', label: 'مكتمل' },
  ];

  const tasksByStatus = useMemo(() => {
    return statuses.reduce((acc, status) => {
      acc[status.id] = tasks.filter(t => t.status === status.id);
      return acc;
    }, {} as Record<string, Task[]>);
  }, [tasks]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    if (onTaskMove) {
      onTaskMove(taskId, newStatus);
    }
  };

  return (
    <div className="overflow-x-auto pb-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 min-w-max">
          {statuses.map(status => (
            <KanbanColumn
              key={status.id}
              status={status.id}
              statusLabel={status.label}
              tasks={tasksByStatus[status.id] || []}
              locale={locale}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
