"use client";

import React, { useState } from "react";

import { Button } from "@/components/ui/button";

import { SaveOrderDialog } from "./components/SaveOrderDialog";
import { SortableList } from "./components/SortableList";
import { SortableSectionCard } from "./components/SortableSectionCard";
import {
  ALPHABET_SORT_ITEMS_MOCK,
  GROUPED_SORT_ITEMS_MOCK,
  TEAM_SORT_GROUPS_MOCK,
} from "./mock-data";

export function ListReorderClient() {
  const [flatItems, setFlatItems] = useState(ALPHABET_SORT_ITEMS_MOCK);
  const [groupedItems, setGroupedItems] = useState(GROUPED_SORT_ITEMS_MOCK);
  const [teamGroups, setTeamGroups] = useState(TEAM_SORT_GROUPS_MOCK);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Reorder handler for grouped categories
  const handleGroupReorder = (groupId: string, newItems: any[]) => {
    setGroupedItems((prev) => prev.map((g) => (g.id === groupId ? { ...g, items: newItems } : g)));
  };

  // Reorder handler for team groups
  const handleTeamReorder = (groupId: string, newItems: any[]) => {
    setTeamGroups((prev) => prev.map((g) => (g.id === groupId ? { ...g, items: newItems } : g)));
  };

  return (
    <div className="space-y-10 pb-20">
      {/* 1. Flat Sortable List */}
      <SortableSectionCard
        title="Example 1 — Flat Sortable List"
        description="Demonstrating the simplest reorderable list pattern. Drag items to reorder them."
      >
        <SortableList items={flatItems} onReorder={setFlatItems} />
      </SortableSectionCard>

      {/* 2. Grouped Lists by Category */}
      <SortableSectionCard
        title="Example 2 — Grouped Lists by Category"
        description="Multiple independent sortable lists. Items cannot be dragged between categories."
      >
        <div className="space-y-8">
          {groupedItems.map((group) => (
            <div key={group.id} className="space-y-3">
              <h4 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
                {group.title}
              </h4>
              <SortableList
                items={group.items}
                onReorder={(newItems) => handleGroupReorder(group.id, newItems)}
              />
            </div>
          ))}
        </div>
      </SortableSectionCard>

      {/* 3. Team Ordering Within Groups */}
      <SortableSectionCard
        title="Example 3 — Team Ordering Within Groups"
        description="Realistic Fixtura-style team ordering. Includes secondary metadata in rows."
      >
        <div className="space-y-8">
          {teamGroups.map((group) => (
            <div key={group.id} className="space-y-3">
              <h4 className="text-foreground bg-muted rounded-md p-2 text-sm font-medium">
                {group.title}
              </h4>
              <SortableList
                items={group.items}
                onReorder={(newItems) => handleTeamReorder(group.id, newItems)}
              />
            </div>
          ))}
        </div>
      </SortableSectionCard>

      {/* Page-level Action */}
      <div className="bg-background/80 fixed right-0 bottom-0 left-0 z-10 flex w-full justify-end gap-4 border-t p-4 backdrop-blur-sm sm:pl-[250px] md:pl-[300px]">
        {/* Adjusting padding left assuming standard sidebar width so the button is centered/right properly if inside the layout, 
            but for the lab it might be within a container. We'll stick to a sticky positioning instead to be safe. */}
      </div>

      <div className="sticky bottom-4 mt-10 flex justify-end">
        <Button size="lg" onClick={() => setIsDialogOpen(true)} className="shadow-lg">
          Save Order
        </Button>
      </div>

      <SaveOrderDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}
