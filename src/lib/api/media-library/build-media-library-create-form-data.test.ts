import { describe, expect, it } from "vitest";

import { buildMediaLibraryCreateFormData } from "./build-media-library-create-form-data";

describe("buildMediaLibraryCreateFormData", () => {
  it("appends file and JSON-encoded metadata fields", () => {
    const file = new File(["x"], "club.jpg", { type: "image/jpeg" });
    const form = buildMediaLibraryCreateFormData(file, {
      title: "Club background",
      isActive: true,
      tags: ["clubhouse"],
      categoryAssignment: { type: "club-age", scope: "all", targets: [] },
      assetTypes: ["ALL"],
      markerPosition: [{ top: 50, left: 50 }],
    });

    expect(form.get("file")).toBeInstanceOf(File);
    expect((form.get("file") as File).name).toBe("club.jpg");
    expect(form.get("title")).toBe("Club background");
    expect(form.get("isActive")).toBe("true");
    expect(form.get("tags")).toBe(JSON.stringify(["clubhouse"]));
    expect(form.get("categoryAssignment")).toBe(
      JSON.stringify({ type: "club-age", scope: "all", targets: [] }),
    );
    expect(form.get("assetTypes")).toBe(JSON.stringify(["ALL"]));
    expect(form.has("assetType")).toBe(false);
    expect(form.get("markerPosition")).toBe(JSON.stringify([{ top: 50, left: 50 }]));
  });

  it("JSON-encodes a multi-value assetTypes array", () => {
    const file = new File(["x"], "club.jpg", { type: "image/jpeg" });
    const form = buildMediaLibraryCreateFormData(file, {
      assetTypes: ["Upcoming Fixtures", "Weekend Results"],
    });

    expect(form.get("assetTypes")).toBe(JSON.stringify(["Upcoming Fixtures", "Weekend Results"]));
    expect(form.has("assetType")).toBe(false);
  });

  it("omits assetTypes when metadata does not include them", () => {
    const file = new File(["x"], "club.jpg", { type: "image/jpeg" });
    const form = buildMediaLibraryCreateFormData(file, { title: "Club background" });

    expect(form.has("assetTypes")).toBe(false);
    expect(form.has("assetType")).toBe(false);
  });

  it("appends an explicit empty assetTypes array when provided", () => {
    const file = new File(["x"], "club.jpg", { type: "image/jpeg" });
    const form = buildMediaLibraryCreateFormData(file, { assetTypes: [] });

    expect(form.get("assetTypes")).toBe(JSON.stringify([]));
    expect(form.has("assetType")).toBe(false);
  });

  it("omits markerPosition when the array is empty", () => {
    const file = new File(["x"], "club.jpg", { type: "image/jpeg" });
    const form = buildMediaLibraryCreateFormData(file, { markerPosition: [] });

    expect(form.has("markerPosition")).toBe(false);
  });
});
