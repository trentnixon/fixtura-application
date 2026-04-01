"use client";

import { Icon } from "@/components/ui/icon";

export function IconsPanel() {
  const iconCategories = [
    {
      title: "Common Actions",
      icons: [
        { name: "Check", component: Icon.Check },
        { name: "X", component: Icon.X },
        { name: "Plus", component: Icon.Plus },
        { name: "Minus", component: Icon.Minus },
        { name: "Edit", component: Icon.Edit },
        { name: "Trash", component: Icon.Trash },
        { name: "Copy", component: Icon.Copy },
        { name: "Share", component: Icon.Share },
      ],
    },
    {
      title: "Navigation",
      icons: [
        { name: "Home", component: Icon.Home },
        { name: "Search", component: Icon.Search },
        { name: "Menu", component: Icon.Menu },
        { name: "ArrowRight", component: Icon.ArrowRight },
        { name: "ArrowLeft", component: Icon.ArrowLeft },
        { name: "ChevronRight", component: Icon.ChevronRight },
        { name: "ChevronLeft", component: Icon.ChevronLeft },
        { name: "ChevronUp", component: Icon.ChevronUp },
      ],
    },
    {
      title: "User & Settings",
      icons: [
        { name: "User", component: Icon.User },
        { name: "Settings", component: Icon.Settings },
        { name: "Mail", component: Icon.Mail },
        { name: "Phone", component: Icon.Phone },
        { name: "Bell", component: Icon.Bell },
        { name: "Lock", component: Icon.Lock },
        { name: "Unlock", component: Icon.Unlock },
        { name: "Key", component: Icon.Key },
      ],
    },
    {
      title: "Status & Feedback",
      icons: [
        { name: "CheckCircle", component: Icon.CheckCircle },
        { name: "XCircle", component: Icon.XCircle },
        { name: "AlertCircle", component: Icon.AlertCircle },
        { name: "AlertTriangle", component: Icon.AlertTriangle },
        { name: "Info", component: Icon.Info },
        { name: "HelpCircle", component: Icon.HelpCircle },
        { name: "Star", component: Icon.Star },
        { name: "Heart", component: Icon.Heart },
      ],
    },
    {
      title: "Media & Files",
      icons: [
        { name: "Image", component: Icon.Image },
        { name: "Video", component: Icon.Video },
        { name: "Camera", component: Icon.Camera },
        { name: "File", component: Icon.File },
        { name: "FileText", component: Icon.FileText },
        { name: "Folder", component: Icon.Folder },
        { name: "Download", component: Icon.Download },
        { name: "Upload", component: Icon.Upload },
      ],
    },
    {
      title: "Data & Charts",
      icons: [
        { name: "BarChart", component: Icon.BarChart },
        { name: "LineChart", component: Icon.LineChart },
        { name: "PieChart", component: Icon.PieChart },
        { name: "TrendingUp", component: Icon.TrendingUp },
        { name: "TrendingDown", component: Icon.TrendingDown },
        { name: "Activity", component: Icon.Activity },
        { name: "Database", component: Icon.Database },
        { name: "Server", component: Icon.Server },
      ],
    },
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Icon Library</h3>
        <p className="text-muted-foreground text-sm">
          Easy-to-use icon components with consistent styling. Import and use like{" "}
          <code className="bg-muted rounded px-1 py-0.5 text-xs">&lt;Icon.Check /&gt;</code>
        </p>
        <p className="text-muted-foreground text-xs">
          💡 Tip: You can change the underlying icon in the Icon namespace without updating
          component calls!
        </p>
      </div>

      <div className="grid gap-4">
        {iconCategories.map((category) => (
          <div key={category.title} className="grid gap-3">
            <h4 className="text-muted-foreground text-sm font-medium">{category.title}</h4>
            <div className="grid grid-cols-4 gap-4 sm:grid-cols-6 md:grid-cols-8">
              {category.icons.map((icon) => {
                const IconComponent = icon.component;
                return (
                  <div
                    key={icon.name}
                    className="hover:bg-muted/50 flex flex-col items-center gap-2 rounded-lg border p-3 transition-colors"
                  >
                    <IconComponent className="h-5 w-5" />
                    <span className="text-muted-foreground text-center text-xs">{icon.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-muted/50 grid gap-4 rounded-lg border p-4">
        <h4 className="text-sm font-medium">Usage Examples</h4>
        <div className="grid gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Icon.Check className="h-4 w-4 text-green-600" />
            <span>Success state with green color</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon.AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span>Warning state with yellow color</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon.XCircle className="h-4 w-4 text-red-600" />
            <span>Error state with red color</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon.Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading state with animation</span>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <h4 className="text-sm font-medium">Import Options</h4>
        <div className="grid gap-2 text-sm">
          <div className="bg-muted/50 rounded-lg border p-3">
            <p className="font-mono text-xs">
              {}
              import &#123; Icon &#125; from "@/components/ui/icon";
            </p>
            <p className="text-muted-foreground mt-1">
              Use: <code className="bg-background rounded px-1 py-0.5">{"<Icon.Check />"}</code>
            </p>
          </div>
          <div className="bg-muted/50 rounded-lg border p-3">
            <p className="font-mono text-xs">
              import &#123; Check, Star, Heart &#125; from "@/components/ui/icon";
            </p>
            <p className="text-muted-foreground mt-1">
              Use: <code className="bg-background rounded px-1 py-0.5">{"<Check />"}</code>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-2 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Icon Mapping Example
        </h4>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          In{" "}
          <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">
            src/components/ui/icon.tsx
          </code>
          :
        </p>
        <div className="rounded bg-blue-100 p-2 dark:bg-blue-900/50">
          <p className="font-mono text-xs text-blue-800 dark:text-blue-200">
            Check: Check, // You can change this to Check: CheckCircle to use a different icon
          </p>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Your component calls stay the same:{" "}
          <code className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900">
            {"<Icon.Check />"}
          </code>
        </p>
      </div>
    </div>
  );
}
