import Link from "next/link";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AvatarPanel } from "./components/avatar";
import { BrandColorsPanel } from "./components/brand-colors";
import { ButtonsPanel } from "./components/buttons";
import { CardsPanel } from "./components/cards";
import { CarouselPanel } from "./components/carousel";
import { CommandPanel } from "./components/command";
import { ContainerOptionsPanel } from "./components/containers";
import { DialogsPanel } from "./components/dialogs";
import { FormsPanel } from "./components/forms";
import { InputsPanel } from "./components/inputs";
import { LoadingPanel } from "./components/loading";
import { NavigationPanel } from "./components/navigation";
import { PopoversPanel } from "./components/popovers";
import { StatesPanel } from "./components/states";
import { TablesPanel } from "./components/tables";
import { ToastsPanel } from "./components/toasts";
import { TypographyPanel } from "./components/typography";

export default function ComponentsPage() {
  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Components Showcase</h1>
        <Link className="text-sm underline" href="/">
          Back home
        </Link>
      </div>

      <Tabs defaultValue="buttons" className="w-full">
        <TabsList>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="brand-colors">Brand Colors</TabsTrigger>
          <TabsTrigger value="containers">Containers</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="toasts">Toasts</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="dialogs">Dialogs</TabsTrigger>
          <TabsTrigger value="tables">Tables</TabsTrigger>
          <TabsTrigger value="popovers">Popovers</TabsTrigger>
          <TabsTrigger value="loading">Loading</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="avatar">Avatar</TabsTrigger>
          <TabsTrigger value="carousel">Carousel</TabsTrigger>
          <TabsTrigger value="command">Command</TabsTrigger>
        </TabsList>

        <TabsContent value="typography">
          <TypographyPanel />
        </TabsContent>

        <TabsContent value="brand-colors">
          <BrandColorsPanel />
        </TabsContent>

        <TabsContent value="containers">
          <ContainerOptionsPanel />
        </TabsContent>

        <TabsContent value="navigation">
          <NavigationPanel />
        </TabsContent>

        <TabsContent value="buttons">
          <ButtonsPanel />
        </TabsContent>

        <TabsContent value="cards">
          <CardsPanel />
        </TabsContent>

        <TabsContent value="states">
          <StatesPanel />
        </TabsContent>

        <TabsContent value="toasts">
          <ToastsPanel />
        </TabsContent>

        <TabsContent value="forms">
          <FormsPanel />
        </TabsContent>

        <TabsContent value="dialogs">
          <DialogsPanel />
        </TabsContent>

        <TabsContent value="popovers">
          <PopoversPanel />
        </TabsContent>

        <TabsContent value="tables">
          <TablesPanel />
        </TabsContent>

        <TabsContent value="loading">
          <LoadingPanel />
        </TabsContent>

        <TabsContent value="inputs">
          <InputsPanel />
        </TabsContent>

        <TabsContent value="avatar">
          <AvatarPanel />
        </TabsContent>

        <TabsContent value="carousel">
          <CarouselPanel />
        </TabsContent>

        <TabsContent value="command">
          <CommandPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
