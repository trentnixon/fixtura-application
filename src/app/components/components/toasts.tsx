"use client";

import { Button } from "@/components/ui/button";

export function ToastsPanel() {
  const fire = async (type: "success" | "error" | "warning" | "info" | "cta" | "loading") => {
    const m = await import("@/lib/notify");
    switch (type) {
      case "success":
        m.toastSuccess("Saved", "All good!");
        break;
      case "error":
        m.toastError(new Error("Something broke"));
        break;
      case "warning":
        (await import("sonner")).toast.warning("Heads up", { description: "Check your inputs" });
        break;
      case "info":
        (await import("sonner")).toast("Information", { description: "FYI message" });
        break;
      case "cta":
        (await import("sonner")).toast("Action required", {
          description: "Please review changes",
          action: { label: "Review", onClick: () => {} },
        });
        break;
      case "loading":
        (await import("sonner")).toast.promise(new Promise((r) => globalThis.setTimeout(r, 1200)), {
          loading: "Working...",
          success: "Done",
          error: "Failed",
        });
        break;
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button onClick={() => fire("success")}>Success</Button>
      <Button variant="outline" onClick={() => fire("error")}>
        Error
      </Button>
      <Button
        className="bg-amber-500 text-black hover:bg-amber-600"
        onClick={() => fire("warning")}
      >
        Warning
      </Button>
      <Button className="bg-sky-500 text-white hover:bg-sky-600" onClick={() => fire("info")}>
        Info
      </Button>
      <Button
        className="bg-brand text-brand-foreground hover:opacity-90"
        onClick={() => fire("cta")}
      >
        CTA
      </Button>
      <Button variant="ghost" onClick={() => fire("loading")}>
        Loading
      </Button>
    </div>
  );
}
