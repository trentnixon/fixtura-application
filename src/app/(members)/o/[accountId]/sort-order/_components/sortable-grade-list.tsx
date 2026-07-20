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
import { useId, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { GradeOrderingGradeLookup } from "../_hooks/use-grade-ordering-editor";
import type { GradeOrderingDraftGroup } from "../_utils/grade-ordering-draft";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";

type SortableGradeRowProps = {
  gradeId: number;
  displayIndex: number;
  gradeLookup: GradeOrderingGradeLookup;
};

function GradeRowContent({ gradeId, displayIndex, gradeLookup }: SortableGradeRowProps) {
  const item = gradeLookup.get(gradeId);
  const label = item?.gradeName ?? `Grade ${gradeId}`;

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
      <p className="truncate text-sm font-medium">{label}</p>
      <Badge variant="secondary" className="flex-shrink-0">
        {displayIndex}
      </Badge>
    </div>
  );
}

function SortableGradeRow({ gradeId, displayIndex, gradeLookup }: SortableGradeRowProps) {
  const item = gradeLookup.get(gradeId);
  const label = item?.gradeName ?? `Grade ${gradeId}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(gradeId),
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
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="hover:bg-muted text-muted-foreground flex-shrink-0 cursor-grab rounded-md p-1"
        aria-label={`Drag ${label}`}
      >
        <GripVertical className="h-5 w-5" aria-hidden />
      </button>
      <GradeRowContent gradeId={gradeId} displayIndex={displayIndex} gradeLookup={gradeLookup} />
    </div>
  );
}

export function SortableGradeList({
  group,
  gradeLookup,
  onReorder,
  disabled,
}: {
  group: GradeOrderingDraftGroup;
  gradeLookup: GradeOrderingGradeLookup;
  onReorder: (itemIds: number[]) => void;
  disabled?: boolean;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const dndId = useId();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const itemIds = useMemo(() => group.itemIds.map(String), [group.itemIds]);

  const handleDragStart = (event: DragStartEvent) => {
    if (disabled) return;
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (disabled) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = group.itemIds.findIndex((id) => String(id) === active.id);
    const newIndex = group.itemIds.findIndex((id) => String(id) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const nextIds = arrayMove(group.itemIds, oldIndex, newIndex);
    onReorder(nextIds);
  };

  const activeItem = activeId ? group.itemIds.find((id) => String(id) === activeId) : undefined;

  return (
    <DndContext
      id={dndId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2" role="list" aria-label={`${group.label} grades`}>
          {group.itemIds.map((gradeId, index) => (
            <SortableGradeRow
              key={gradeId}
              gradeId={gradeId}
              displayIndex={index + 1}
              gradeLookup={gradeLookup}
            />
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
        {activeItem !== undefined ? (
          <div className="bg-card flex w-full cursor-grabbing items-center gap-3 rounded-md border p-3 opacity-90 shadow-xl">
            <div className="text-muted-foreground flex-shrink-0 rounded-md p-1">
              <GripVertical className="h-5 w-5" aria-hidden />
            </div>
            <GradeRowContent
              gradeId={activeItem}
              displayIndex={group.itemIds.findIndex((id) => id === activeItem) + 1}
              gradeLookup={gradeLookup}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
