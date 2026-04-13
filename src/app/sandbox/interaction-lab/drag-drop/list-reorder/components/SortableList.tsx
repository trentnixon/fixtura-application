"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import React, { useMemo, useState, useId } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

export type BaseSortItem = {
  id: string;
  label: string;
  subtitle?: string;
  order: number;
};

interface SortableListProps<T extends BaseSortItem> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem?: (item: T, isOverlay?: boolean) => React.ReactNode;
}

export function SortableList<T extends BaseSortItem>({
  items,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newItems = arrayMove(items, oldIndex, newIndex);
      // Re-assign order purely visually if backend order mattered
      onReorder(
        newItems.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
      );
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const itemIds = useMemo(() => items.map((i) => i.id), [items]);
  const activeItem = useMemo(() => items.find((i) => i.id === activeId), [activeId, items]);

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <SortableListItem key={item.id} item={item}>
              {renderItem ? renderItem(item) : <DefaultItemContent item={item} />}
            </SortableListItem>
          ))}
        </div>
      </SortableContext>
      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: { active: { opacity: "0.5" } },
          }),
        }}
      >
        {activeItem ? (
          <div className="bg-card flex w-full cursor-grabbing items-center gap-3 rounded-md border p-3 opacity-90 shadow-xl">
            {renderItem ? renderItem(activeItem, true) : <DefaultItemContent item={activeItem} />}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface SortableListItemProps {
  item: BaseSortItem;
  children: React.ReactNode;
}

export function SortableListItem({ item, children }: SortableListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-card group flex w-full items-center gap-3 rounded-md border p-3 shadow-sm",
        isDragging && "opacity-50",
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="hover:bg-muted text-muted-foreground flex-shrink-0 cursor-grab rounded-md p-1"
        aria-label={`Drag ${item.label}`}
      >
        <GripVertical className="h-5 w-5" />
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between">{children}</div>
    </div>
  );
}

function DefaultItemContent({ item }: { item: BaseSortItem }) {
  return (
    <>
      <div className="flex min-w-0 flex-col justify-center overflow-hidden">
        <span className="truncate text-sm font-medium">{item.label}</span>
        {item.subtitle && (
          <span className="text-muted-foreground truncate text-xs">{item.subtitle}</span>
        )}
      </div>
      <Badge variant="secondary" className="ml-2 flex-shrink-0">
        {item.order}
      </Badge>
    </>
  );
}
