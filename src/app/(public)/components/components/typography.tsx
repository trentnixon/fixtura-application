import { TypographyBlockquote } from "@/components/typography/blockquote";
import { TypographyBrand } from "@/components/typography/brand";
import { TypographyH1 } from "@/components/typography/h1";
import { TypographyH2 } from "@/components/typography/h2";
import { TypographyH3 } from "@/components/typography/h3";
import { TypographyH4 } from "@/components/typography/h4";
import { TypographyInlineCode } from "@/components/typography/inline-code";
import { TypographyLarge } from "@/components/typography/large";
import { TypographyLead } from "@/components/typography/lead";
import { TypographyList } from "@/components/typography/list";
import { TypographyMuted } from "@/components/typography/muted";
import { TypographyP } from "@/components/typography/p";
import { TypographySmall } from "@/components/typography/small";

export function TypographyPanel() {
  return (
    <div className="grid gap-8">
      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Overview</h2>
        <p className="text-muted-foreground text-sm">
          We do not ship any typography styles by default. This panel shows how to use utility
          classes to style text elements.
        </p>
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Headings</h2>
        <TypographyH1>H1 – The quick brown fox</TypographyH1>
        <TypographyH2>H2 – The quick brown fox</TypographyH2>
        <TypographyH3>The Joke Tax</TypographyH3>
        <TypographyH4>People stopped telling jokes</TypographyH4>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Paragraph</h2>
        <TypographyP>
          Standard body copy for general content. Utility classes control spacing, line-height and
          weight.
        </TypographyP>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Blockquote</h2>
        <TypographyBlockquote>“You miss 100% of the shots you don’t take.”</TypographyBlockquote>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Table</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-muted-foreground">
              <tr>
                <th className="border-b p-2 font-medium">Name</th>
                <th className="border-b p-2 font-medium">Role</th>
                <th className="border-b p-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">Jane Doe</td>
                <td className="p-2">Designer</td>
                <td className="p-2">Active</td>
              </tr>
              <tr className="bg-muted/30">
                <td className="p-2">John Smith</td>
                <td className="p-2">Engineer</td>
                <td className="p-2">Invited</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">List</h2>
        <TypographyList>
          <li>First item</li>
          <li>Second item</li>
          <li>Third item</li>
        </TypographyList>
      </section>

      <section className="grid gap-2">
        <h2 className="text-lg font-semibold">Inline code</h2>
        <TypographyInlineCode>npm run dev</TypographyInlineCode>
      </section>

      <section className="grid gap-4">
        <h2 className="text-lg font-semibold">Lead / Large / Small / Muted / Brand</h2>
        <TypographyLead>Lead paragraph for emphasis.</TypographyLead>
        <TypographyLarge>Large text for highlights.</TypographyLarge>
        <TypographySmall>Small helper text.</TypographySmall>
        <TypographyMuted>Muted foreground content.</TypographyMuted>
        <TypographyBrand />
      </section>
    </div>
  );
}
