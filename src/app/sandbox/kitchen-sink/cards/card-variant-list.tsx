import { TypographyMuted } from "@/components/typography";
import { Surface } from "@/components/ui/container";

import { CardReferenceName } from "./card-reference-name";

type CardVariantListItem = {
  name: string;
  description: string;
};

export function CardVariantList({ items }: { items: CardVariantListItem[] }) {
  return (
    <Surface className="mt-4 space-y-3 p-4">
      <TypographyMuted className="font-mono text-xs tracking-widest uppercase">
        Variant inventory
      </TypographyMuted>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <div key={item.name} className="min-w-0 space-y-1">
            <CardReferenceName name={item.name} />
            <TypographyMuted className="text-xs leading-relaxed">
              {item.description}
            </TypographyMuted>
          </div>
        ))}
      </div>
    </Surface>
  );
}
